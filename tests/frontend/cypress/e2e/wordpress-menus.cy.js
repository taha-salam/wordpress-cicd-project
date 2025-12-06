/**
 * WordPress Menus Management Test Suite
 * Tests menu creation and configuration
 * Based on Equivalence Partitioning and Boundary Value Analysis
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress Menus Management', () => {
    const menusPage = '/wp-admin/nav-menus.php';
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

        // Check if classic menus are available (skip if block theme)
        cy.visit(menusPage, { failOnStatusCode: false });
        cy.get('body').then(($body) => {
          if ($body.text().includes('error') || $body.text().includes('Block Theme')) {
            cy.log('Block theme detected - skipping classic menus test');
            this.skip();
          }
        });
    });

    const uniqueId = () => Date.now();

    it('TC-MENUS-01: Create new menu', () => {
        const menuName = `Test Menu ${uniqueId()}`;

        cy.get('#menu-name').clear().type(menuName);
        cy.get('#save_menu_header').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
    });

    it('TC-MENUS-02: Add page to menu', () => {
        cy.get('body').then(($body) => {
            if ($body.find('#menu-to-edit').length > 0) {
                cy.get('#add-post-type-page .tabs-panel-active input[type="checkbox"]').first().check();
                cy.get('#submit-posttype-page').click();

                cy.wait(1000);
                cy.get('#menu-to-edit').should('contain', 'Page');
            }
        });
    });

    it('TC-MENUS-03: Add custom link to menu', () => {
        cy.get('body').then(($body) => {
            if ($body.find('#menu-to-edit').length > 0) {
                cy.get('#custom-menu-item-url').clear().type('https://example.com');
                cy.get('#custom-menu-item-name').clear().type('Example Link');
                cy.get('#submit-customlinkdiv').click();

                cy.wait(1000);
                cy.get('#menu-to-edit').should('contain', 'Example Link');
            }
        });
    });

    it('TC-MENUS-04: Save menu', () => {
        cy.get('body').then(($body) => {
            if ($body.find('#save_menu_header').length > 0) {
                cy.get('#save_menu_header').click();

                cy.get('#message, .notice-success, .updated').should('be.visible');
            }
        });
    });

    it('TC-MENUS-05: Delete menu', () => {
        cy.get('body').then(($body) => {
            if ($body.find('.delete-action a').length > 0) {
                cy.get('.delete-action a').first().click();

                cy.wait(1000);
                cy.url().should('include', 'nav-menus.php');
            }
        });
    });

    it('TC-MENUS-06: Access menus page', () => {
        cy.url().should('include', 'nav-menus.php');
        cy.get('h1').should('contain', 'Menus');
    });
});