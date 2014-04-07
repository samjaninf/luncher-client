describe('OfferList cotrollers', function() {
  'use strict';
  beforeEach(module('offerListControllers'));

  describe('Search controller', function() {
    var $scope;

    beforeEach(inject(function ($rootScope, $controller) {
      $scope = $rootScope.$new();
      $controller('SearchCtrl', {$scope: $scope});
    }));

    it('should update filter state service', inject(function (offerFilterState) {
      $scope.query = "Who is ...";

      $scope.$apply();

      expect(offerFilterState.query).toBe("Who is ...");
    }));
  });

  describe('TagList controller', function() {
    var $scope;

    beforeEach(inject(function ($rootScope, $controller) {
      $scope = $rootScope.$new();
      $controller('TagListCtrl', {$scope: $scope});

      $scope.tagList = [
        {'id': 'kala',
         'label': 'Kalast'},
        {'id': 'lind',
         'label': 'Linnust'},
        {'id': 'siga',
         'label': 'Seast'}
      ];
    }));

    describe('tag selection listener', function() {
      it('should set selected tags to empty list if nothing selected (undefined)', inject(function (offerFilterState) {
        $scope.$apply();

        expect(offerFilterState.selectedTags.length).toBe(0);
      }));

      it('should set selected tags to empty list if nothing selected (false)', inject(function (offerFilterState) {
        $scope.tagList[0].selected = false;

        $scope.$apply();

        expect(offerFilterState.selectedTags.length).toBe(0);
      }));

      it('should add selected tag to list', inject(function (offerFilterState) {
        $scope.tagList[1].selected = true;

        $scope.$apply();

        expect(offerFilterState.selectedTags.length).toBe(1);
        expect(offerFilterState.selectedTags[0]).toBe('lind');
      }));

      describe('with 2 tags selected', function() {

        beforeEach(function (){
          $scope.tagList[1].selected = true;
          $scope.tagList[2].selected = true;

          $scope.$apply();
        });

        it('should add multiple selected tags to list', inject(function (offerFilterState) {
          expect(offerFilterState.selectedTags.length).toBe(2);
          expect(offerFilterState.selectedTags).toContain('lind');
          expect(offerFilterState.selectedTags).toContain('siga');
        }));

        it('should remove from selected tags to list', inject(function (offerFilterState) {
          $scope.tagList[2].selected = false;

          $scope.$apply();

          expect(offerFilterState.selectedTags.length).toBe(1);
          expect(offerFilterState.selectedTags).toContain('lind');
        }));
      });
    });
  });

  describe('OfferListCtrl', function(){
    var $scope;

    beforeEach(inject(function($rootScope, $controller) {
      $scope = $rootScope.$new();
      $controller('OfferListCtrl', {$scope: $scope});
    }));

    it('should create "offers" model with 3 offers', function() {
      expect($scope.offers.length).toBe(3);
    });
  });
});