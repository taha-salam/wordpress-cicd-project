/**
 * WordPress User List Test Suite
 * Tests user list viewing and management operations
 * Based on Equivalence Partitioning and Boundary Value Analysis
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress User List', () => {
    const usersPage = '/wp-admin/users.php';
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

        cy.visit(usersPage);
        cy.get('.wp-list-table').should('be.visible');
    });

    it('TC-USERLIST-01: View users list page', () => {
        cy.url().should('include', 'users.php');
        cy.get('.wp-list-table').should('be.visible');
        cy.get('.page-title-action').should('exist');
    });

    it('TC-USERLIST-02: Display user row actions on hover', () => {
        cy.get('#the-list tr').first().within(() => {
            cy.get('.column-username').trigger('mouseenter'); // Changed from .row-title
            cy.get('.row-actions').should('be.visible');
            cy.get('.row-actions').within(() => {
                cy.contains('Edit').should('be.visible');
            });
        });
    });

    it('TC-USERLIST-03: Filter users by role', () => {
        cy.get('.subsubsub').then(($subsubsub) => {
            if ($subsubsub.find('a').length > 1) {
                cy.get('.subsubsub a').eq(1).click();
                cy.wait(1000);
                cy.get('.wp-list-table').should('be.visible');
            }
        });
    });

    it('TC-USERLIST-04: Search for user', () => {
        cy.get('#user-search-input').type(username);
        cy.get('#search-submit').click();

        cy.wait(1000);
        cy.get('.wp-list-table').should('be.visible');
    });

    it('TC-USERLIST-05: View user profile from list', () => {
        cy.get('#the-list tr').first().within(() => {
            cy.get('.column-username').trigger('mouseenter');
            cy.get('.row-actions a').contains('Edit').click({ force: true });
        });

        // Flexible: could be user-edit or profile
        cy.url().should('match', /user-edit\.php|profile\.php/);
        cy.get('form#your-profile').should('be.visible');
    });

    it('TC-USERLIST-06: Check user columns display', () => {
        cy.get('.wp-list-table thead th').should('contain', 'Username');
        cy.get('.wp-list-table thead th').should('contain', 'Name');
        cy.get('.wp-list-table thead th').should('contain', 'Email');
        cy.get('.wp-list-table thead th').should('contain', 'Role');
    });

    it('TC-USERLIST-07: Verify pagination exists with multiple users', () => {
        cy.get('body').then(($body) => {
            if ($body.find('.tablenav-pages').length > 0) {
                cy.get('.tablenav-pages').should('be.visible');
            }
        });
    });

    it('TC-USERLIST-08: Access add new user page', () => {
        cy.get('.page-title-action').click();

        cy.url().should('include', 'user-new.php');
        cy.get('#user_login').should('be.visible');
    });
});