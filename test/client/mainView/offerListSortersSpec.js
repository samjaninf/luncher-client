describe('OfferList sorters', function() {
  'use strict';
  beforeEach(module('partials'));
  beforeEach(module('offerListSorters'));

  it('should have order state', inject(function(offerOrderState) {
    expect(offerOrderState).toBeDefined();
  }));

  describe('with order state', function() {
    beforeEach(inject(function(offerOrderState) {
      utils.pruneObject(offerOrderState);
      jasmine.addMatchers(offerUtils.matchers);
    }));

    describe('offer sorter directive without numeric', function() {
      var scope;
      beforeEach(function() {
        var compiled = utils.compile('<offers-sorter order-by="location">{{2+2}}</offers-sorter>');
        scope = compiled.scope;
      });

      it('should not have isNumeric set from the attribute', function() {
        expect(scope.isNumeric).toBeFalsy();
      });
    });

    describe('offer sorter directive', function() {
      var element, scope, parentScope;
      beforeEach(function() {
        var compiled = utils.compile('<offers-sorter order-by="location" is-numeric="true">{{2+2}}</offers-sorter>');
        element = compiled.element;
        scope = compiled.scope;
        parentScope = compiled.parentScope;
        spyOn(scope, 'clicked').and.callThrough();
      });

      function clickSorter() {
        $(element.children().first()).click();
      }

      it('should contain 4 in a span', function() {
        expect(element.children().children().html()).toBe('4');
      });

      it('should have asc/desc state on scope', function() {
        expect(scope.isAscending).toBeDefined();
      });

      it('should have default asc state of true', function() {
        expect(scope.isAscending).toBe(true);
      });

      it('should hide asc state from parent scope', function() {
        expect(parentScope.isAscending).toBeUndefined();
      });

      it('should have orderBy value set from the attribute', function() {
        expect(scope.orderBy).toBe('location');
      });

      it('should have isNumeric set from the attribute', function() {
        expect(scope.isNumeric).toBeTruthy();
      });

      it('should call scope\'s clicked method on click', function() {
        clickSorter();
        expect(scope.clicked).toHaveBeenCalled();
      });

      describe('when element clicked', function() {
        beforeEach(function() {
          clickSorter();
        });

        it('should should reverse order for this sorter', function() {
          expect(scope.isAscending).toBe(false);
          clickSorter();
          expect(scope.isAscending).toBe(true);
        });

        it('should change the orderBy value of the state service', inject(function(offerOrderState) {
          expect(offerOrderState.orderBy).toBe('location');
        }));

        it('should set the asc/desc value of the state service', inject(function(offerOrderState) {
          expect(offerOrderState.isAscending).toBe(false);
          clickSorter();
          expect(offerOrderState.isAscending).toBe(true);
        }));
      });

      describe('when state ordered by current directive', function() {
        beforeEach(inject(function(offerOrderState) {
          offerOrderState.orderBy = 'location';
          scope.$apply();
        }));

        it('should be marked active', function() {
          expect(scope.isActive()).toBe(true);
        });
      });

      describe('when state ordered by some other directive', function() {
        beforeEach(inject(function(offerOrderState) {
          offerOrderState.orderBy = 'not-location';
          scope.$apply();
        }));

        it('should not be marked active', function() {
          expect(scope.isActive()).toBe(false);
        });
      });
    });

    describe('with offer sorter \'filter\'', function() {
      var offers, sort;
      beforeEach(inject(function(orderFilter) {
        offers = offerUtils.getMockOffers();
        sort = orderFilter;
      }));

      it('should return same data if offer order state empty', function() {
        var orderedOffers = sort(offers);

        expect(orderedOffers).toHaveIdOrder(['1', '2', '3']);
      });

      it('should return same data if offer order state\'s orderBy field empty', inject(function(offerOrderState) {
        offerOrderState.isAscending = false;

        var orderedOffers = sort(offers);

        expect(orderedOffers).toHaveIdOrder(['1', '2', '3']);
      }));

      it('should order by price ascendingly', inject(function(offerOrderState) {
        offerOrderState.orderBy = 'price';
        offerOrderState.isAscending = true;

        var orderedOffers = sort(offers);

        expect(orderedOffers).toHaveIdOrder(['2', '1', '3']);
      }));

      it('order ascendingly by default', inject(function(offerOrderState) {
        offerOrderState.orderBy = 'price';

        var orderedOffers = sort(offers);

        expect(orderedOffers).toHaveIdOrder(['2', '1', '3']);
      }));

      it('should order by price descendingly', inject(function(offerOrderState) {
        offerOrderState.orderBy = 'price';
        offerOrderState.isAscending = false;

        var orderedOffers = sort(offers);

        expect(orderedOffers).toHaveIdOrder(['3', '1', '2']);
      }));
    });
  });
});