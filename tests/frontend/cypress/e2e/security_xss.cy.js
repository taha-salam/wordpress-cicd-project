describe('Security Test - XSS Protection', () => {
  it('should not execute script in login field', () => {
    const payload = `<script>alert('XSS')</script>`;

    cy.visit('http://localhost:8000/wp-login.php');

    cy.get('#user_login').type(payload);
    cy.get('#user_pass').type('fakepassword');

    cy.get('#wp-submit').click();

    // Expect the payload to appear *escaped* or not appear at all
    cy.contains(payload).should('not.exist');
  });
});
