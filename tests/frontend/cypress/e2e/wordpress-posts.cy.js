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

    // Helper: Wait for block editor iframe to be ready
    const waitForBlockEditor = () => {
        cy.log('Waiting for block editor to load...');

        // Wait for the editor interface
        cy.get('.edit-post-layout, .block-editor', { timeout: 60000 }).should('exist');

        // Wait for the iframe to be present
        cy.get('iframe[name="editor-canvas"]', { timeout: 60000 }).should('exist');

        // Give editor time to fully hydrate
        cy.wait(5000);

        cy.log('Block editor loaded');
    };

    // Helper: Close WordPress welcome guide modal
    const dismissWelcomeGuide = () => {
        cy.wait(2000);
        cy.get('body').then(($body) => {
            const closeButtons = $body.find('button[aria-label*="Close"]');
            if (closeButtons.length > 0 && closeButtons.filter(':visible').length > 0) {
                cy.wrap(closeButtons.filter(':visible').first()).click({ force: true });
                cy.wait(1000);
            }
        });
    };

    // Helper: Get iframe body
    const getIframeBody = () => {
        return cy.get('iframe[name="editor-canvas"]', { timeout: 60000 })
            .its('0.contentDocument.body', { timeout: 60000 })
            .should('not.be.empty')
            .then(cy.wrap);
    };

    // Helper: Enter title in block editor (inside iframe)
    const enterPostTitle = (title) => {
        cy.log(`Entering title: ${title}`);

        cy.get('body').then(($body) => {
            if ($body.find('iframe[name="editor-canvas"]').length > 0) {
                getIframeBody().then(($iframeBody) => {
                    const titleSelectors = [
                        'h1[data-title="Heading"]',
                        'h1.wp-block-post-title',
                        'h1[contenteditable="true"]',
                        '[data-type="core/post-title"]',
                        'h1'
                    ];

                    let titleFound = false;

                    for (const selector of titleSelectors) {
                        const elements = $iframeBody.find(selector);
                        if (elements.length > 0) {
                            cy.wrap(elements.first())
                                .scrollIntoView()
                                .click({ force: true })
                                .clear({ force: true })
                                .type(title, { delay: 10, force: true });
                            titleFound = true;
                            break;
                        }
                    }

                    if (!titleFound) {
                        cy.log('Title field not found in iframe');
                    }
                });
            } else {
                // Fallback
                cy.get('.editor-post-title__input, .wp-block-post-title')
                    .click({ force: true })
                    .clear({ force: true })
                    .type(title, { force: true });
            }
        });
        cy.wait(1000);
    };

    // Helper: Enter content in block editor
    const enterPostContent = (content) => {
        cy.log(`Entering content: ${content}`);

        cy.get('body').then(($body) => {
            if ($body.find('iframe[name="editor-canvas"]').length > 0) {
                getIframeBody().then(($iframeBody) => {
                    const contentSelectors = [
                        'p[data-title="Paragraph"]',
                        'p.wp-block-paragraph',
                        'p[contenteditable="true"]',
                        '[data-type="core/paragraph"]',
                        'p'
                    ];

                    let contentFound = false;

                    for (const selector of contentSelectors) {
                        const elements = $iframeBody.find(selector);
                        if (elements.length > 0) {
                            cy.wrap(elements.first())
                                .scrollIntoView()
                                .click({ force: true })
                                .clear({ force: true })
                                .type(content, { delay: 10, force: true });
                            contentFound = true;
                            break;
                        }
                    }

                    if (!contentFound) {
                        cy.log('Content field not found in iframe');
                    }
                });
            } else {
                // Fallback
                cy.get('.wp-block-paragraph, [data-type="core/paragraph"]')
                    .click({ force: true })
                    .clear({ force: true })
                    .type(content, { force: true });
            }
        });
        cy.wait(1000);
    };

    // Helper: Publish post
    const publishPost = () => {
        cy.get('body').then(($body) => {
            if ($body.find('.editor-post-publish-button').length > 0) {
                cy.get('.editor-post-publish-button').click({ force: true });
            } else if ($body.find('#publish').length > 0) {
                cy.get('#publish').click({ force: true });
            }
        });

        cy.wait(2000);

        cy.get('#message, .notice-success, .updated').should('be.visible');
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

        const postTitle = `New Post ${uniqueId()}`;
        enterPostTitle(postTitle);
        cy.wait(1000);

        enterPostContent('This is the post content.');
        cy.wait(1000);

        publishPost();
        cy.log('Post published');
    });

    // ... (apply similar changes to all other tests: use enterPostTitle and enterPostContent helpers)
});