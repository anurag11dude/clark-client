 /// <reference types="cypress" />

import Chance from 'chance';
import { SSL_OP_CISCO_ANYCONNECT } from 'constants';
const chance = new Chance();

describe('Browse', () => {
    const email = chance.email();

    beforeEach(() => {
        // Return to home page before each test
        cy.visit('http://localhost:4201/home');
    });   
    // =============================================================
    // /browse testing
    // =============================================================
    it('Click a card and see details page', () => {
        // Type in to search bar
        cy.get('.search-input').type('Nick');

        // Click search 
        cy.get('.button.bad').eq(0).click();

        // Wait for learning object cards to load
        cy.wait(1000);

         // Assert URL 
         cy.url().should('include', 'browse');

        // Click first card and navigate to details page 
        cy.get('.learning-object').first().click();

        // Assert URL 
         cy.url().should('include', 'details');
    });

    it('Filter results', () => {
        // Type in to search bar
        cy.get('.search-input').type('Sidd');

        // Click search 
        cy.get('.button.bad').eq(0).click();

        // Pick filter options
        // Length
        cy.get('.clark-filter.vertical').children('.filter-section').children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').first().children('span').children('clark-checkbox').children('.checkbox').click();
        cy.get('.clark-filter.vertical').children('.filter-section').children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').eq(1).children('span').children('clark-checkbox').children('.checkbox').click();
        cy.get('.clark-filter.vertical').children('.filter-section').children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').eq(2).children('span').children('clark-checkbox').children('.checkbox').click();
        cy.get('.clark-filter.vertical').children('.filter-section').children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').eq(3).children('span').children('clark-checkbox').children('.checkbox').click();
        cy.get('.clark-filter.vertical').children('.filter-section').children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').eq(4).children('span').children('clark-checkbox').children('.checkbox').click();
        
        // Academic level
        cy.get('.clark-filter.vertical').children('.filter-section').eq(1).children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').first().children('span').children('clark-checkbox').children('.checkbox').click();
        cy.get('.clark-filter.vertical').children('.filter-section').eq(1).children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').eq(1).children('span').children('clark-checkbox').children('.checkbox').click();
        cy.get('.clark-filter.vertical').children('.filter-section').eq(1).children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').eq(2).children('span').children('clark-checkbox').children('.checkbox').click();
        cy.get('.clark-filter.vertical').children('.filter-section').eq(1).children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').eq(3).children('span').children('clark-checkbox').children('.checkbox').click();
        cy.get('.clark-filter.vertical').children('.filter-section').eq(1).children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').eq(4).children('span').children('clark-checkbox').children('.checkbox').click();
        cy.get('.clark-filter.vertical').children('.filter-section').eq(1).children('.filter-section-inner').children('.filter-section-type.select-many').children('.filter.filter-checkbox').eq(5).children('span').children('clark-checkbox').children('.checkbox').click();
    });

    it('Clear search', () => {
        // Type in to search bar
        cy.get('.search-input').type('Sidd');

        // Click search 
        cy.get('.button.bad').eq(0).click();

        // Click clear search
        cy.get('.content').children('.column-title').children('span').first().children('.clear-search').click();

        // Assert URL
        cy.url().should('include', 'browse');
    });
    
    it('Sort results', () => {
       // Type in to search bar
       cy.get('.search-input').type('Sidd');

       // Click search 
       cy.get('.button.bad').eq(0).click();

        // Click Sort
        cy.get('.content').children('.column-title').children('.results-options').children('.sort').click();

        // Pick sort option
        cy.get('.popup.dropdown').eq(1).children('ul').children('li').first().click({ multiple: true });

        // Click Sort
        cy.get('.content').children('.column-title').children('.results-options').children('.sort').click();

        // Pick sort option
        cy.get('.popup.dropdown').eq(1).children('ul').children('li').eq(1).click({ multiple: true });

        // Click Sort
        cy.get('.content').children('.column-title').children('.results-options').children('.sort').click();

        // Pick sort option
        cy.get('.popup.dropdown').eq(1).children('ul').children('li').eq(2).click({ multiple: true });

        // Click Sort
        cy.get('.content').children('.column-title').children('.results-options').children('.sort').click();

         // Pick sort option
         cy.get('.popup.dropdown').eq(1).children('ul').children('li').eq(3).click({ multiple: true });

        // Finally, click the red x
        cy.get('.content').children('.column-title').children('.results-options').children('.sort').children('.removeSort').children('.fa-times').click();
    });
});