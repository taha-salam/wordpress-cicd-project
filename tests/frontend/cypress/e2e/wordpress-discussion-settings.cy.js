/**
 * WordPress Discussion Settings Test Suite
 * Tests comment and discussion configuration settings
 * Based on Equivalence Partitioning and Boundary Value Analysis
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress Discussion Settings', () => {
    const discussionSettingsPage = '/wp-admin/options-discussion.php';
    const loginPage = '/wp-login.php';

    const username = 'Fastians';
    const password = '8Wk5ujnODaxMLKp(wQ';

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

        cy.visit(discussionSettingsPage);
        cy.get('form').should('be.visible');
    });

    it('TC-DISCUSSION-01: Enable comments on new posts', () => {
        cy.get('#default_pingback_flag').check();
        cy.get('#default_ping_status').check();
        cy.get('#default_comment_status').check();

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-discussion.php');
    });

    it('TC-DISCUSSION-02: Disable comments on new posts', () => {
        cy.get('#default_comment_status').uncheck();

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-discussion.php');
    });

    it('TC-DISCUSSION-03: Require user registration for comments', () => {
        cy.get('#comment_registration').check();

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-discussion.php');
    });

    it('TC-DISCUSSION-04: Disable registration requirement', () => {
        cy.get('#comment_registration').uncheck();

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-discussion.php');
    });

    it('TC-DISCUSSION-05: Enable comment moderation', () => {
        cy.get('#comment_moderation').check();

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-discussion.php');
    });

    it('TC-DISCUSSION-06: Set comment moderation threshold', () => {
        cy.get('#comment_max_links').clear().type('5');

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-discussion.php');
    });

    it('TC-DISCUSSION-07: Enable email notifications for comments', () => {
        cy.get('#comments_notify').check();
        cy.get('#moderation_notify').check();

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-discussion.php');
    });

    it('TC-DISCUSSION-08: Disable email notifications', () => {
        cy.get('#comments_notify').uncheck();
        cy.get('#moderation_notify').uncheck();

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-discussion.php');
    });

    it('TC-DISCUSSION-09: Enable avatars', () => {
        cy.get('#show_avatars').check();

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-discussion.php');
    });

    it('TC-DISCUSSION-10: Disable avatars', () => {
        cy.get('#show_avatars').uncheck();

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-discussion.php');
    });

    it('TC-DISCUSSION-11: Set default avatar', () => {
        cy.get('#show_avatars').check();
        cy.get('input[name="avatar_default"]').first().check();

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-discussion.php');
    });

    it('TC-DISCUSSION-12: Restore default discussion settings', () => {
        cy.get('#default_comment_status').check();
        cy.get('#comment_registration').uncheck();
        cy.get('#comment_moderation').uncheck();
        cy.get('#comment_max_links').clear().type('2');
        cy.get('#comments_notify').check();
        cy.get('#show_avatars').check();

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-discussion.php');
    });
});
