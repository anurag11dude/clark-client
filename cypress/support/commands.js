import { updateShorthandPropertyAssignment } from "../../node_modules/typescript";

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// Login help method 
Cypress.Commands.add('login', () => {
     // Click sign in button 
     cy.contains('Sign in').click();

     // Assert URL 
     cy.url().should('include', 'login');

     // Enter login info 
     cy.get('input[name=username]').type('cypress');
     cy.get('input[name=password]').type('Clarktesting1!');
     cy.get('.auth-button').click();
});

// Method that prevents uncaught exceptions from failing otherwise working tests
// This is referenced in the learning object builder testing
Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})