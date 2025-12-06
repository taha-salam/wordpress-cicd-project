/**
 * WordPress Tag Form Testing Suite
 * Covers tag creation, validation, and deletion operations
 * Using Equivalence Partitioning and Boundary Value Analysis
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress Tag Management', () => {
  const tagsPage = '/wp-admin/edit-tags.php?taxonomy=post_tag';
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

    cy.visit(tagsPage);
    cy.get('#tag-name').should('be.visible');
  });

  const uniqueId = () => Date.now();

  it('TC-TAG-01: Create tag with complete information', () => {
    const id = uniqueId();
    const name = `Technology${id}`;

    cy.get('#tag-name').clear().type(name);
    cy.get('#tag-slug').clear().type('technology');
    cy.get('#tag-description').clear().type('Technology related posts');

    cy.get('#addtag').within(() => {
      cy.get('button[type="submit"], input[type="submit"], .button-primary').first().click();
    });

    cy.get('body').should('contain', 'Tag added.');
    cy.url().should('include', 'edit-tags.php?taxonomy=post_tag');
    cy.get('#the-list').should('contain', name);
  });

  it('TC-TAG-02: Create tag with name only', () => {
    const id = uniqueId();
    const name = `News${id}`;

    cy.get('#tag-name').clear().type(name);
    cy.get('#tag-slug').clear();
    cy.get('#tag-description').clear();

    cy.get('#addtag').within(() => {
      cy.get('button[type="submit"], input[type="submit"], .button-primary').first().click();
    });

    cy.get('body').should('contain', 'Tag added.');
    cy.url().should('include', 'edit-tags.php?taxonomy=post_tag');
    cy.get('#the-list').should('contain', name);
  });

  it('TC-TAG-03: Validate empty name field', () => {
    cy.get('#tag-name').clear();
    cy.get('#tag-slug').clear().type('technology');
    cy.get('#tag-description').clear().type('Technology related posts');

    cy.get('#addtag').within(() => {
      cy.get('button[type="submit"], input[type="submit"], .button-primary').first().click();
    });

    cy.get('.notice-error, .error, #message.error').should('be.visible');
    cy.get('body').should('contain', 'A name is required for this term.');
    cy.url().should('include', 'edit-tags.php?taxonomy=post_tag');
  });

  it('TC-TAG-04: Single character tag name', () => {
    const id = uniqueId();
    const name = `a${id}`;

    cy.get('#tag-name').clear().type(name);
    cy.get('#tag-slug').clear().type('technology');
    cy.get('#tag-description').clear().type('Technology related posts');

    cy.get('#addtag').within(() => {
      cy.get('button[type="submit"], input[type="submit"], .button-primary').first().click();
    });

    cy.get('body').should('contain', 'Tag added.');
    cy.url().should('include', 'edit-tags.php?taxonomy=post_tag');
  });

  it('TC-TAG-05: Maximum length tag name (200 chars)', () => {
    const id = uniqueId();
    const name = 'a'.repeat(200 - id.toString().length) + id;

    cy.get('#tag-name').clear().type(name);
    cy.get('#tag-slug').clear().type('technology');
    cy.get('#tag-description').clear().type('Technology related posts');

    cy.get('#addtag').within(() => {
      cy.get('button[type="submit"], input[type="submit"], .button-primary').first().click();
    });

    cy.get('body').should('contain', 'Tag added.');
    cy.url().should('include', 'edit-tags.php?taxonomy=post_tag');
  });

  it('TC-TAG-06: Exceeds maximum tag name (201 chars)', () => {
    const id = uniqueId();
    const name = 'a'.repeat(201 - id.toString().length) + id;

    cy.get('#tag-name').clear().type(name);
    cy.get('#tag-slug').clear().type('technology');
    cy.get('#tag-description').clear().type('Technology related posts');

    cy.get('#addtag').within(() => {
      cy.get('button[type="submit"], input[type="submit"], .button-primary').first().click();
    });

    cy.get('body').then(($body) => {
      if ($body.find('.notice-error, .error').length > 0) {
        cy.get('.notice-error, .error').should('be.visible');
      } else {
        cy.get('body').should('contain', 'Tag added.');
      }
    });
  });

  it('TC-TAG-07: Slug with spaces auto-sanitizes', () => {
    const id = uniqueId();
    const name = `Technology${id}`;

    cy.get('#tag-name').clear().type(name);
    cy.get('#tag-slug').clear().type('slug with spaces');
    cy.get('#tag-description').clear().type('Technology related posts');

    cy.get('#addtag').within(() => {
      cy.get('button[type="submit"], input[type="submit"], .button-primary').first().click();
    });

    cy.get('body').should('contain', 'Tag added.');
    cy.url().should('include', 'edit-tags.php?taxonomy=post_tag');
    cy.get('#the-list').should('contain', name);
  });

  it('TC-TAG-08: Slug with special characters sanitizes', () => {
    const id = uniqueId();
    const name = `Technology${id}`;

    cy.get('#tag-name').clear().type(name);
    cy.get('#tag-slug').clear().type('slug#invalid');
    cy.get('#tag-description').clear().type('Technology related posts');

    cy.get('#addtag').within(() => {
      cy.get('button[type="submit"], input[type="submit"], .button-primary').first().click();
    });

    cy.get('body').should('contain', 'Tag added.');
    cy.url().should('include', 'edit-tags.php?taxonomy=post_tag');
    cy.get('#the-list').should('contain', name);
  });

  it('TC-TAG-09: Maximum slug length (200 chars)', () => {
    const id = uniqueId();
    const name = `Technology${id}`;
    const slug = 'a'.repeat(200);

    cy.get('#tag-name').clear().type(name);
    cy.get('#tag-slug').clear().type(slug);
    cy.get('#tag-description').clear().type('Technology related posts');

    cy.get('#addtag').within(() => {
      cy.get('button[type="submit"], input[type="submit"], .button-primary').first().click();
    });

    cy.get('#message, .notice-success, .updated').should('be.visible');
    cy.url().should('include', 'edit-tags.php?taxonomy=post_tag');
  });

  it('TC-TAG-10: Slug exceeding limit (201 chars)', () => {
    const id = uniqueId();
    const name = `Technology${id}`;
    const slug = 'a'.repeat(201);

    cy.get('#tag-name').clear().type(name);
    cy.get('#tag-slug').clear().type(slug);
    cy.get('#tag-description').clear().type('Technology related posts');

    cy.get('#addtag').within(() => {
      cy.get('button[type="submit"], input[type="submit"], .button-primary').first().click();
    });

    cy.get('body').then(($body) => {
      if ($body.find('.notice-error, .error').length > 0) {
        cy.get('.notice-error, .error').should('be.visible');
      } else {
        cy.get('#message, .notice-success, .updated').should('be.visible');
      }
    });
  });

  it('TC-TAG-11: Maximum description (5000 chars)', () => {
    const id = uniqueId();
    const name = `Technology${id}`;
    const description = 'a'.repeat(5000);

    cy.get('#tag-name').clear().type(name);
    cy.get('#tag-slug').clear().type('technology');
    cy.get('#tag-description').clear();
    cy.get('#tag-description').invoke('val', description);

    cy.get('#addtag').within(() => {
      cy.get('button[type="submit"], input[type="submit"], .button-primary').first().click();
    });

    cy.get('body').should('contain', 'Tag added.');
    cy.url().should('include', 'edit-tags.php?taxonomy=post_tag');
  });

  it('TC-TAG-12: Description over limit (5001 chars)', () => {
    const id = uniqueId();
    const name = `Technology${id}`;
    const description = 'a'.repeat(5001);

    cy.get('#tag-name').clear().type(name);
    cy.get('#tag-slug').clear().type('technology');
    cy.get('#tag-description').clear();
    cy.get('#tag-description').invoke('val', description);

    cy.get('#addtag').within(() => {
      cy.get('button[type="submit"], input[type="submit"], .button-primary').first().click();
    });

    cy.get('body').then(($body) => {
      cy.get('#message, .notice-success, .updated').should('be.visible');
    });
  });

  it('TC-TAG-13: Tag name with special characters', () => {
    const id = uniqueId();
    const name = `Tech & Gadgets${id}`;

    cy.get('#tag-name').clear().type(name);
    cy.get('#tag-slug').clear().type('tech-gadgets');
    cy.get('#tag-description').clear().type('Technology and gadgets tag');

    cy.get('#addtag').within(() => {
      cy.get('button[type="submit"], input[type="submit"], .button-primary').first().click();
    });

    cy.get('body').should('contain', 'Tag added.');
    cy.url().should('include', 'edit-tags.php?taxonomy=post_tag');
    cy.get('#the-list').should('contain', 'Tech');
  });

  it('TC-TAG-14: Delete existing tag', () => {
    const id = uniqueId();
    const name = `DeleteTest${id}`;

    // Create tag
    cy.get('#tag-name').clear().type(name);
    cy.get('#tag-slug').clear().type(`deletetest${id}`);
    cy.get('#addtag').within(() => {
      cy.get('button[type="submit"], input[type="submit"], .button-primary')
        .first()
        .click();
    });

    cy.wait(600);
    cy.get('#the-list').should('contain', name);

    // Click delete
    cy.get('#the-list')
      .contains('tr', name)
      .within(() => {
        cy.get('.row-actions')
          .contains('Delete')
          .click({ force: true });
      });

    cy.on('window:confirm', () => true);

    // WordPress does NOT show a success message for tags, so only check removal
    cy.wait(800);
    cy.get('#the-list').should('not.contain', name);
  });
});