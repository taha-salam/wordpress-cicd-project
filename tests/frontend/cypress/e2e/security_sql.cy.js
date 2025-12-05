describe('Security Test - SQL Injection Protection', () => {
  it('should not allow SQL injection in login form', () => {
    const sqlPayload = "' OR '1'='1";

    cy.visit('http://localhost:8000/wp-login.php');

    cy.get('#user_login').type(sqlPayload);
    cy.get('#user_pass').type(sqlPayload);

    cy.get('#wp-submit').click();

    // Verify login did NOT succeed
    cy.url().should('include', 'wp-login.php');

    // Optional: check error message contains "not registered" or "incorrect"
    cy.get('#login_error').should('be.visible');
  });
});
