describe("Auth", () => {
  it("redirects unauthenticated visitors to /login", () => {
    cy.visit("/home", { failOnStatusCode: false });
    cy.location("pathname", { timeout: 10000 }).should("eq", "/login");
    cy.contains("Welcome").should("be.visible");
  });

  it("shows validation error when fields are empty", () => {
    cy.visit("/login");
    cy.contains("button", "Sign in").click();
    cy.contains("Enter email and password").should("be.visible");
  });
});
