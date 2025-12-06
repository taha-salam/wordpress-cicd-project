/**
 * WordPress User Profile Test Suite
 * Tests user profile editing and validation
 * Based on Equivalence Partitioning and Boundary Value Analysis
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress User Profile', () => {
  const profilePage = '/wp-admin/profile.php';
  const loginPage = '/wp-login.php';

  const username = 'admin';
  const password = 'NewTestPassword123!';

  beforeEach(() => {
    cy.visit(loginPage, { failOnStatusCode: false });
    cy.get('body.login', { timeout: 10000 }).should('exist');
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

    cy.visit(profilePage, { failOnStatusCode: false });
    cy.get('form#your-profile', { timeout: 10000 }).should('be.visible');
  });

  it('TC-PROFILE-01: Basic profile fields present', () => {
    cy.get('input#first_name').should('exist');
    cy.get('input#last_name').should('exist');
    cy.get('input#email').should('exist');
    cy.get('select#display_name').should('exist');
  });

  it('TC-PROFILE-02: Update first and last name', () => {
    const id = Date.now();

    cy.get('input#first_name').clear().type(`TestFirst${id}`);
    cy.get('input#last_name').clear().type(`TestLast${id}`);

    cy.get('input#submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'profile.php');
  });

  it('TC-PROFILE-03: Update nickname', () => {
    const id = Date.now();
    const newNickname = `TestNick${id}`;

    cy.get('input#nickname').clear().type(newNickname);

    cy.get('input#submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'profile.php');
  });

  it('TC-PROFILE-04: Invalid email format', () => {
    cy.get('input#email').clear().type('invalidemail');

    cy.get('input#submit').click();

    cy.get('input#email').then(($input) => {
      if ($input[0].validity && !$input[0].validity.valid) {
        expect($input[0].validity.typeMismatch).to.be.true;
      } else {
        cy.get('.notice-error, .error, #message').should('be.visible');
      }
    });
  });

  it('TC-PROFILE-05: Update website URL', () => {
    cy.get('input#url').clear().type('https://example.com');

    cy.get('input#submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'profile.php');
  });

  it('TC-PROFILE-06: Update biographical info', () => {
    const bio = 'This is a test biographical information.';

    cy.get('textarea#description').clear().type(bio);

    cy.get('input#submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'profile.php');
  });

  it('TC-PROFILE-07: Maximum biographical info (5000 chars)', () => {
    const longBio = 'a'.repeat(5000);

    cy.get('textarea#description').clear().invoke('val', longBio);

    cy.get('input#submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'profile.php');
  });

  it('TC-PROFILE-08: Update display name', () => {
    cy.get('input#first_name').then(($first) => {
      if (!$first.val()) {
        cy.get('input#first_name').clear().type('TestFirst');
      }
    });

    cy.get('input#last_name').then(($last) => {
      if (!$last.val()) {
        cy.get('input#last_name').clear().type('TestLast');
      }
    });

    cy.get('select#display_name').then(($select) => {
      if ($select.find('option').length > 1) {
        cy.get('select#display_name').select(1);
      }
    });

    cy.get('input#submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'profile.php');
  });

  it('TC-PROFILE-09: Empty first name allowed', () => {
    cy.get('input#first_name').clear();

    cy.get('input#submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'profile.php');
  });

  it('TC-PROFILE-10: Empty last name allowed', () => {
    cy.get('input#last_name').clear();

    cy.get('input#submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'profile.php');
  });

  it('TC-PROFILE-11: Maximum first name length (255 chars)', () => {
    const longName = 'a'.repeat(255);

    cy.get('input#first_name').clear().invoke('val', longName);

    cy.get('input#submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'profile.php');
  });

  it('TC-PROFILE-12: Special characters in name', () => {
    cy.get('input#first_name').clear().type('Test-Name\'s');
    cy.get('input#last_name').clear().type('O\'Brien');

    cy.get('input#submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'profile.php');
  });

     it('TC-PROFILE-13: Change password', () => {
    const originalPassword = 'admin123!';
    const newPassword = 'NewTestPassword123!';

    cy.get('button#generate-reset-password, button.wp-generate-pw').then(($btn) => {
      if ($btn.length > 0) {
        cy.wrap($btn).click();
        cy.wait(1000);

        // FIX: Use {force: true} for hidden password fields
        cy.get('#pass1, #pass1-text').then(($pass) => {
          if ($pass.length > 0) {
            cy.wrap($pass).clear({ force: true }).type(newPassword, { force: true });
          }
        });

        // FIX: #pass2 is hidden with display: none, use {force: true}
        cy.get('#pass2, #pass2-text').then(($pass) => {
          if ($pass.length > 0) {
            cy.wrap($pass).clear({ force: true }).type(newPassword, { force: true });
          }
        });

        // Wait for password strength indicator
        cy.wait(1000);

        // FIX: Check "Confirm use of weak password" checkbox if it appears
        cy.get('body').then(($body) => {
          if ($body.find('input[name="pw_weak"]').length > 0) {
            cy.get('input[name="pw_weak"]').check({ force: true });
            cy.wait(500);
          }
        });

        // FIX: Submit button may be disabled, use {force: true}
        cy.get('input#submit').click({ force: true });

        cy.get('#message, .notice-success, .updated').should('be.visible');
        
        // IMPORTANT: Reset password back to original after test
        cy.wait(2000);
        cy.visit(profilePage, { failOnStatusCode: false });
        cy.wait(1000);
        
        cy.get('button#generate-reset-password, button.wp-generate-pw').then(($btn2) => {
          if ($btn2.length > 0) {
            cy.wrap($btn2).click();
            cy.wait(1000);
            
            cy.get('#pass1, #pass1-text').then(($p1) => {
              if ($p1.length > 0) {
                cy.wrap($p1).clear({ force: true }).type(originalPassword, { force: true });
              }
            });
            
            cy.get('#pass2, #pass2-text').then(($p2) => {
              if ($p2.length > 0) {
                cy.wrap($p2).clear({ force: true }).type(originalPassword, { force: true });
              }
            });
            
            cy.wait(1000);
            
            cy.get('body').then(($body2) => {
              if ($body2.find('input[name="pw_weak"]').length > 0) {
                cy.get('input[name="pw_weak"]').check({ force: true });
                cy.wait(500);
              }
            });
            
            cy.get('input#submit').click({ force: true });
            cy.wait(1000);
            cy.log('✅ Password reset back to original');
          }
        });
      }
    });
  });
});