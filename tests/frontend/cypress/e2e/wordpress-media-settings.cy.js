/**
 * WordPress Media Settings Test Suite
 * Tests media upload settings and image size configurations
 * Based on Equivalence Partitioning and Boundary Value Analysis
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress Media Settings', () => {
  const mediaSettingsPage = '/wp-admin/options-media.php';
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

    cy.visit(mediaSettingsPage);
    cy.get('#thumbnail_size_w').should('be.visible');
  });

  it('TC-MEDIA-SETTINGS-01: Update all image size settings', () => {
    cy.get('#thumbnail_size_w').clear().type('150');
    cy.get('#thumbnail_size_h').clear().type('150');
    cy.get('#thumbnail_crop').check();

    cy.get('#medium_size_w').clear().type('300');
    cy.get('#medium_size_h').clear().type('300');

    cy.get('#large_size_w').clear().type('1024');
    cy.get('#large_size_h').clear().type('1024');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-media.php');
  });

  it('TC-MEDIA-SETTINGS-02: Set minimum thumbnail size (1x1)', () => {
    cy.get('#thumbnail_size_w').clear().type('1');
    cy.get('#thumbnail_size_h').clear().type('1');
    cy.get('#thumbnail_crop').uncheck();

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-media.php');
  });

  it('TC-MEDIA-SETTINGS-03: Set maximum thumbnail size (9999x9999)', () => {
    cy.get('#thumbnail_size_w').clear().type('9999');
    cy.get('#thumbnail_size_h').clear().type('9999');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-media.php');
  });

  it('TC-MEDIA-SETTINGS-04: Empty thumbnail width validation', () => {
    cy.get('#thumbnail_size_w').clear();
    cy.get('#thumbnail_size_h').clear().type('150');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('body').then(($body) => {
      cy.get('#thumbnail_size_w').then(($input) => {
        if ($input[0].validity && !$input[0].validity.valid) {
          expect($input[0].validity.valueMissing).to.be.true;
        } else {
          cy.get('#message, .notice-success, .updated').should('exist');
        }
      });
    });
  });

  it('TC-MEDIA-SETTINGS-05: Set medium size dimensions', () => {
    cy.get('#medium_size_w').clear().type('500');
    cy.get('#medium_size_h').clear().type('500');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-media.php');
  });

  it('TC-MEDIA-SETTINGS-06: Set large size dimensions', () => {
    cy.get('#large_size_w').clear().type('2048');
    cy.get('#large_size_h').clear().type('2048');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-media.php');
  });

  it('TC-MEDIA-SETTINGS-07: Enable upload organization by date', () => {
    cy.get('#uploads_use_yearmonth_folders').then(($checkbox) => {
      if (!$checkbox.is(':checked')) {
        cy.get('#uploads_use_yearmonth_folders').check();
      }
    });

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-media.php');
  });

  it('TC-MEDIA-SETTINGS-08: Disable upload organization by date', () => {
    cy.get('#uploads_use_yearmonth_folders').then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        cy.get('#uploads_use_yearmonth_folders').uncheck();
      }
    });

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-media.php');
  });

  it('TC-MEDIA-SETTINGS-09: Toggle thumbnail cropping', () => {
    cy.get('#thumbnail_crop').then(($checkbox) => {
      const wasChecked = $checkbox.is(':checked');

      if (wasChecked) {
        cy.get('#thumbnail_crop').uncheck();
      } else {
        cy.get('#thumbnail_crop').check();
      }

      cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

      cy.get('#message, .notice-success, .updated').should('be.visible');
      cy.url().should('include', 'options-media.php');
    });
  });

  it('TC-MEDIA-SETTINGS-10: Set zero for medium width', () => {
    cy.get('#medium_size_w').clear().type('0');
    cy.get('#medium_size_h').clear().type('300');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-media.php');
  });

  it('TC-MEDIA-SETTINGS-11: Set asymmetric thumbnail dimensions', () => {
    cy.get('#thumbnail_size_w').clear().type('200');
    cy.get('#thumbnail_size_h').clear().type('100');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-media.php');
  });

  it('TC-MEDIA-SETTINGS-12: Restore default image sizes', () => {
    cy.get('#thumbnail_size_w').clear().type('150');
    cy.get('#thumbnail_size_h').clear().type('150');
    cy.get('#thumbnail_crop').check();

    cy.get('#medium_size_w').clear().type('300');
    cy.get('#medium_size_h').clear().type('300');

    cy.get('#large_size_w').clear().type('1024');
    cy.get('#large_size_h').clear().type('1024');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-media.php');
  });
});