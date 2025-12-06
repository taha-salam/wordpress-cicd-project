/**
 * WordPress Tag List Operations Test Suite
 * Tests tag list hover actions, quick edit, and deletion
 * Based on Equivalence Partitioning and Boundary Value Analysis
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress Tag List Operations', () => {
  const tagListPage = '/wp-admin/edit-tags.php?taxonomy=post_tag';
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

    cy.visit(tagListPage);
    cy.get('#the-list').should('exist');
  });

  const ensureTagPresence = () => {
    cy.get('body').then(($body) => {
      if ($body.find('#the-list tr').length === 0) {
        const id = Date.now();
        cy.get('#tag-name').clear().type(`test-tag-${id}`);
        cy.get('#submit').click();
        cy.wait(1000);
      }
    });
  };

  it('TC-TAGLIST-01: Display row actions on hover', () => {
    ensureTagPresence();

    cy.get('#the-list tr').first().within(() => {
      cy.get('td.name').trigger('mouseenter');
      cy.get('.row-actions').should('be.visible');

      cy.get('.row-actions').within(() => {
        cy.contains('Edit').should('be.visible');
        cy.contains('Quick Edit').should('be.visible');
        cy.contains('Delete').should('be.visible');
        cy.contains('View').should('be.visible');
      });
    });
  });

  it('TC-TAGLIST-02: Open full edit form', () => {
    ensureTagPresence();

    cy.get('#the-list tr').first().within(() => {
      cy.get('td.name').trigger('mouseenter');
      cy.get('.row-actions').should('be.visible');

      cy.get('.row-actions a').contains('Edit').scrollIntoView().should('be.visible').click({ force: true });
    });

    cy.url().should('include', 'term.php');
    cy.url().should('include', 'tag_ID=');
    cy.get('#name').should('be.visible');
    cy.get('#slug').should('be.visible');
  });

  it('TC-TAGLIST-03: Update tag via quick edit', () => {
    ensureTagPresence();

    const id = Date.now();
    const newName = `Quick Edit Tag ${id}`;

    cy.get('#the-list tr').first().within(() => {
      cy.get('td.name').trigger('mouseenter');
      cy.get('.row-actions').should('be.visible');

      cy.get('.row-actions a.editinline, .row-actions button.editinline')
        .first()
        .scrollIntoView()
        .click({ force: true });
    });

    cy.get('.inline-editor, #inline-edit', { timeout: 5000 }).should('be.visible').as('quickEditForm');

    cy.get('@quickEditForm')
      .find('input[name="name"]')
      .first()
      .should('be.visible')
      .clear()
      .type(newName);

    cy.get('@quickEditForm')
      .find('input[name="slug"]')
      .first()
      .should('be.visible')
      .clear()
      .type(`quick-edit-tag-${id}`);

    cy.get('@quickEditForm').find('button.save.button-primary, .save.button-primary').first().click();

    cy.get('@quickEditForm', { timeout: 10000 }).should('not.exist');

    cy.get('#the-list tr').first().find('td.name strong').should('contain', newName);
  });

  it('TC-TAGLIST-04: Quick edit empty name validation', () => {
    ensureTagPresence();

    let originalName = '';
    cy.get('#the-list tr').first().find('td.name strong').invoke('text').then((text) => {
      originalName = text.trim();

      cy.get('#the-list tr').first().within(() => {
        cy.get('td.name').trigger('mouseenter');
        cy.get('.row-actions').should('be.visible');

        cy.get('.row-actions a.editinline, .row-actions button.editinline')
          .first()
          .scrollIntoView()
          .click({ force: true });
      });

      cy.get('.inline-editor, #inline-edit', { timeout: 5000 }).should('be.visible').as('quickEditForm');

      cy.get('@quickEditForm')
        .find('input[name="name"]')
        .first()
        .should('be.visible')
        .clear();

      cy.get('@quickEditForm').find('button.save.button-primary, .save.button-primary').first().click();

      cy.wait(1000);

      cy.get('#the-list tr').first().find('td.name strong').should('contain', originalName);
    });
  });

  it('TC-TAGLIST-05: Delete tag from list', () => {
    ensureTagPresence();

    let tagName = '';
    cy.get('#the-list tr').first().find('td.name strong').invoke('text').then((text) => {
      tagName = text.trim();

      cy.on('window:confirm', (str) => {
        expect(str).to.include('delete');
        return true;
      });

      cy.get('#the-list').contains('tr', tagName).within(() => {
        cy.get('td.name').trigger('mouseenter');
        cy.get('.row-actions').should('be.visible');

        cy.get('.row-actions a.delete-tag, .row-actions .delete a')
          .first()
          .scrollIntoView()
          .should('be.visible')
          .click({ force: true });
      });

      cy.wait(500);

      cy.get('#the-list').should('not.contain', tagName);
    });
  });
});
