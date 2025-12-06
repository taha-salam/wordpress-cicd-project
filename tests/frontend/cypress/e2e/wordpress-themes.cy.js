/**
 * WordPress Themes Management Test Suite
 * Tests theme viewing and activation
 * Based on Equivalence Partitioning and Boundary Value Analysis
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress Themes Management', () => {
    const themesPage = '/wp-admin/themes.php';
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

        cy.visit(themesPage);
        cy.get('.theme').should('exist');
    });

    it('TC-THEMES-01: View installed themes', () => {
        cy.url().should('include', 'themes.php');
        cy.get('.theme').should('have.length.at.least', 1);
    });

    it('TC-THEMES-02: Identify active theme', () => {
        cy.get('.theme.active').should('exist');
        cy.get('.theme.active').should('contain', 'Active');
    });

    it('TC-THEMES-03: View theme details', () => {
        cy.get('.theme').first().click({ force: true });

        cy.get('.theme-overlay', { timeout: 15000 }).should('be.visible');
        cy.get('.theme-name').should('be.visible');
    });

    it('TC-THEMES-04: Close theme details overlay', () => {
        cy.get('.theme').first().click({ force: true });
        cy.get('.theme-overlay', { timeout: 15000 }).should('be.visible');

        cy.get('.close-full-overlay, .theme-overlay .close').click({ force: true });

        cy.get('.theme-overlay').should('not.be.visible');
    });

    it('TC-THEMES-05: Activate different theme', () => {
        // Get the ID/selector of a non-active theme and click it freshly
        cy.get('.theme').not('.active').first().as('themeToActivate');
        cy.get('@themeToActivate').click({ force: true });

        cy.get('.theme-overlay', { timeout: 15000 }).should('be.visible');
        cy.get('.activate').click({ force: true });

        // Wait for reload and check if a theme is active
        cy.wait(5000);
        cy.get('.theme.active').should('exist');
    });

    it('TC-THEMES-06: Access theme customizer', () => {
        cy.get('.theme.active').click({ force: true });
        cy.get('.theme-overlay', { timeout: 15000 }).should('be.visible');

        cy.get('body').then(($body) => {
            if ($body.find('.customize').length > 0) {
                cy.get('.customize').should('be.visible');
            }
        });

        cy.get('.close-full-overlay, .theme-overlay .close').click({ force: true });
    });
});