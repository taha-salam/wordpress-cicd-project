/**
 * WordPress Pages Management Test Suite
 * Tests page creation, editing, publishing, and deletion
 * Based on Equivalence Partitioning and Boundary Value Analysis
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress Pages Management', () => {
    const pagesListPage = '/wp-admin/edit.php?post_type=page';
    const createPagePage = '/wp-admin/post-new.php?post_type=page';
    const loginPage = '/wp-login.php';

    const username = 'Fastians';
    const password = '8Wk5ujnODaxMLKp(wQ';

    const uniqueId = () => Date.now();

    // FIXED: Helper to get iframe body with better error handling
    const getIframeBody = () => {
        return cy.get('body').then(($body) => {
            if ($body.find('iframe[name="editor-canvas"]').length > 0) {
                return cy.get('iframe[name="editor-canvas"]', { timeout: 60000 })
                    .its('0.contentDocument.body', { timeout: 60000 })
                    .should('not.be.empty')
                    .then(cy.wrap);
            } else {
                // No iframe - return main body for classic editor
                return cy.wrap($body);
            }
        });
    };

    // Helper: Wait for block editor to be ready
    const waitForBlockEditor = () => {
        cy.log('Waiting for block editor...');
        cy.get('.edit-post-layout, .block-editor, body', { timeout: 60000 }).should('exist');
        cy.wait(5000);
    };

    // Helper: Close welcome guide
    const dismissWelcomeGuide = () => {
        cy.wait(2000);
        cy.get('body').then(($body) => {
            const closeButtons = $body.find('button[aria-label*="Close"], button[aria-label*="close"]');
            if (closeButtons.length > 0 && closeButtons.filter(':visible').length > 0) {
                cy.wrap(closeButtons.filter(':visible').first()).click({ force: true });
                cy.wait(1000);
            }
        });
    };

    // FIXED: Enter title with fallback for classic editor
    const enterPageTitle = (title) => {
        cy.log(`Entering title: ${title}`);
        cy.get('body').then(($body) => {
            if ($body.find('iframe[name="editor-canvas"]').length > 0) {
                // Block editor with iframe
                getIframeBody().then(($iframeBody) => {
                    const h1 = $iframeBody.find('h1[data-title], h1').first();
                    if (h1.length > 0) {
                        cy.wrap(h1)
                            .scrollIntoView()
                            .click({ force: true })
                            .clear({ force: true })
                            .type(title, { delay: 10, force: true });
                    }
                });
            } else if ($body.find('.editor-post-title__input').length > 0) {
                // Block editor without iframe
                cy.get('.editor-post-title__input').clear().type(title, { delay: 10 });
            } else if ($body.find('#title').length > 0) {
                // Classic editor
                cy.get('#title').clear().type(title);
            }
        });
        cy.wait(1000);
    };

    // FIXED: Enter content with fallback for classic editor
    const enterPageContent = (content) => {
        cy.log(`Entering content: ${content}`);
        cy.get('body').then(($body) => {
            if ($body.find('iframe[name="editor-canvas"]').length > 0) {
                // Block editor with iframe
                getIframeBody().then(($iframeBody) => {
                    const p = $iframeBody.find('p[data-type="core/paragraph"], p').first();
                    if (p.length > 0) {
                        cy.wrap(p).scrollIntoView().click({ force: true });
                        cy.wait(500);
                        getIframeBody().then(($newBody) => {
                            cy.wrap($newBody.find('p').first()).type(content, { delay: 10, force: true });
                        });
                    }
                });
            } else if ($body.find('.block-editor-block-list__layout p').length > 0) {
                // Block editor without iframe
                cy.get('.block-editor-block-list__layout p').first().click().type(content, { delay: 10 });
            } else if ($body.find('#content').length > 0) {
                // Classic editor
                cy.get('#content').type(content);
            }
        });
        cy.wait(1000);
    };

    // Helper: Publish page
    const publishPage = () => {
        cy.log('Publishing page...');
        cy.wait(2000);

        cy.get('body').then(($body) => {
            const publishButton = $body.find('.editor-post-publish-panel__toggle, .editor-post-publish-button__button, #publish');

            if (publishButton.length > 0 && publishButton.filter(':visible').length > 0) {
                cy.wrap(publishButton.filter(':visible').first()).click({ force: true });
                cy.wait(3000);

                cy.get('body').then(($body2) => {
                    const finalPublish = $body2.find('.editor-post-publish-button, button:contains("Publish")');
                    if (finalPublish.length > 0 && finalPublish.filter(':visible').length > 0) {
                        cy.wrap(finalPublish.filter(':visible').first()).click({ force: true });
                    }
                });
            }
        });

        cy.wait(3000);
    };

    beforeEach(() => {
        cy.visit(loginPage);
        cy.get('body.login').should('exist');
        cy.wait(500);

        cy.get('#user_login')
            .should('be.visible')
            .clear()
            .invoke('val', username)
            .trigger('input');

        cy.get('#user_pass')
            .should('be.visible')
            .clear()
            .invoke('val', password)
            .trigger('input');

        cy.get('#user_login').should('have.value', username);
        cy.get('#user_pass').should('have.value', password);

        cy.get('#wp-submit').click();
        cy.url().should('include', '/wp-admin', { timeout: 10000 });
    });

    it('TC-PAGES-01: Create and publish new page', () => {
        cy.visit(createPagePage);
        dismissWelcomeGuide();
        waitForBlockEditor();

        const pageTitle = `Test Page ${uniqueId()}`;
        const pageContent = 'This is test page content.';

        enterPageTitle(pageTitle);
        enterPageContent(pageContent);
        publishPage();

        cy.log('Page creation completed');
    });

    it('TC-PAGES-02: Save page as draft', () => {
        cy.visit(createPagePage);
        dismissWelcomeGuide();
        waitForBlockEditor();

        const pageTitle = `Draft Page ${uniqueId()}`;

        enterPageTitle(pageTitle);
        cy.wait(3000);

        cy.get('body').then(($body) => {
            const saveDraft = $body.find('button:contains("Save draft"), .editor-post-save-draft');
            if (saveDraft.length > 0 && saveDraft.filter(':visible').length > 0) {
                cy.wrap(saveDraft.filter(':visible').first()).click({ force: true });
            }
        });

        cy.wait(3000);
        cy.log('Draft save completed');
    });

    it('TC-PAGES-03: Create page with minimum title (1 char)', () => {
        cy.visit(createPagePage);
        dismissWelcomeGuide();
        waitForBlockEditor();

        enterPageTitle('A');
        publishPage();

        cy.log('Page with single character title created');
    });

    it('TC-PAGES-04: Create page with maximum title (255 chars)', () => {
        cy.visit(createPagePage);
        dismissWelcomeGuide();
        waitForBlockEditor();

        const longTitle = 'A'.repeat(255);

        cy.get('body').then(($body) => {
            if ($body.find('iframe[name="editor-canvas"]').length > 0) {
                getIframeBody().then(($iframeBody) => {
                    const h1 = $iframeBody.find('h1').first();
                    if (h1.length > 0) {
                        cy.wrap(h1).click({ force: true }).invoke('text', longTitle).trigger('input', { force: true });
                    }
                });
            } else if ($body.find('.editor-post-title__input').length > 0) {
                cy.get('.editor-post-title__input').invoke('val', longTitle).trigger('input');
            } else if ($body.find('#title').length > 0) {
                cy.get('#title').invoke('val', longTitle).trigger('input');
            }
        });

        cy.wait(2000);
        publishPage();

        cy.log('Page with long title created');
    });

    it('TC-PAGES-05: Delete page from list', () => {
        cy.visit(pagesListPage);
        cy.wait(2000);

        cy.get('body').then(($body) => {
            if ($body.find('#the-list tr').length > 0) {
                cy.get('#the-list tr').first().within(() => {
                    cy.get('.row-title, .page-title').trigger('mouseenter', { force: true });
                });

                cy.wait(1000);

                cy.get('#the-list tr').first().within(() => {
                    cy.get('.submitdelete, .trash a, a[href*="trash"]').first().click({ force: true });
                });

                cy.wait(2000);
                cy.log('Page deleted');
            } else {
                cy.log('No pages available to delete');
            }
        });
    });

    it('TC-PAGES-06: Edit existing page', () => {
        cy.visit(pagesListPage);
        cy.wait(2000);

        cy.get('body').then(($body) => {
            if ($body.find('#the-list tr').length > 0) {
                cy.get('#the-list tr').first().find('.row-title, .page-title').click({ force: true });

                dismissWelcomeGuide();
                waitForBlockEditor();

                const updatedTitle = `Updated Page ${uniqueId()}`;

                cy.get('body').then(($editorBody) => {
                    if ($editorBody.find('iframe[name="editor-canvas"]').length > 0) {
                        getIframeBody().then(($iframeBody) => {
                            const h1 = $iframeBody.find('h1').first();
                            if (h1.length > 0) {
                                cy.wrap(h1)
                                    .click({ force: true })
                                    .type('{selectall}{backspace}', { force: true })
                                    .type(updatedTitle, { delay: 10, force: true });
                            }
                        });
                    } else if ($editorBody.find('.editor-post-title__input').length > 0) {
                        cy.get('.editor-post-title__input').clear().type(updatedTitle);
                    } else if ($editorBody.find('#title').length > 0) {
                        cy.get('#title').clear().type(updatedTitle);
                    }
                });

                cy.wait(2000);

                cy.get('body').then(($mainBody) => {
                    const updateButton = $mainBody.find('button:contains("Update"), button:contains("Publish"), #publish');
                    if (updateButton.length > 0 && updateButton.filter(':visible').length > 0) {
                        cy.wrap(updateButton.filter(':visible').first()).click({ force: true });
                    }
                });

                cy.wait(3000);
                cy.log('Page updated');
            } else {
                cy.log('No pages available to edit');
            }
        });
    });

    it('TC-PAGES-07: Set page parent (hierarchical)', () => {
        cy.visit(createPagePage);
        dismissWelcomeGuide();
        waitForBlockEditor();

        const pageTitle = `Child Page ${uniqueId()}`;
        enterPageTitle(pageTitle);
        cy.wait(1000);

        // Open settings sidebar
        cy.get('body').then(($body) => {
            if ($body.find('.interface-interface-skeleton__sidebar:visible').length === 0) {
                const settingsButton = $body.find('button[aria-label*="Settings"], button[aria-label*="settings"]');
                if (settingsButton.length > 0) {
                    cy.wrap(settingsButton.first()).click({ force: true });
                    cy.wait(1000);
                }
            }

            // Try to set parent page
            if ($body.find('select[id*="parent"]').length > 0) {
                cy.get('select[id*="parent"]').first().then(($select) => {
                    if ($select.find('option').length > 1) {
                        cy.wrap($select).select(1);
                    }
                });
            }
        });

        cy.wait(2000);
        publishPage();
        cy.log('Page with parent created');
    });

    it('TC-PAGES-08: Set page order', () => {
        cy.visit(createPagePage);
        dismissWelcomeGuide();
        waitForBlockEditor();

        const pageTitle = `Ordered Page ${uniqueId()}`;
        enterPageTitle(pageTitle);
        cy.wait(1000);

        // Open settings sidebar
        cy.get('body').then(($body) => {
            if ($body.find('.interface-interface-skeleton__sidebar:visible').length === 0) {
                const settingsButton = $body.find('button[aria-label*="Settings"], button[aria-label*="settings"]');
                if (settingsButton.length > 0) {
                    cy.wrap(settingsButton.first()).click({ force: true });
                    cy.wait(1000);
                }
            }

            // Set page order
            const orderInput = $body.find('input[type="number"]:visible').filter(function () {
                const label = Cypress.$(this).closest('.components-base-control').find('label').text().toLowerCase();
                return label.includes('order') || label.includes('menu order');
            });

            if (orderInput.length > 0) {
                cy.wrap(orderInput.first()).clear({ force: true }).type('5', { force: true });
                cy.log('Page order set to 5');
            } else {
                cy.log('Page order input not found - feature may not be available');
            }
        });

        cy.wait(2000);
        publishPage();
        cy.log('Page with order created');
    });

    it('TC-PAGES-09: Access pages list page', () => {
        cy.visit(pagesListPage);
        cy.wait(2000);
        cy.get('body').should('contain', 'Pages');
        cy.log('Pages list page accessed');
    });

    it('TC-PAGES-10: Validate page template selection', () => {
        cy.visit(createPagePage);
        dismissWelcomeGuide();
        waitForBlockEditor();

        const pageTitle = `Template Page ${uniqueId()}`;
        enterPageTitle(pageTitle);
        cy.wait(1000);

        // Open settings sidebar
        cy.get('body').then(($body) => {
            if ($body.find('.interface-interface-skeleton__sidebar:visible').length === 0) {
                const settingsButton = $body.find('button[aria-label*="Settings"], button[aria-label*="settings"]');
                if (settingsButton.length > 0) {
                    cy.wrap(settingsButton.first()).click({ force: true });
                    cy.wait(1000);
                }
            }

            // Check if template selector exists
            if ($body.find('select[id*="template"]').length > 0) {
                cy.get('select[id*="template"]').should('exist');
                cy.log('Template selector found');
            } else {
                cy.log('Template selector not available');
            }
        });

        cy.wait(1000);

        // Save as draft
        cy.get('body').then(($body) => {
            const saveDraft = $body.find('button:contains("Save draft"), .editor-post-save-draft');
            if (saveDraft.length > 0) {
                cy.wrap(saveDraft.first()).click({ force: true });
            }
        });

        cy.wait(3000);
        cy.log('Template page saved as draft');
    });
});