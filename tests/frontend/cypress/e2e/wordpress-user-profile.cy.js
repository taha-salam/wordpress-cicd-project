/**
 * WordPress User Profile Test Suite
 * Tests user profile editing and validation
 * Based on Equivalence Partitioning and Boundary Value Analysis
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress User Profile', () => {
  const profilePage = '/wp-admin/profile.php';
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

    cy.visit(profilePage);
    cy.get('form#your-profile').should('be.visible');
  });

  it('TC-PROFILE-01: Basic profile fields present', () => {
    cy.get('input#first_name').should('exist');
    cy.get('input#last_name').should('exist');
    cy.get('input#email').should('exist');
    cy.get('select#display_name').should('exist');
  });

  // ... (other tests remain the same)

  it('TC-PROFILE-13: Change password', () => {
    const newPassword = 'NewTestPassword123!';

    cy.get('button#generate-reset-password, button.wp-generate-pw').then(($btn) => {
      if ($btn.length > 0) {
        cy.wrap($btn).click();
        cy.wait(500);

        cy.get('#pass1, #pass1-text').then(($pass) => {
          if ($pass.length > 0) {
            cy.wrap($pass).clear({ force: true }).type(newPassword, { force: true });
          }
        });

        cy.get('#pass2, #pass2-text').then(($pass) => {
          if ($pass.length > 0) {
            cy.wrap($pass).clear({ force: true }).type(newPassword, { force: true });
          }
        });

        cy.get('input#submit').click();

        cy.get('#message, .notice-success, .updated').should('be.visible');
      }
    });
  });
});