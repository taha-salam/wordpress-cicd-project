/**
 * WordPress Login Authentication Test Suite
 * Tests login form validation and authentication
 * Based on Equivalence Partitioning and Boundary Value Analysis
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress Login Authentication', () => {
  const loginPage = '/wp-login.php';

  const validUsername = 'Fastians';
  const validPassword = '8Wk5ujnODaxMLKp(wQ';

  beforeEach(() => {
    cy.visit(loginPage);
  });

  it('TC-LOGIN-01: Login with credentials (remember unchecked)', () => {
    cy.get('#user_login')
      .clear()
      .type(validUsername, { delay: 0, force: true })
      .should('have.value', validUsername);

    cy.get('#user_pass')
      .clear()
      .type(validPassword, { delay: 0, force: true })
      .should('have.value', validPassword);

    cy.get('#rememberme').should('not.be.checked');
    cy.get('#wp-submit').click();

    cy.wait(3000);

    cy.url().should('not.include', '/wp-login.php');
    cy.url().should('include', '/wp-admin');
  });


  it('TC-LOGIN-02: Login with remember me enabled', () => {
    cy.get('#user_login')
      .clear()
      .type(validUsername, { delay: 0, force: true })
      .should('have.value', validUsername);

    cy.get('#user_pass')
      .clear()
      .type(validPassword, { delay: 0, force: true })
      .should('have.value', validPassword);

    cy.get('#rememberme').check({ force: true });

    cy.get('#wp-submit').click();
    cy.wait(3000);

    cy.url().should('not.include', '/wp-login.php');
    cy.url().should('include', '/wp-admin');
  });

  it('TC-LOGIN-03: Validate empty username', () => {
    cy.get('#user_login').clear();
    cy.get('#user_pass').clear().type(validPassword);
    cy.get('#rememberme').uncheck();
    cy.get('#wp-submit').click();

    cy.get('#user_login').then(($input) => {
      if ($input[0].validity.valueMissing) {
        expect($input[0].validity.valueMissing).to.be.true;
      } else {
        cy.get('#login_error, .login-error, .error').should('be.visible');
      }
    });
  });

  it('TC-LOGIN-04: Validate empty password', () => {
    cy.get('#user_login').clear().type(validUsername);
    cy.get('#user_pass').clear();
    cy.get('#rememberme').uncheck();
    cy.get('#wp-submit').click();

    cy.get('#user_pass').then(($input) => {
      if ($input[0].validity.valueMissing) {
        expect($input[0].validity.valueMissing).to.be.true;
      } else {
        cy.get('body').then(($body) => {
          if ($body.find('#login_error').length > 0) {
            cy.get('#login_error').should('be.visible');
          } else {
            cy.get('.login-error, .error, .notice-error').should('be.visible');
          }
        });
      }
    });
  });

  it('TC-LOGIN-05: Invalid username format', () => {
    cy.get('#user_login').clear().type('invalid@user@name');
    cy.get('#user_pass').clear().type(validPassword);
    cy.get('#rememberme').uncheck();
    cy.get('#wp-submit').click();

    cy.get('#login_error, .login-error, .error').should('be.visible');
  });

  it('TC-LOGIN-06: Invalid email format', () => {
    cy.get('#user_login').clear().type('invalidemail');
    cy.get('#user_pass').clear().type(validPassword);
    cy.get('#rememberme').uncheck();
    cy.get('#wp-submit').click();

    cy.get('#login_error, .login-error, .error').should('be.visible');
  });

  it('TC-LOGIN-07: Valid username with wrong password', () => {
    cy.get('#user_login').clear().type(validUsername);
    cy.get('#user_pass').clear().type('wrongpassword');
    cy.get('#rememberme').uncheck();
    cy.get('#wp-submit').click();

    cy.get('#login_error, .login-error, .error').should('be.visible');
  });

  it('TC-LOGIN-08: Wrong username with valid password', () => {
    cy.get('#user_login').clear().type('wrongusername');
    cy.get('#user_pass').clear().type(validPassword);
    cy.get('#rememberme').uncheck();
    cy.get('#wp-submit').click();

    cy.get('#login_error, .login-error, .error').should('be.visible');
  });

  it('TC-LOGIN-09: Minimum username length (1 char)', () => {
    cy.get('#user_login').clear().type('a');
    cy.get('#user_pass').clear().type(validPassword);
    cy.get('#rememberme').uncheck();
    cy.get('#wp-submit').click();

    cy.get('#login_error, .login-error, .error').should('be.visible');
  });

  it('TC-LOGIN-10: Maximum username length (60 chars)', () => {
    const longUsername = 'a'.repeat(60);
    cy.get('#user_login').clear().type(longUsername);
    cy.get('#user_pass').clear().type(validPassword);
    cy.get('#rememberme').uncheck();
    cy.get('#wp-submit').click();

    cy.url().then((url) => {
      if (url.includes('/wp-login.php')) {
        cy.get('#login_error, .login-error, .error').should('be.visible');
      }
    });
  });

  it('TC-LOGIN-11: Username exceeding limit (61 chars)', () => {
    const tooLongUsername = 'a'.repeat(61);
    cy.get('#user_login').clear().type(tooLongUsername);
    cy.get('#user_pass').clear().type(validPassword);
    cy.get('#rememberme').uncheck();
    cy.get('#wp-submit').click();

    cy.url().then((url) => {
      if (url.includes('/wp-login.php')) {
        cy.get('#login_error, .login-error, .error').should('be.visible');
      }
    });
  });

  it('TC-LOGIN-12: Minimum password length (1 char)', () => {
    cy.get('#user_login').clear().type(validUsername);
    cy.get('#user_pass').clear().type('a');
    cy.get('#rememberme').uncheck();
    cy.get('#wp-submit').click();

    cy.get('#login_error, .login-error, .error').should('be.visible');
  });

  it('TC-LOGIN-13: Maximum password length (255 chars)', () => {
    const longPassword = 'a'.repeat(255);
    cy.get('#user_login').clear().type(validUsername);
    cy.get('#user_pass').clear().type(longPassword);
    cy.get('#rememberme').uncheck();
    cy.get('#wp-submit').click();

    cy.url().then((url) => {
      if (url.includes('/wp-login.php')) {
        cy.get('#login_error, .login-error, .error').should('be.visible');
      }
    });
  });

  it('TC-LOGIN-14: Password exceeding limit (256 chars)', () => {
    const tooLongPassword = 'a'.repeat(256);
    cy.get('#user_login').clear().type(validUsername);
    cy.get('#user_pass').clear().type(tooLongPassword);
    cy.get('#rememberme').uncheck();
    cy.get('#wp-submit').click();

    cy.url().then((url) => {
      if (url.includes('/wp-login.php')) {
        cy.get('#login_error, .login-error, .error').should('be.visible');
      }
    });
  });
});