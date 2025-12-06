/**
 * WordPress Reading Settings Test Suite
 * Tests homepage display, posts per page, and search engine visibility settings
 * Based on Equivalence Partitioning and Boundary Value Analysis
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress Reading Settings', () => {
  const readingSettingsPage = '/wp-admin/options-reading.php';
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

    cy.visit(readingSettingsPage);
    cy.get('#posts_per_page').should('be.visible');
  });

  it('TC-READING-01: Set homepage to display latest posts', () => {
    cy.get('input[name="show_on_front"][value="posts"]').check();

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-reading.php');
  });

  it('TC-READING-02: Set homepage to display static page', () => {
    cy.get('input[name="show_on_front"][value="page"]').check();

    cy.get('body').then(($body) => {
      if ($body.find('#page_on_front option').length > 1) {
        cy.get('#page_on_front').select(1);
      }
      if ($body.find('#page_for_posts option').length > 1) {
        cy.get('#page_for_posts').select(1);
      }
    });

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-reading.php');
  });

  it('TC-READING-03: Set minimum posts per page (1)', () => {
    cy.get('#posts_per_page').clear().type('1');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-reading.php');
  });

  it('TC-READING-04: Set default posts per page (10)', () => {
    cy.get('#posts_per_page').clear().type('10');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-reading.php');
  });

  it('TC-READING-05: Set maximum posts per page (100)', () => {
    cy.get('#posts_per_page').clear().type('100');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-reading.php');
  });

  it('TC-READING-06: Validate empty posts per page', () => {
    cy.get('#posts_per_page').clear();

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('body').then(($body) => {
      cy.get('#posts_per_page').then(($input) => {
        if ($input[0].validity && !$input[0].validity.valid) {
          expect($input[0].validity.valueMissing).to.be.true;
        } else {
          // WordPress may accept empty value and use default
          cy.get('#message, .notice-success, .updated, .notice-error, .error').should('exist');
        }
      });
    });
  });

  it('TC-READING-07: Set syndication feed items (minimum 1)', () => {
    cy.get('#posts_per_rss').then(($input) => {
      if ($input.length > 0) {
        cy.get('#posts_per_rss').clear().type('1');
      }
    });

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-reading.php');
  });

  it('TC-READING-08: Set syndication feed items (maximum 50)', () => {
    cy.get('#posts_per_rss').then(($input) => {
      if ($input.length > 0) {
        cy.get('#posts_per_rss').clear().type('50');
      }
    });

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-reading.php');
  });

  it('TC-READING-09: Set feed content to full text', () => {
    cy.get('input[name="rss_use_excerpt"][value="0"]').then(($radio) => {
      if ($radio.length > 0) {
        cy.get('input[name="rss_use_excerpt"][value="0"]').check();
      }
    });

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-reading.php');
  });

  it('TC-READING-10: Set feed content to summary', () => {
    cy.get('input[name="rss_use_excerpt"][value="1"]').then(($radio) => {
      if ($radio.length > 0) {
        cy.get('input[name="rss_use_excerpt"][value="1"]').check();
      }
    });

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-reading.php');
  });

  it('TC-READING-11: Enable search engine visibility', () => {
    cy.get('#blog_public').then(($checkbox) => {
      if ($checkbox.is(':checked')) {
        cy.get('#blog_public').uncheck();
      }
    });

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-reading.php');
  });

  it('TC-READING-12: Disable search engine visibility', () => {
    cy.get('#blog_public').then(($checkbox) => {
      if (!$checkbox.is(':checked')) {
        cy.get('#blog_public').check();
      }
    });

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-reading.php');
  });

  it('TC-READING-13: Set large posts per page value (999)', () => {
    cy.get('#posts_per_page').clear().type('999');

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-reading.php');
  });

  it('TC-READING-14: Restore default reading settings', () => {
    cy.get('input[name="show_on_front"][value="posts"]').check();
    cy.get('#posts_per_page').clear().type('10');

    cy.get('#posts_per_rss').then(($input) => {
      if ($input.length > 0) {
        cy.get('#posts_per_rss').clear().type('10');
      }
    });

    cy.get('input[name="rss_use_excerpt"][value="0"]').then(($radio) => {
      if ($radio.length > 0) {
        cy.get('input[name="rss_use_excerpt"][value="0"]').check();
      }
    });

    cy.get('form').find('input[type="submit"], button[type="submit"], #submit').click();

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'options-reading.php');
  });
});