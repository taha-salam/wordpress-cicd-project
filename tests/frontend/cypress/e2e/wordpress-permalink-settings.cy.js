/**
 * WordPress Permalink Settings Test Suite
 * Tests permalink structure configuration
 * Based on Equivalence Partitioning and Boundary Value Analysis
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress Permalink Settings', () => {
    const permalinkPage = '/wp-admin/options-permalink.php';
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

        cy.visit(permalinkPage);
        cy.get('input[name="selection"]').should('exist');
    });

    it('TC-PERMALINK-01: Set plain permalink structure', () => {
        // Target the radio button specifically
        cy.get('input[name="selection"][value=""]').click({ force: true });

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-permalink.php');
    });

    it('TC-PERMALINK-02: Set day and name permalink structure', () => {
        cy.get('input[value="/%year%/%monthnum%/%day%/%postname%/"]').check();

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-permalink.php');
    });

    it('TC-PERMALINK-03: Set month and name permalink structure', () => {
        cy.get('input[value="/%year%/%monthnum%/%postname%/"]').check();

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-permalink.php');
    });

    it('TC-PERMALINK-04: Set numeric permalink structure', () => {
        cy.get('input[value="/archives/%post_id%"]').check();

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-permalink.php');
    });

    it('TC-PERMALINK-05: Set post name permalink structure', () => {
        cy.get('input[value="/%postname%/"]').check();

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-permalink.php');
    });

    it('TC-PERMALINK-06: Set custom permalink structure', () => {
        cy.get('input[name="selection"][value="custom"]').check();
        cy.get('#permalink_structure').clear().type('/%category%/%postname%/');

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-permalink.php');
    });

    it('TC-PERMALINK-07: Set custom category base', () => {
        cy.get('#category_base').clear().type('topics');

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-permalink.php');
    });

    it('TC-PERMALINK-08: Set custom tag base', () => {
        cy.get('#tag_base').clear().type('labels');

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-permalink.php');
    });

    it('TC-PERMALINK-09: Clear category base', () => {
        cy.get('#category_base').clear();

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-permalink.php');
    });

    it('TC-PERMALINK-10: Clear tag base', () => {
        cy.get('#tag_base').clear();

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-permalink.php');
    });

    it('TC-PERMALINK-11: Validate custom structure with multiple tags', () => {
        cy.get('input[name="selection"][value="custom"]').check();
        cy.get('#permalink_structure').clear().type('/%year%/%monthnum%/%postname%/');

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-permalink.php');
    });

    it('TC-PERMALINK-12: Restore default permalink settings', () => {
        cy.get('input[value="/%postname%/"]').check();
        cy.get('#category_base').clear();
        cy.get('#tag_base').clear();

        cy.get('#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-permalink.php');
    });
});
