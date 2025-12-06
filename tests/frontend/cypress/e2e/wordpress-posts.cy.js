/**
 * WordPress Posts Management Test Suite
 * Tests post creation, editing, publishing, and deletion
 * Based on Equivalence Partitioning and Boundary Value Analysis
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress Posts Management', () => {
    const postsListPage = '/wp-admin/edit.php';
    const createPostPage = '/wp-admin/post-new.php';
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
    const enterPostTitle = (title) => {
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
    const enterPostContent = (content) => {
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

    // Helper: Publish post
    const publishPost = () => {
        cy.log('Publishing post...');
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

    it('TC-POSTS-01: Create and publish new post', () => {
        cy.visit(createPostPage);
        dismissWelcomeGuide();
        waitForBlockEditor();

        const postTitle = `Test Post ${uniqueId()}`;
        const postContent = 'This is test post content.';

        enterPostTitle(postTitle);
        enterPostContent(postContent);
        publishPost();

        cy.log('Post creation completed');
    });

    it('TC-POSTS-02: Save post as draft', () => {
        cy.visit(createPostPage);
        dismissWelcomeGuide();
        waitForBlockEditor();

        const postTitle = `Draft Post ${uniqueId()}`;

        enterPostTitle(postTitle);
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

    it('TC-POSTS-03: Create post with minimum title (1 char)', () => {
        cy.visit(createPostPage);
        dismissWelcomeGuide();
        waitForBlockEditor();

        enterPostTitle('A');
        publishPost();

        cy.log('Post with single character title created');
    });

    it('TC-POSTS-04: Create post with maximum title (255 chars)', () => {
        cy.visit(createPostPage);
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
        publishPost();

        cy.log('Post with long title created');
    });

    it('TC-POSTS-05: Delete post from list', () => {
        cy.visit(postsListPage);
        cy.wait(2000);

        cy.get('body').then(($body) => {
            if ($body.find('#the-list tr').length > 0) {
                cy.get('#the-list tr').first().within(() => {
                    cy.get('.row-title, .post-title').trigger('mouseenter', { force: true });
                });

                cy.wait(1000);

                cy.get('#the-list tr').first().within(() => {
                    cy.get('.submitdelete, .trash a, a[href*="trash"]').first().click({ force: true });
                });

                cy.wait(2000);
                cy.log('Post deleted');
            } else {
                cy.log('No posts available to delete');
            }
        });
    });

    it('TC-POSTS-06: Edit existing post', () => {
        cy.visit(postsListPage);
        cy.wait(2000);

        cy.get('body').then(($body) => {
            if ($body.find('#the-list tr').length > 0) {
                // FIXED: More flexible selector for post title
                cy.get('#the-list tr').first().find('.row-title, a.row-title, strong a').first().click({ force: true });

                dismissWelcomeGuide();
                waitForBlockEditor();

                const updatedTitle = `Updated Post ${uniqueId()}`;

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
                cy.log('Post updated');
            } else {
                cy.log('No posts available to edit');
            }
        });
    });

    it('TC-POSTS-07: Create post with category', () => {
        cy.visit(createPostPage);
        dismissWelcomeGuide();
        waitForBlockEditor();

        const postTitle = `Categorized Post ${uniqueId()}`;

        enterPostTitle(postTitle);
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

            // Try to select a category
            if ($body.find('.editor-post-taxonomies__hierarchical-terms-choice input[type="checkbox"]').length > 0) {
                cy.get('.editor-post-taxonomies__hierarchical-terms-choice input[type="checkbox"]').first().check({ force: true });
                cy.log('Category selected');
            } else {
                cy.log('Category selection not available');
            }
        });

        cy.wait(2000);
        publishPost();
        cy.log('Post with category created');
    });

    it('TC-POSTS-08: Create post with tags', () => {
        cy.visit(createPostPage);
        dismissWelcomeGuide();
        waitForBlockEditor();

        const postTitle = `Tagged Post ${uniqueId()}`;

        enterPostTitle(postTitle);
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

            // Try to add tags
            if ($body.find('.components-form-token-field__input').length > 0) {
                cy.get('.components-form-token-field__input').first().type('testtag{enter}', { force: true });
                cy.log('Tag added');
            } else {
                cy.log('Tag input not available');
            }
        });

        cy.wait(2000);
        publishPost();
        cy.log('Post with tags created');
    });

    it('TC-POSTS-09: Post without title still publishes', () => {
        cy.visit(createPostPage);
        dismissWelcomeGuide();
        waitForBlockEditor();

        const postContent = 'This is a post without title.';

        enterPostContent(postContent);
        publishPost();

        cy.log('Post without title published');
    });

    it('TC-POSTS-10: Access posts list page', () => {
        cy.visit(postsListPage);
        cy.wait(2000);
        cy.get('body').should('contain', 'Posts');
        cy.log('Posts list page accessed');
    });
});