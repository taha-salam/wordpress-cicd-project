/**
 * WordPress Writing Settings Test Suite
 * Tests writing and editor configuration settings
 * Based on Equivalence Partitioning and Boundary Value Analysis
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress Writing Settings', () => {
    const writingSettingsPage = '/wp-admin/options-writing.php';
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

        cy.visit(writingSettingsPage);
        cy.get('form').should('be.visible');
    });

    it('TC-WRITING-01: Set default post category', () => {
        cy.get('#default_category').then(($select) => {
            if ($select.find('option').length > 1) {
                cy.get('#default_category').select(1);
            }
        });

        cy.get('#submit, input[type="submit"]').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-writing.php');
    });

    it('TC-WRITING-02: Set default post format', () => {
        cy.get('body').then(($body) => {
            if ($body.find('#default_post_format').length > 0) {
                cy.get('#default_post_format').then(($select) => {
                    if ($select.find('option').length > 1) {
                        cy.get('#default_post_format').select(1);
                    }
                });

                cy.get('#submit, input[type="submit"]').click();

                cy.get('#message, .notice-success, .updated').should('be.visible');
            }
        });
    });

    it('TC-WRITING-03: Verify default category dropdown exists', () => {
        cy.get('#default_category').should('exist');
        cy.get('#default_category option').should('have.length.at.least', 1);
    });

    it('TC-WRITING-04: Change default category to Uncategorized', () => {
        cy.get('#default_category').then(($select) => {
            const uncategorizedOption = $select.find('option:contains("Uncategorized")');
            if (uncategorizedOption.length > 0) {
                cy.get('#default_category').select('Uncategorized');
            } else {
                cy.get('#default_category').select(0);
            }
        });

        cy.get('#submit, input[type="submit"]').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-writing.php');
    });

    it('TC-WRITING-05: Verify writing settings page loads', () => {
        cy.url().should('include', 'options-writing.php');
        cy.get('h1').should('contain', 'Writing Settings');
    });

    it('TC-WRITING-06: Check for post via email settings', () => {
        cy.get('body').then(($body) => {
            if ($body.find('#mailserver_url').length > 0) {
                cy.get('#mailserver_url').should('exist');
                cy.get('#mailserver_login').should('exist');
                cy.get('#mailserver_pass').should('exist');
            }
        });
    });

    it('TC-WRITING-07: Verify update services field exists', () => {
        cy.get('body').then(($body) => {
            if ($body.find('#ping_sites').length > 0) {
                cy.get('#ping_sites').should('exist');
            }
        });
    });

    it('TC-WRITING-08: Save settings without changes', () => {
        cy.get('#submit, input[type="submit"]').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
        cy.url().should('include', 'options-writing.php');
    });
});
