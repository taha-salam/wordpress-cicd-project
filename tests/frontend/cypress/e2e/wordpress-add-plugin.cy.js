/**
 * WordPress Plugin Management Test Suite
 * Tests plugin search, installation, activation/deactivation, upload, and settings access
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress Plugin Management', () => {
  const pluginsPage = '/wp-admin/plugins.php';
  const addPluginsPage = '/wp-admin/plugin-install.php';
  const loginPage = '/wp-login.php';

  const username = 'Fastians';
  const password = '8Wk5ujnODaxMLKp(wQ';

  // Helper: Authenticate user
  const authenticateUser = () => {
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
  };

  beforeEach(() => {
    authenticateUser();
  });

  it('TC-PLUGIN-01: Search functionality for plugins', () => {
    cy.visit(addPluginsPage);
    cy.url().should('include', 'plugin-install.php');

    const searchQuery = 'seo';
    cy.get('#search-plugins, input[name="s"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(searchQuery)
      .type('{enter}');

    cy.get('.plugin-card, .wp-list-table.plugins tbody tr, .plugin-card-top', {
      timeout: 20000,
    }).should('exist');

    cy.url().should('include', 'plugin-install.php');
  });

  it('TC-PLUGIN-02: Install plugin from search results', () => {
    cy.visit(addPluginsPage);

    const searchQuery = 'contact';
    cy.get('#search-plugins, input[name="s"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(searchQuery)
      .type('{enter}');

    cy.get('.plugin-card, .wp-list-table.plugins tbody tr, .plugin-card-top', {
      timeout: 20000,
    }).should('exist');

    cy.get('.plugin-card, .wp-list-table.plugins tbody tr, .plugin-card-top')
      .first()
      .find('.install-now, .activate, button[data-slug], a[href*="plugin-install"]')
      .first()
      .click({ force: true });

    cy.wait(5000); // Wait for installation

    cy.get('.notice, .notice-success, .updated, #message, .notice-info', { timeout: 15000 })
      .should('exist')
      .and('contain.text', 'installed');
  });

  it('TC-PLUGIN-03: Activate then deactivate plugin', () => {
    cy.visit(pluginsPage);
    cy.url().should('include', '/wp-admin/plugins.php');

    // Activate if inactive
    cy.get('table.plugins tbody tr', { timeout: 10000 }).then(($rows) => {
      let inactiveRow = null;
      $rows.each((_, row) => {
        const $row = Cypress.$(row);
        if ($row.find('.activate a').length > 0) {
          inactiveRow = $row;
          return false;
        }
      });

      if (inactiveRow) {
        cy.wrap(inactiveRow)
          .find('.activate a')
          .click({ force: true });

        cy.get('.notice, .updated, #message, .notice-success, .notice-info', { timeout: 15000 })
          .should('exist')
          .and('contain.text', 'activated');
      }
    });

    // Deactivate
    cy.get('table.plugins tbody tr.active', { timeout: 10000 }).then(($rows) => {
      let activeRow = null;
      $rows.each((_, row) => {
        const $row = Cypress.$(row);
        if ($row.find('.deactivate a').length > 0) {
          activeRow = $row;
          return false;
        }
      });

      if (activeRow) {
        cy.wrap(activeRow)
          .find('.deactivate a')
          .click({ force: true });

        cy.get('.notice, .updated, #message, .notice-success, .notice-info', { timeout: 15000 })
          .should('exist')
          .and('contain.text', 'deactivated');
      }
    });
  });

  it('TC-PLUGIN-04: Upload plugin form visibility', () => {
    cy.visit(addPluginsPage);

    cy.get('a.upload-view-toggle, a[href*="upload-plugin"], .upload', { timeout: 10000 })
      .filter(':visible')
      .first()
      .click({ force: true });

    cy.get('form#upload-plugin, form[enctype*="multipart/form-data"]', { timeout: 10000 }).should('exist');
    cy.get('input[type="file"][name="pluginzip"], #pluginzip', { timeout: 10000 }).should('exist');
    cy.get('input[type="submit"], button[type="submit"]', { timeout: 10000 }).should('exist');
  });

  it('TC-PLUGIN-05: Access plugin settings page', () => {
    cy.visit(pluginsPage);
    cy.url().should('include', '/wp-admin/plugins.php');

    cy.get('table.plugins tbody tr', { timeout: 10000 })
      .filter(':visible')
      .then(($rows) => {
        let settingsRow = null;

        $rows.each((_, row) => {
          const $row = Cypress.$(row);
          if ($row.find('.row-actions .settings a, a[aria-label*="Settings"]').length > 0) {
            settingsRow = $row;
            return false;
          }
        });

        if (!settingsRow) {
          cy.log('No plugin with settings link available');
          return;
        }

        cy.wrap(settingsRow)
          .find('.row-actions .settings a, a[aria-label*="Settings"]')
          .first()
          .click({ force: true });

        cy.url().should('not.include', '/wp-admin/plugins.php');
        cy.get('h1, .wrap h1, .wrap h2', { timeout: 10000 }).should('exist');
      });
  });
});