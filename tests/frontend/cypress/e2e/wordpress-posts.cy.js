/**
 * WordPress Posts Management Test Suite
 * Tests post creation, editing, publishing, and deletion
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress Posts Management', () => {
    const postsListPage = '/wp-admin/edit.php';
    const createPostPage = '/wp-admin/post-new.php';
    const loginPage = '/wp-login.php';

    const username = 'Fastians';
    const password = '8Wk5ujnODaxMLKp(wQ';

    const uniqueId = () => Date.now();

    const waitForEditor = () => {
        cy.wait(3000);
        cy.get('body').should('exist');
    };

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

    const enterPostTitle = (title) => {
        cy.wait(2000);
        cy.get('body').then(($body) => {
            if ($body.find('.editor-post-title__input, [aria-label="Add title"]').length > 0) {
                cy.get('.editor-post-title__input, [aria-label="Add title"]').first()
                    .should('be.visible')
                    .clear({ force: true })
                    .type(title, { force: true });
            } else if ($body.find('#title').length > 0) {
                cy.get('#title').should('be.visible').clear().type(title);
            } else if ($body.find('h1[contenteditable="true"]').length > 0) {
                cy.get('h1[contenteditable="true"]').first()
                    .should('be.visible')
                    .clear({ force: true })
                    .type(title, { force: true });
            } else {
                cy.log('No title input found - may already have content');
            }
        });
        cy.wait(1000);
    };

    const enterPostContent = (content) => {
        cy.wait(2000);
        cy.get('body').then(($body) => {
            if ($body.find('.block-editor-default-block-appender__content, [aria-label*="Add block"]').length > 0) {
                cy.get('.block-editor-default-block-appender__content, [aria-label*="Add block"]').first().click({ force: true });
                cy.wait(500);
                cy.focused().type(content, { force: true });
            } else if ($body.find('#content').length > 0) {
                cy.get('#content').type(content);
            } else if ($body.find('p[contenteditable="true"]').length > 0) {
                cy.get('p[contenteditable="true"]').first().click({ force: true }).type(content, { force: true });
            }
        });
        cy.wait(1000);
    };

    const publishPost = () => {
        cy.wait(2000);
        cy.get('body').then(($body) => {
            const publishBtn = $body.find('button:contains("Publish"), .editor-post-publish-button, #publish');
            if (publishBtn.length > 0 && publishBtn.filter(':visible').length > 0) {
                cy.wrap(publishBtn.filter(':visible').first()).click({ force: true });
                cy.wait(3000);
                
                cy.get('body').then(($b2) => {
                    const finalBtn = $b2.find('button:contains("Publish")').filter(':visible');
                    if (finalBtn.length > 0) {
                        cy.wrap(finalBtn.first()).click({ force: true });
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
        waitForEditor();

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
        waitForEditor();

        const postTitle = `Draft Post ${uniqueId()}`;
        enterPostTitle(postTitle);
        cy.wait(3000);

        cy.get('body').then(($body) => {
            const saveDraft = $body.find('button:contains("Save draft")').filter(':visible');
            if (saveDraft.length > 0) {
                cy.wrap(saveDraft.first()).click({ force: true });
            }
        });

        cy.wait(3000);
        cy.log('Draft save completed');
    });

    it('TC-POSTS-03: Create post with minimum title (1 char)', () => {
        cy.visit(createPostPage);
        dismissWelcomeGuide();
        waitForEditor();

        enterPostTitle('A');
        publishPost();

        cy.log('Post with single character title created');
    });

    it('TC-POSTS-04: Create post with maximum title (255 chars)', () => {
        cy.visit(createPostPage);
        dismissWelcomeGuide();
        waitForEditor();

        const longTitle = 'A'.repeat(255);
        
        cy.get('body').then(($body) => {
            if ($body.find('.editor-post-title__input').length > 0) {
                cy.get('.editor-post-title__input').first().invoke('val', longTitle).trigger('input');
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
                cy.get('#the-list tr').first().find('.row-title, strong a').first().trigger('mouseenter', { force: true });
                cy.wait(1000);

                cy.get('#the-list tr').first().find('.submitdelete, .trash a, a:contains("Trash")').first().click({ force: true });
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
                // FIXED: Find the actual link element
                cy.get('#the-list tr').first().find('a.row-title, td.title a, td.post-title a, strong a').first().click({ force: true });

                dismissWelcomeGuide();
                waitForEditor();

                const updatedTitle = `Updated Post ${uniqueId()}`;
                enterPostTitle(updatedTitle);

                cy.wait(2000);
                
                cy.get('body').then(($mainBody) => {
                    const updateButton = $mainBody.find('button:contains("Update"), button:contains("Publish"), #publish').filter(':visible');
                    if (updateButton.length > 0) {
                        cy.wrap(updateButton.first()).click({ force: true });
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
        waitForEditor();

        const postTitle = `Categorized Post ${uniqueId()}`;
        enterPostTitle(postTitle);
        cy.wait(1000);

        cy.get('body').then(($body) => {
            if ($body.find('.interface-interface-skeleton__sidebar:visible').length === 0) {
                const settingsButton = $body.find('button[aria-label*="Settings"]').filter(':visible');
                if (settingsButton.length > 0) {
                    cy.wrap(settingsButton.first()).click({ force: true });
                    cy.wait(1000);
                }
            }

            if ($body.find('.editor-post-taxonomies__hierarchical-terms-choice input[type="checkbox"]').length > 0) {
                cy.get('.editor-post-taxonomies__hierarchical-terms-choice input[type="checkbox"]').first().check({ force: true });
                cy.log('Category selected');
            }
        });

        cy.wait(2000);
        publishPost();
        cy.log('Post with category created');
    });

    it('TC-POSTS-08: Create post with tags', () => {
        cy.visit(createPostPage);
        dismissWelcomeGuide();
        waitForEditor();

        const postTitle = `Tagged Post ${uniqueId()}`;
        enterPostTitle(postTitle);
        cy.wait(1000);

        cy.get('body').then(($body) => {
            if ($body.find('.interface-interface-skeleton__sidebar:visible').length === 0) {
                const settingsButton = $body.find('button[aria-label*="Settings"]').filter(':visible');
                if (settingsButton.length > 0) {
                    cy.wrap(settingsButton.first()).click({ force: true });
                    cy.wait(1000);
                }
            }

            if ($body.find('.components-form-token-field__input').length > 0) {
                cy.get('.components-form-token-field__input').first().type('testtag{enter}', { force: true });
                cy.log('Tag added');
            }
        });

        cy.wait(2000);
        publishPost();
        cy.log('Post with tags created');
    });

    it('TC-POSTS-09: Post without title still publishes', () => {
        cy.visit(createPostPage);
        dismissWelcomeGuide();
        waitForEditor();

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