/**
 * WordPress General Settings Test Suite
 * Tests site configuration and settings validation
 * Based on Equivalence Partitioning and Boundary Value Analysis
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress General Settings', () => {
  const settingsPage = '/wp-admin/options-general.php';
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

    cy.visit(settingsPage);

    cy.get('#blogname').should('be.visible');
    cy.get('#new_admin_email').should('be.visible');
  });

  it('TC-SETTINGS-01: Update all settings fields', () => {
    const blogName = 'My Blog';
    const blogDescription = 'Just another WordPress site';
    const adminEmail = 'admin@example.com';

    cy.get('#blogname').clear().type(blogName);
    cy.get('#blogdescription').clear().type(blogDescription);
    cy.get('#new_admin_email').clear().type(adminEmail);

    cy.get('#users_can_register').then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        cy.get('#users_can_register').uncheck();
      }
    });

    cy.get('#default_role').select('subscriber');
    cy.get('#timezone_string').select('UTC');
    cy.get('input[name="date_format"][value="Y-m-d"]').check();
    cy.get('input[name="time_format"][value="H:i"]').check();
    cy.get('#start_of_week').select('1');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-general.php');
  });

  it('TC-SETTINGS-02: Update with alternate configuration', () => {
    const blogName = 'Test Site';
    const blogDescription = '';
    const adminEmail = 'test@domain.com';

    cy.get('#blogname').clear().type(blogName);
    cy.get('#blogdescription').clear();
    cy.get('#new_admin_email').clear().type(adminEmail);

    cy.get('#users_can_register').check();
    cy.get('#default_role').select('editor');
    cy.get('#timezone_string').select('America/New_York');
    cy.get('input[name="date_format"][value="F j, Y"]').check();
    cy.get('input[name="time_format"][value="g:i a"]').check();
    cy.get('#start_of_week').select('0');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-general.php');
  });

  it('TC-SETTINGS-03: Empty site title allowed', () => {
    const blogDescription = 'Just another WordPress site';
    const adminEmail = 'admin@example.com';

    cy.get('#blogname').clear();
    cy.get('#blogdescription').clear().type(blogDescription);
    cy.get('#new_admin_email').clear().type(adminEmail);

    cy.get('#users_can_register').then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        cy.get('#users_can_register').uncheck();
      }
    });

    cy.get('#default_role').select('subscriber');
    cy.get('#timezone_string').select('UTC');
    cy.get('input[name="date_format"][value="Y-m-d"]').check();
    cy.get('input[name="time_format"][value="H:i"]').check();
    cy.get('#start_of_week').select('1');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-general.php');
  });

  it('TC-SETTINGS-04: Minimum site title (1 char)', () => {
    const blogName = 'a';
    const blogDescription = 'Just another WordPress site';
    const adminEmail = 'admin@example.com';

    cy.get('#blogname').clear().type(blogName);
    cy.get('#blogdescription').clear().type(blogDescription);
    cy.get('#new_admin_email').clear().type(adminEmail);

    cy.get('#users_can_register').then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        cy.get('#users_can_register').uncheck();
      }
    });

    cy.get('#default_role').select('subscriber');
    cy.get('#timezone_string').select('UTC');
    cy.get('input[name="date_format"][value="Y-m-d"]').check();
    cy.get('input[name="time_format"][value="H:i"]').check();
    cy.get('#start_of_week').select('1');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-general.php');
  });

  it('TC-SETTINGS-05: Maximum site title (255 chars)', () => {
    const longBlogName = 'a'.repeat(255);
    const blogDescription = 'Just another WordPress site';
    const adminEmail = 'admin@example.com';

    cy.get('#blogname').clear().invoke('val', longBlogName).trigger('input');
    cy.get('#blogdescription').clear().type(blogDescription);
    cy.get('#new_admin_email').clear().type(adminEmail);

    cy.get('#users_can_register').then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        cy.get('#users_can_register').uncheck();
      }
    });

    cy.get('#default_role').select('subscriber');
    cy.get('#timezone_string').select('UTC');
    cy.get('input[name="date_format"][value="Y-m-d"]').check();
    cy.get('input[name="time_format"][value="H:i"]').check();
    cy.get('#start_of_week').select('1');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-general.php');
  });

  it('TC-SETTINGS-06: Validate empty admin email', () => {
    const blogName = 'My Blog';
    const blogDescription = 'Just another WordPress site';

    cy.get('#blogname').clear().type(blogName);
    cy.get('#blogdescription').clear().type(blogDescription);
    cy.get('#new_admin_email').clear();

    cy.get('#users_can_register').then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        cy.get('#users_can_register').uncheck();
      }
    });

    cy.get('#default_role').select('subscriber');
    cy.get('#timezone_string').select('UTC');
    cy.get('input[name="date_format"][value="Y-m-d"]').check();
    cy.get('input[name="time_format"][value="H:i"]').check();
    cy.get('#start_of_week').select('1');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('body').then(($body) => {
      cy.get('#new_admin_email').then(($input) => {
        if ($input[0].validity && !$input[0].validity.valid) {
          expect($input[0].validity.valueMissing).to.be.true;
        } else {
          cy.get('.notice-error, .error, #message, .error-message').should('be.visible');
        }
      });
    });
  });

  it('TC-SETTINGS-07: Invalid admin email format', () => {
    const blogName = 'My Blog';
    const blogDescription = 'Just another WordPress site';
    const invalidEmail = 'invalidemail';

    cy.get('#blogname').clear().type(blogName);
    cy.get('#blogdescription').clear().type(blogDescription);
    cy.get('#new_admin_email').clear().type(invalidEmail);

    cy.get('#users_can_register').then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        cy.get('#users_can_register').uncheck();
      }
    });

    cy.get('#default_role').select('subscriber');
    cy.get('#timezone_string').select('UTC');
    cy.get('input[name="date_format"][value="Y-m-d"]').check();
    cy.get('input[name="time_format"][value="H:i"]').check();
    cy.get('#start_of_week').select('1');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('body').then(($body) => {
      cy.get('#new_admin_email').then(($input) => {
        if ($input[0].validity && !$input[0].validity.valid) {
          expect($input[0].validity.typeMismatch).to.be.true;
        } else {
          cy.get('.notice-error, .error, #message, .error-message').should('be.visible');
        }
      });
    });
  });

  it('TC-SETTINGS-08: Email exceeding limit', () => {
    const blogName = 'My Blog';
    const blogDescription = 'Just another WordPress site';
    const longEmail = 'a'.repeat(90) + '@domain.com';

    cy.get('#blogname').clear().type(blogName);
    cy.get('#blogdescription').clear().type(blogDescription);

    cy.get('#new_admin_email').clear().invoke('val', longEmail).trigger('input');

    cy.get('#users_can_register').then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        cy.get('#users_can_register').uncheck();
      }
    });

    cy.get('#default_role').select('subscriber');
    cy.get('#timezone_string').select('UTC');
    cy.get('input[name="date_format"][value="Y-m-d"]').check();
    cy.get('input[name="time_format"][value="H:i"]').check();
    cy.get('#start_of_week').select('1');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('body').then(($body) => {
      cy.get('#new_admin_email').then(($input) => {
        if ($input[0].validity && !$input[0].validity.valid) {
          expect($input[0].validity.tooLong || $input[0].validity.typeMismatch).to.be.true;
        } else {
          cy.get('.notice-error, .error, #message, .error-message').should('be.visible');
        }
      });
    });
  });

  it('TC-SETTINGS-09: Invalid WordPress address URL', () => {
    const blogName = 'My Blog';
    const blogDescription = 'Just another WordPress site';
    const adminEmail = 'admin@example.com';
    const invalidUrl = 'not-a-url';

    cy.get('#blogname').clear().type(blogName);
    cy.get('#blogdescription').clear().type(blogDescription);
    cy.get('#new_admin_email').clear().type(adminEmail);

    cy.get('#siteurl').then(($input) => {
      if (!$input.is(':disabled')) {
        cy.get('#siteurl').clear().type(invalidUrl);
      }
    });

    cy.get('#users_can_register').then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        cy.get('#users_can_register').uncheck();
      }
    });

    cy.get('#default_role').select('subscriber');
    cy.get('#timezone_string').select('UTC');
    cy.get('input[name="date_format"][value="Y-m-d"]').check();
    cy.get('input[name="time_format"][value="H:i"]').check();
    cy.get('#start_of_week').select('1');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('body').then(($body) => {
      cy.get('#siteurl').then(($input) => {
        if ($input[0].validity && !$input[0].validity.valid) {
          expect($input[0].validity.typeMismatch).to.be.true;
        } else {
          cy.get('.notice-error, .error, #message, .error-message').should('exist');
        }
      });
    });
  });

  it('TC-SETTINGS-10: Invalid site address URL', () => {
    const blogName = 'My Blog';
    const blogDescription = 'Just another WordPress site';
    const adminEmail = 'admin@example.com';
    const invalidUrl = 'not-a-url';

    cy.get('#blogname').clear().type(blogName);
    cy.get('#blogdescription').clear().type(blogDescription);
    cy.get('#new_admin_email').clear().type(adminEmail);

    cy.get('#home').then(($input) => {
      if (!$input.is(':disabled')) {
        cy.get('#home').clear().type(invalidUrl);
      }
    });

    cy.get('#users_can_register').then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        cy.get('#users_can_register').uncheck();
      }
    });

    cy.get('#default_role').select('subscriber');
    cy.get('#timezone_string').select('UTC');
    cy.get('input[name="date_format"][value="Y-m-d"]').check();
    cy.get('input[name="time_format"][value="H:i"]').check();
    cy.get('#start_of_week').select('1');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('body').then(($body) => {
      cy.get('#home').then(($input) => {
        if ($input[0].validity && !$input[0].validity.valid) {
          expect($input[0].validity.typeMismatch).to.be.true;
        } else {
          cy.get('.notice-error, .error, #message, .error-message').should('exist');
        }
      });
    });
  });

  it('TC-SETTINGS-11: Empty custom date format', () => {
    const blogName = 'My Blog';
    const blogDescription = 'Just another WordPress site';
    const adminEmail = 'admin@example.com';

    cy.get('#blogname').clear().type(blogName);
    cy.get('#blogdescription').clear().type(blogDescription);
    cy.get('#new_admin_email').clear().type(adminEmail);

    cy.get('#users_can_register').then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        cy.get('#users_can_register').uncheck();
      }
    });

    cy.get('#default_role').select('subscriber');
    cy.get('#timezone_string').select('UTC');

    cy.get('#date_format_custom_radio').check();
    cy.wait(500);

    cy.get('#date_format_custom').clear();

    cy.get('input[name="time_format"][value="H:i"]').check();
    cy.get('#start_of_week').select('1');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('.notice-error, .error, #message, .error-message').should('be.visible');
  });

  it('TC-SETTINGS-12: Minimum custom date format (1 char)', () => {
    const blogName = 'My Blog';
    const blogDescription = 'Just another WordPress site';
    const adminEmail = 'admin@example.com';

    cy.get('#blogname').clear().type(blogName);
    cy.get('#blogdescription').clear().type(blogDescription);
    cy.get('#new_admin_email').clear().type(adminEmail);

    cy.get('#users_can_register').then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        cy.get('#users_can_register').uncheck();
      }
    });

    cy.get('#default_role').select('subscriber');
    cy.get('#timezone_string').select('UTC');

    cy.get('#date_format_custom_radio').check();
    cy.wait(500);

    cy.get('#date_format_custom').clear().type('Y');

    cy.get('input[name="time_format"][value="H:i"]').check();
    cy.get('#start_of_week').select('1');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-general.php');
  });

  it('TC-SETTINGS-13: Empty custom time format', () => {
    const blogName = 'My Blog';
    const blogDescription = 'Just another WordPress site';
    const adminEmail = 'admin@example.com';

    cy.get('#blogname').clear().type(blogName);
    cy.get('#blogdescription').clear().type(blogDescription);
    cy.get('#new_admin_email').clear().type(adminEmail);

    cy.get('#users_can_register').then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        cy.get('#users_can_register').uncheck();
      }
    });

    cy.get('#default_role').select('subscriber');
    cy.get('#timezone_string').select('UTC');
    cy.get('input[name="date_format"][value="Y-m-d"]').check();

    cy.get('#time_format_custom_radio').check();
    cy.wait(500);

    cy.get('#time_format_custom').clear();

    cy.get('#start_of_week').select('1');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('.notice-error, .error, #message, .error-message').should('be.visible');
  });

  it('TC-SETTINGS-14: Minimum custom time format (1 char)', () => {
    const blogName = 'My Blog';
    const blogDescription = 'Just another WordPress site';
    const adminEmail = 'admin@example.com';

    cy.get('#blogname').clear().type(blogName);
    cy.get('#blogdescription').clear().type(blogDescription);
    cy.get('#new_admin_email').clear().type(adminEmail);

    cy.get('#users_can_register').then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        cy.get('#users_can_register').uncheck();
      }
    });

    cy.get('#default_role').select('subscriber');
    cy.get('#timezone_string').select('UTC');
    cy.get('input[name="date_format"][value="Y-m-d"]').check();

    cy.get('#time_format_custom_radio').check();
    cy.wait(500);

    cy.get('#time_format_custom').clear().type('H');

    cy.get('#start_of_week').select('1');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-general.php');
  });
});