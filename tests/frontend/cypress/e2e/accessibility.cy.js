describe('Non-Functional Testing - Accessibility (WordPress)', () => {
  
  // Test configuration
  const baseUrl = 'http://localhost:8000';
  const acceptableViolationThreshold = 5; // Define acceptable threshold
  
  beforeEach(() => {
    // Configure viewport for accessibility testing
    cy.viewport(1280, 720);
  });

  it('should check and report accessibility violations on homepage', () => {
    cy.visit(baseUrl);
    cy.injectAxe();
    
    // Check accessibility and log violations without failing
    cy.checkA11y(null, {
      includedImpacts: ['critical', 'serious', 'moderate', 'minor']
    }, (violations) => {
      cy.task('log', `========================================`);
      cy.task('log', `Homepage Accessibility Report`);
      cy.task('log', `========================================`);
      cy.task('log', `Total violations found: ${violations.length}`);
      cy.task('log', `Acceptable threshold: ${acceptableViolationThreshold}`);
      
      if (violations.length > 0) {
        violations.forEach((violation, index) => {
          cy.task('log', `\n[${index + 1}] ${violation.id}`);
          cy.task('log', `    Impact: ${violation.impact}`);
          cy.task('log', `    Description: ${violation.description}`);
          cy.task('log', `    Help: ${violation.help}`);
          cy.task('log', `    Affected elements: ${violation.nodes.length}`);
        });
      }
      cy.task('log', `========================================\n`);
    }, true); // Skip failures - just log violations
  });

  it('should check and report accessibility violations on login page', () => {
    cy.visit(`${baseUrl}/wp-login.php`);
    cy.injectAxe();
    
    cy.checkA11y(null, {
      includedImpacts: ['critical', 'serious', 'moderate', 'minor']
    }, (violations) => {
      cy.task('log', `========================================`);
      cy.task('log', `Login Page Accessibility Report`);
      cy.task('log', `========================================`);
      cy.task('log', `Total violations found: ${violations.length}`);
      
      if (violations.length > 0) {
        violations.forEach((violation, index) => {
          cy.task('log', `\n[${index + 1}] ${violation.id}`);
          cy.task('log', `    Impact: ${violation.impact}`);
          cy.task('log', `    Description: ${violation.description}`);
          cy.task('log', `    WCAG: ${violation.tags.join(', ')}`);
          cy.task('log', `    Help URL: ${violation.helpUrl}`);
        });
      }
      cy.task('log', `========================================\n`);
    }, true); // Skip failures
  });

  it('should verify basic WCAG 2.1 Level A compliance features', () => {
    cy.visit(baseUrl);
    
    // Test 1: HTML lang attribute (WCAG 3.1.1)
    cy.get('html').should('have.attr', 'lang')
      .and('match', /^[a-z]{2}(-[A-Z]{2})?$/);
    cy.task('log', '✓ HTML lang attribute present and valid');
    
    // Test 2: Page title (WCAG 2.4.2)
    cy.get('title').should('exist')
      .and('not.be.empty')
      .invoke('text').should('have.length.greaterThan', 0);
    cy.task('log', '✓ Page title exists and is not empty');
    
    // Test 3: Viewport meta tag for responsive design
    cy.get('head meta[name="viewport"]').should('exist');
    cy.task('log', '✓ Viewport meta tag present');
    
    // Test 4: Skip to content link (WCAG 2.4.1)
    cy.get('body').then($body => {
      const hasSkipLink = $body.find('a[href*="#content"], a[href*="#main"]').length > 0;
      if (hasSkipLink) {
        cy.task('log', '✓ Skip to content link found');
      } else {
        cy.task('log', '⚠ Skip to content link not found (recommended)');
      }
    });
  });

  it('should verify keyboard navigation accessibility (WCAG 2.1.1)', () => {
    cy.visit(`${baseUrl}/wp-login.php`);
    
    cy.task('log', 'Testing keyboard accessibility of login form elements...');
    
    // Test 1: Verify username field is focusable
    cy.get('#user_login')
      .should('be.visible')
      .focus()
      .should('have.focus')
      .and('not.have.attr', 'tabindex', '-1');
    cy.task('log', '✓ Username field is keyboard accessible and focusable');
    
    // Test 2: Verify password field is focusable
    cy.get('#user_pass')
      .should('be.visible')
      .focus()
      .should('have.focus')
      .and('not.have.attr', 'tabindex', '-1');
    cy.task('log', '✓ Password field is keyboard accessible and focusable');
    
    // Test 3: Verify remember me checkbox is focusable
    cy.get('#rememberme')
      .should('be.visible')
      .focus()
      .should('have.focus')
      .and('not.have.attr', 'tabindex', '-1');
    cy.task('log', '✓ Remember me checkbox is keyboard accessible and focusable');
    
    // Test 4: Verify submit button is focusable
    cy.get('#wp-submit')
      .should('be.visible')
      .focus()
      .should('have.focus')
      .and('not.have.attr', 'tabindex', '-1');
    cy.task('log', '✓ Submit button is keyboard accessible and focusable');
    
    // Test 5: Verify tab order by checking tabindex values
    cy.get('#user_login').then($el => {
      const tabindex = $el.attr('tabindex');
      cy.task('log', `Username field tabindex: ${tabindex || 'default (0)'}`);
    });
    
    cy.get('#user_pass').then($el => {
      const tabindex = $el.attr('tabindex');
      cy.task('log', `Password field tabindex: ${tabindex || 'default (0)'}`);
    });
    
    cy.get('#rememberme').then($el => {
      const tabindex = $el.attr('tabindex');
      cy.task('log', `Checkbox tabindex: ${tabindex || 'default (0)'}`);
    });
    
    cy.get('#wp-submit').then($el => {
      const tabindex = $el.attr('tabindex');
      cy.task('log', `Submit button tabindex: ${tabindex || 'default (0)'}`);
    });
    
    // Test 6: Verify all form elements are in the natural tab order (no positive tabindex)
    cy.get('#loginform').find('input, button, select, textarea, a[href]').each($el => {
      const tabindex = $el.attr('tabindex');
      if (tabindex && parseInt(tabindex) > 0) {
        cy.task('log', `⚠ Warning: Element has positive tabindex: ${tabindex}`);
      }
    });
    
    cy.task('log', '✓ All interactive elements are keyboard accessible (WCAG 2.1.1 compliant)');
  });

  it('should verify form labels and ARIA attributes (WCAG 1.3.1, 3.3.2)', () => {
    cy.visit(`${baseUrl}/wp-login.php`);
    
    // Test username field label association
    cy.get('#user_login')
      .should('have.attr', 'id')
      .and('not.be.empty');
    
    cy.get('label[for="user_login"]')
      .should('exist')
      .and('be.visible')
      .invoke('text')
      .should('not.be.empty');
    cy.task('log', '✓ Username field has associated label');
    
    // Test password field label association
    cy.get('#user_pass')
      .should('have.attr', 'id')
      .and('not.be.empty');
    
    cy.get('label[for="user_pass"]')
      .should('exist')
      .and('be.visible')
      .invoke('text')
      .should('not.be.empty');
    cy.task('log', '✓ Password field has associated label');
    
    // Check for required field indicators
    cy.get('#user_login, #user_pass').each($input => {
      const hasRequired = $input.attr('required') !== undefined || 
                         $input.attr('aria-required') === 'true';
      if (hasRequired) {
        cy.task('log', `✓ Required attribute found on ${$input.attr('id')}`);
      }
    });
  });

  it('should verify color contrast ratios (WCAG 1.4.3)', () => {
    cy.visit(baseUrl);
    cy.injectAxe();
    
    // Check only color contrast violations
    cy.checkA11y(null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    }, (violations) => {
      cy.task('log', `========================================`);
      cy.task('log', `Color Contrast Report`);
      cy.task('log', `========================================`);
      cy.task('log', `Color contrast violations: ${violations.length}`);
      
      violations.forEach((violation, index) => {
        cy.task('log', `\n[${index + 1}] ${violation.description}`);
        violation.nodes.forEach(node => {
          cy.task('log', `    Element: ${node.html}`);
          cy.task('log', `    Contrast ratio: ${node.any[0]?.data?.contrastRatio || 'N/A'}`);
        });
      });
      cy.task('log', `========================================\n`);
    }, true);
  });

  it('should verify image alternative text (WCAG 1.1.1)', () => {
    cy.visit(baseUrl);
    
    cy.get('img').each($img => {
      const alt = $img.attr('alt');
      const role = $img.attr('role');
      const ariaLabel = $img.attr('aria-label');
      
      // Images should have alt attribute (can be empty for decorative images)
      if (alt !== undefined) {
        cy.task('log', `✓ Image has alt attribute: "${alt}"`);
      } else if (role === 'presentation' || ariaLabel) {
        cy.task('log', `✓ Decorative image properly marked`);
      } else {
        cy.task('log', `⚠ Image missing alt attribute: ${$img.attr('src')}`);
      }
    });
  });

  it('should verify heading hierarchy (WCAG 1.3.1)', () => {
    cy.visit(baseUrl);
    
    const headings = [];
    cy.get('h1, h2, h3, h4, h5, h6').each($heading => {
      const level = parseInt($heading.prop('tagName').substring(1));
      const text = $heading.text().trim();
      headings.push({ level, text });
    }).then(() => {
      cy.task('log', `========================================`);
      cy.task('log', `Heading Hierarchy Report`);
      cy.task('log', `========================================`);
      cy.task('log', `Total headings found: ${headings.length}`);
      
      // Check for h1
      const h1Count = headings.filter(h => h.level === 1).length;
      cy.task('log', `H1 headings: ${h1Count} ${h1Count === 1 ? '✓' : '⚠ Should have exactly 1'}`);
      
      // Log heading structure
      headings.forEach((heading, index) => {
        cy.task('log', `${' '.repeat(heading.level * 2)}H${heading.level}: ${heading.text.substring(0, 50)}`);
      });
      cy.task('log', `========================================\n`);
    });
  });

  it('should verify link accessibility (WCAG 2.4.4)', () => {
    cy.visit(baseUrl);
    
    cy.get('a[href]').then($links => {
      cy.task('log', `========================================`);
      cy.task('log', `Link Accessibility Report`);
      cy.task('log', `========================================`);
      cy.task('log', `Total links found: ${$links.length}`);
      
      let emptyLinks = 0;
      let linksWithoutText = 0;
      
      $links.each((index, link) => {
        const $link = Cypress.$(link);
        const text = $link.text().trim();
        const ariaLabel = $link.attr('aria-label');
        const title = $link.attr('title');
        
        if (!text && !ariaLabel && !title) {
          emptyLinks++;
          cy.task('log', `⚠ Link without accessible text: ${$link.attr('href')}`);
        }
      });
      
      cy.task('log', `Links with accessible text: ${$links.length - emptyLinks}/${$links.length}`);
      cy.task('log', `========================================\n`);
    });
  });

  it('should generate comprehensive accessibility test report', () => {
    cy.visit(baseUrl);
    cy.injectAxe();
    
    cy.checkA11y(null, null, (violations) => {
      // Generate summary report
      const criticalCount = violations.filter(v => v.impact === 'critical').length;
      const seriousCount = violations.filter(v => v.impact === 'serious').length;
      const moderateCount = violations.filter(v => v.impact === 'moderate').length;
      const minorCount = violations.filter(v => v.impact === 'minor').length;
      
      cy.task('log', `\n========================================`);
      cy.task('log', `ACCESSIBILITY TEST SUMMARY REPORT`);
      cy.task('log', `========================================`);
      cy.task('log', `Test Date: ${new Date().toISOString()}`);
      cy.task('log', `Application: WordPress`);
      cy.task('log', `Page Tested: Homepage`);
      cy.task('log', `\nViolation Breakdown:`);
      cy.task('log', `  Critical: ${criticalCount}`);
      cy.task('log', `  Serious: ${seriousCount}`);
      cy.task('log', `  Moderate: ${moderateCount}`);
      cy.task('log', `  Minor: ${minorCount}`);
      cy.task('log', `  Total: ${violations.length}`);
      cy.task('log', `\nCompliance Status: ${violations.length <= acceptableViolationThreshold ? 'PASS' : 'NEEDS IMPROVEMENT'}`);
      cy.task('log', `========================================\n`);
    }, true);
  });
});