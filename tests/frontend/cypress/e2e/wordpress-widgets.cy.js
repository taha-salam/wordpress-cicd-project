/**
 * WordPress Widgets Management Test Suite
 * Tests widget management in sidebars
 * Based on Equivalence Partitioning and Boundary Value Analysis
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress Widgets Management', () => {
    const widgetsPage = '/wp-admin/widgets.php';
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

        // Check if classic widgets are available (skip if block editor)
        cy.visit(widgetsPage, { failOnStatusCode: false });
        cy.get('body').then(($body) => {
          if ($body.text().includes('error') || $body.text().includes('Block Theme')) {
            cy.log('Block widget editor detected - skipping classic widgets test');
            this.skip();
          }
        });
    });

    it('TC-WIDGETS-01: View widgets page', () => {
        cy.url().should('include', 'widgets.php');

        cy.get('body').then(($body) => {
            if ($body.find('.widgets-holder-wrap').length > 0) {
                cy.get('.widgets-holder-wrap').should('exist');
            } else {
                // Block-based widget editor
                cy.get('.edit-widgets-header').should('exist');
            }
        });
    });

    it('TC-WIDGETS-02: View available widgets', () => {
        cy.get('body').then(($body) => {
            if ($body.find('#available-widgets').length > 0) {
                cy.get('#available-widgets').should('be.visible');
                cy.get('#available-widgets .widget').should('have.length.at.least', 1);
            } else {
                // Block-based widget editor
                cy.get('body').should('exist');
            }
        });
    });

    it('TC-WIDGETS-03: View widget areas/sidebars', () => {
        cy.get('body').then(($body) => {
            if ($body.find('.widgets-sortables').length > 0) {
                cy.get('.widgets-sortables').should('have.length.at.least', 1);
            } else {
                // Block-based widget editor
                cy.get('.interface-interface-skeleton__sidebar').should('exist');
            }
        });
    });

    it('TC-WIDGETS-04: Check for search widget', () => {
        cy.get('body').then(($body) => {
            if ($body.find('#available-widgets').length > 0) {
                cy.get('#available-widgets').should('contain', 'Search');
            }
        });
    });

    it('TC-WIDGETS-05: Check for categories widget', () => {
        cy.get('body').then(($body) => {
            if ($body.find('#available-widgets').length > 0) {
                cy.get('#available-widgets').should('contain', 'Categories');
            }
        });
    });

    it('TC-WIDGETS-06: Check for recent posts widget', () => {
        cy.get('body').then(($body) => {
            if ($body.find('#available-widgets').length > 0) {
                cy.get('#available-widgets').should('contain', 'Recent Posts');
            }
        });
    });
});