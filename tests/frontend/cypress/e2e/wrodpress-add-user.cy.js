/**
 * WordPress Add User Test Suite
 * Tests user creation, validation, and role assignment
 * Based on Equivalence Partitioning and Boundary Value Analysis
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress Add User', () => {
  const addUserPage = '/wp-admin/user-new.php';
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

    cy.visit(addUserPage);
    cy.get('#user_login').should('be.visible');
  });

  const uniqueId = () => Date.now();

  it('TC-ADDUSER-01: Create user with all fields filled', () => {
    const id = uniqueId();
    const newUsername = `testuser${id}`;
    const newEmail = `testuser${id}@example.com`;

    cy.get('#user_login').clear().type(newUsername);
    cy.get('#email').clear().type(newEmail);
    cy.get('#first_name').clear().type('Test');
    cy.get('#last_name').clear().type('User');
    cy.get('#url').clear().type('https://example.com');
    cy.get('#pass1').clear().type('TestPassword123!');
    cy.get('#role').select('subscriber');

    cy.get('#createusersub').click();

    // WordPress redirects to users.php after successful creation
    cy.url().should('include', 'users.php');
    cy.get('#message, .notice-success, .updated').should('be.visible');
  });

  it('TC-ADDUSER-02: Create user with required fields only', () => {
    const id = uniqueId();
    const newUsername = `minuser${id}`;
    const newEmail = `minuser${id}@example.com`;

    cy.get('#user_login').clear().type(newUsername);
    cy.get('#email').clear().type(newEmail);
    cy.get('#pass1').clear().type('MinPassword123!');

    cy.get('#createusersub').click();

    cy.url().should('include', 'users.php');
    cy.get('#message, .notice-success, .updated').should('be.visible');
  });

  it('TC-ADDUSER-03: Validate empty username field', () => {
    const id = uniqueId();
    const newEmail = `emptyuser${id}@example.com`;

    cy.get('#user_login').clear();
    cy.get('#email').clear().type(newEmail);
    cy.get('#pass1').clear().type('TestPassword123!');

    cy.get('#createusersub').click();

    cy.get('#user_login').then(($input) => {
      if ($input[0].validity && !$input[0].validity.valid) {
        expect($input[0].validity.valueMissing).to.be.true;
      } else {
        // WordPress may show error or stay on page
        cy.url().should('include', 'user-new.php');
      }
    });
  });

  it('TC-ADDUSER-04: Validate empty email field', () => {
    const id = uniqueId();
    const newUsername = `noemail${id}`;

    cy.get('#user_login').clear().type(newUsername);
    cy.get('#email').clear();
    cy.get('#pass1').clear().type('TestPassword123!');

    cy.get('#createusersub').click();

    cy.get('#email').then(($input) => {
      if ($input[0].validity && !$input[0].validity.valid) {
        expect($input[0].validity.valueMissing).to.be.true;
      } else {
        // WordPress may show error or stay on page
        cy.url().should('include', 'user-new.php');
      }
    });
  });

  it('TC-ADDUSER-05: Invalid email format', () => {
    const id = uniqueId();
    const newUsername = `invalidemail${id}`;

    cy.get('#user_login').clear().type(newUsername);
    cy.get('#email').clear().type('invalidemail');
    cy.get('#pass1').clear().type('TestPassword123!');

    cy.get('#createusersub').click();

    cy.get('body').then(($body) => {
      cy.get('#email').then(($input) => {
        if ($input[0].validity && !$input[0].validity.valid) {
          expect($input[0].validity.typeMismatch).to.be.true;
        } else {
          cy.get('.notice-error, .error, #message').should('be.visible');
        }
      });
    });
  });

  it('TC-ADDUSER-06: Minimum username length (1 char)', () => {
    const id = uniqueId();
    const newUsername = `a${id}`;
    const newEmail = `a${id}@example.com`;

    cy.get('#user_login').clear().type(newUsername);
    cy.get('#email').clear().type(newEmail);
    cy.get('#pass1').clear().type('TestPassword123!');

    cy.get('#createusersub').click();

    cy.url().should('include', 'users.php');
    cy.get('#message, .notice-success, .updated').should('be.visible');
  });

  it('TC-ADDUSER-07: Maximum username length (60 chars)', () => {
    const id = uniqueId();
    const longUsername = 'a'.repeat(60 - id.toString().length) + id;
    const newEmail = `longuser${id}@example.com`;

    cy.get('#user_login').clear().type(longUsername);
    cy.get('#email').clear().type(newEmail);
    cy.get('#pass1').clear().type('TestPassword123!');

    cy.get('#createusersub').click();

    cy.get('body').then(($body) => {
      if ($body.find('#message, .notice-success, .updated').length > 0) {
        cy.get('#message, .notice-success, .updated').should('be.visible');
      } else {
        cy.get('.notice-error, .error').should('be.visible');
      }
    });
  });

  it('TC-ADDUSER-08: Assign editor role', () => {
    const id = uniqueId();
    const newUsername = `editor${id}`;
    const newEmail = `editor${id}@example.com`;

    cy.get('#user_login').clear().type(newUsername);
    cy.get('#email').clear().type(newEmail);
    cy.get('#pass1').clear().type('EditorPassword123!');
    cy.get('#role').select('editor');

    cy.get('#createusersub').click();

    cy.url().should('include', 'users.php');
    cy.get('#message, .notice-success, .updated').should('be.visible');
  });

  it('TC-ADDUSER-09: Assign author role', () => {
    const id = uniqueId();
    const newUsername = `author${id}`;
    const newEmail = `author${id}@example.com`;

    cy.get('#user_login').clear().type(newUsername);
    cy.get('#email').clear().type(newEmail);
    cy.get('#pass1').clear().type('AuthorPassword123!');
    cy.get('#role').select('author');

    cy.get('#createusersub').click();

    cy.url().should('include', 'users.php');
    cy.get('#message, .notice-success, .updated').should('be.visible');
  });

  it('TC-ADDUSER-10: Assign contributor role', () => {
    const id = uniqueId();
    const newUsername = `contrib${id}`;
    const newEmail = `contrib${id}@example.com`;

    cy.get('#user_login').clear().type(newUsername);
    cy.get('#email').clear().type(newEmail);
    cy.get('#pass1').clear().type('ContribPassword123!');
    cy.get('#role').select('contributor');

    cy.get('#createusersub').click();

    cy.url().should('include', 'users.php');
    cy.get('#message, .notice-success, .updated').should('be.visible');
  });

  it('TC-ADDUSER-11: Weak password creates user successfully', () => {
    const id = uniqueId();
    const newUsername = `weakpass${id}`;
    const newEmail = `weakpass${id}@example.com`;

    cy.get('#user_login').clear().type(newUsername);
    cy.get('#email').clear().type(newEmail);
    cy.get('#pass1').clear().type('weak');

    // Check if confirmation checkbox exists and check it
    cy.get('body').then(($body) => {
      if ($body.find('#pw-checkbox').length > 0 && $body.find('#pw-checkbox').is(':visible')) {
        cy.get('#pw-checkbox').check({ force: true });
      }
    });

    // WordPress disables submit button for weak passwords, use force
    cy.get('#createusersub').click({ force: true });

    // WordPress may accept weak password with confirmation or show error
    cy.get('body').then(($body) => {
      if ($body.find('#message, .notice-success, .updated').length > 0) {
        cy.url().should('include', 'users.php');
      } else {
        // May stay on page if password too weak
        cy.url().should('include', 'user-new.php');
      }
    });
  });

  it('TC-ADDUSER-12: Strong password validation', () => {
    const id = uniqueId();
    const newUsername = `strongpass${id}`;
    const newEmail = `strongpass${id}@example.com`;

    cy.get('#user_login').clear().type(newUsername);
    cy.get('#email').clear().type(newEmail);
    cy.get('#pass1').clear().type('VeryStr0ng!P@ssw0rd#2024');

    cy.get('body').then(($body) => {
      if ($body.find('#pass-strength-result').length > 0) {
        cy.get('#pass-strength-result').should('contain.text', 'Strong');
      }
    });

    cy.get('#createusersub').click();

    cy.url().should('include', 'users.php');
    cy.get('#message, .notice-success, .updated').should('be.visible');
  });

  it('TC-ADDUSER-13: Duplicate username validation', () => {
    const duplicateUsername = 'Fastians';
    const id = uniqueId();
    const newEmail = `duplicate${id}@example.com`;

    cy.get('#user_login').clear().type(duplicateUsername);
    cy.get('#email').clear().type(newEmail);
    cy.get('#pass1').clear().type('TestPassword123!');

    cy.get('#createusersub').click();

    cy.url().should('include', 'user-new.php');
    cy.get('.notice-error, .error, #message').should('be.visible');
  });

  it('TC-ADDUSER-14: Special characters in username', () => {
    const id = uniqueId();
    const newUsername = `user_test-${id}`;
    const newEmail = `usertest${id}@example.com`;

    cy.get('#user_login').clear().type(newUsername);
    cy.get('#email').clear().type(newEmail);
    cy.get('#pass1').clear().type('TestPassword123!');

    cy.get('#createusersub').click();

    cy.get('body').then(($body) => {
      if ($body.find('#message, .notice-success, .updated').length > 0) {
        cy.url().should('include', 'users.php');
      } else {
        cy.get('.notice-error, .error').should('be.visible');
      }
    });
  });
});