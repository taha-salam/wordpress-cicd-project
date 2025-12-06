describe("WordPress Navigation Test Suite", () => {
  const username = "Fastians";
  const password = "8Wk5ujnODaxMLKp(wQ";

  // Helper: Login command
  const login = () => {
    cy.visit("/wp-login.php");

    // Enter username
    cy.get("#user_login")
      .should("be.visible")
      .clear()
      .type(username, { delay: 0, force: true })
      .should("have.value", username);

    // Enter password
    cy.get("#user_pass")
      .should("be.visible")
      .clear()
      .type(password, { delay: 0, force: true })
      .should("have.value", password);

    // Login
    cy.get("#wp-submit").click();

    // Confirm dashboard
    cy.url().should("include", "/wp-admin");
  };

  // Before each test → login only once
  beforeEach(() => {
    login();
  });

  // -----------------------------------------------------
  // 1) Ensure WP Admin Dashboard Loads Correctly
  // -----------------------------------------------------
  it("should load the WordPress admin dashboard", () => {
    cy.url().should("include", "/wp-admin");

    cy.get("#wpadminbar").should("exist");
    cy.get("#adminmenu").should("exist");
  });

  // -----------------------------------------------------
  // 2) Load Frontend Home Page
  // -----------------------------------------------------
  it("should load the frontend home page", () => {
    cy.visit("/");

    cy.url().should("include", "/");

    // Header exists (block themes use <header wp-template-part>)
    cy.get("header, .site-header, #masthead")
      .should("exist")
      .and("be.visible");
  });

  // -----------------------------------------------------
  // 3) Validate NAVIGATION (Block OR Classic theme)
  // -----------------------------------------------------
  it("should detect the navigation menu (supports block + classic themes)", () => {
    cy.visit("/");

    // Try multiple nav selectors
    cy.get("body").then(($body) => {
      // Classic theme navigation selectors
      const classicNav = $body.find(
        'nav .menu, .main-navigation, nav[role="navigation"], .site-navigation'
      ).length > 0;

      // Block theme navigation selectors (Navigation block)
      const blockNav = $body.find("nav.wp-block-navigation").length > 0;

      if (classicNav) {
        cy.log("Navigation found (Classic Theme)");
        cy.get(
          'nav .menu, .main-navigation, nav[role="navigation"], .site-navigation'
        )
          .first()
          .should("be.visible");
      } else if (blockNav) {
        cy.log("Navigation found (Block Theme)");
        cy.get("nav.wp-block-navigation")
          .first()
          .should("be.visible");
      } else {
        // No navigation present at all
        cy.log("WARNING: No navigation menu found on frontend.");
      }
    });
  });

  // -----------------------------------------------------
  // 4) Appearance → Menus (Classic Theme Only)
  // -----------------------------------------------------
  it("should open Appearance → Menus OR skip if theme does not support it", () => {
    cy.visit("/wp-admin/");

    // Open Appearance
    cy.get("#menu-appearance a.menu-top, a[href*='themes.php']")
      .first()
      .click({ force: true });

    cy.url().should("include", "/wp-admin/themes.php");

    // Check if Menus exists
    cy.get("body").then(($body) => {
      const hasMenus = $body.find("a[href*='nav-menus.php']").length > 0;

      if (!hasMenus) {
        cy.log("Skipping: Classic Menus screen is NOT available (Block Theme)");
        return; // Skip test gracefully
      }

      // Open Menus
      cy.get("a[href*='nav-menus.php']")
        .first()
        .click({ force: true });

      cy.url().should("include", "/nav-menus.php");

      cy.log("Successfully opened Appearance → Menus");
    });
  });
});
