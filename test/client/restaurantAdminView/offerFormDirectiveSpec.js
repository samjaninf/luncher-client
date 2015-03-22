describe('Offer Form', function() {
  'use strict';
  beforeEach(function() {
    module('offerFormDirective', 'partials', function($provide) {
      $provide.provider('fileReader', {
        $get: function() {
          return {};
        }
      });
    });
  });

  describe('previewImage directive', function() {
    var element, $parentScope;
    beforeEach(function() {
      var compiled = utils.compile('<a image-with-preview ng-model="image"/>');
      element = compiled.element;
      $parentScope = compiled.parentScope;
    });

    describe('image selection canceled', function() {
      beforeEach(function() {
        element.prop('files', [undefined]);
        element.triggerHandler('change');
      });

      it('should not set the data url', function() {
        expect($parentScope.image).toBeUndefined();
      });
    });

    describe('image selected', function() {
      var result, file;
      beforeEach(inject(function($q, fileReader) {
        var deferred = $q.defer();
        result = 'result data';
        deferred.resolve(result);
        fileReader.readAsDataUrl = jasmine.createSpy().and.returnValue(deferred.promise);

        file = {
          type: 'image/png',
        };
        element.prop('files', [file]);
        element.triggerHandler('change');
      }));

      it('should set the data url the result', function() {
        expect($parentScope.image.src).toEqual(result);
      });

      describe('and then unselected', function() {
        beforeEach(function() {
          element.prop('files', [undefined]);
          element.triggerHandler('change');
        });

        it('should set the data url to an empty string', function() {
          expect($parentScope.image).toBeUndefined();
        });
      });
    });

    describe('a non-image file selected', function() {
      var file, ngModel;
      beforeEach(function() {
        file = {
          type: 'text/plain',
        };
        element.prop('files', [file]);
        element.triggerHandler('change');
        ngModel = element.data('$ngModelController');
      });

      it('should not set the data url', function() {
        expect($parentScope.image).toBeUndefined();
      });

      it('should have an error', function() {
        expect(ngModel.$error.image).toBe(true);
      });

      describe('and then unselected', function() {
        beforeEach(function() {
          element.prop('files', [undefined]);
          element.triggerHandler('change');
        });

        it('should not set the data url', function() {
          expect($parentScope.image).toBeUndefined();
        });

        it('should not have an error', function() {
          expect(ngModel.$error.image).toBeFalsy();
        });
      });
    });
  });

  describe('offer-form directive', function() {
    var element, $scope, $parentScope, mockTags;

    beforeEach(inject(function($httpBackend) {
      mockTags = offerUtils.getMockTags();
      $httpBackend.expectGET('api/v1/tags').respond(mockTags);
      var compiled = utils.compile('<offer-form on-submit="submitClicked($offer)" on-cancel="cancelClicked()"></offer-form>');
      element = compiled.element;
      $scope = compiled.scope;
      $parentScope = compiled.parentScope;
    }));

    it('should have tags data after we mock-respond to the HTTP request', inject(function($httpBackend) {
      expect($scope.allTags.length).toBe(0);
      $httpBackend.flush();
      expect($scope.allTags.length).toBe(3);
    }));

    describe('with the http requests mock-responded', function() {
      beforeEach(inject(function($httpBackend) {
        $httpBackend.flush();
      }));

      it('should cache the tags request', inject(function($httpBackend) {
        // we'll create another directive and without flushing expect the tags to be resolved
        var compiled = utils.compile('<offer-form></offer-form>');
        expect(compiled.scope.allTags.length).toBe(3);
      }));

      it('should have a date string representing today', function() {
        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        var todayInUTC = Date.parse($scope.today);
        expect(todayInUTC).toEqual(today.getTime() - today.getTimezoneOffset() * 60 * 1000);
      });

      it('should have a new offer ID prefix', function() {
        expect($scope.idPrefix).toEqual('new-offer-');
      });

      describe('getFilteredTags', function() {
        it('should return (mocked) tags that match the query', function() {
          var result = $scope.getFilteredTags('a');
          expect(result.length).toBe(2);
          expect(result[0].name).toBe('kala');
          expect(result[1].name).toBe('siga');
        });

        it('should return (mocked) tags that match the query', function() {
          var result = $scope.getFilteredTags('l');
          expect(result.length).toBe(2);
          expect(result[0].name).toBe('kala');
          expect(result[1].name).toBe('lind');
        });

        it('should return no tags if bad query', function() {
          var result = $scope.getFilteredTags('blablabla');
          expect(result.length).toBe(0);
        });
      });

      describe('isReadyForError', function() {
        it('should return true when dirty, touched and invalid', function() {
          var input = {
            $dirty: true,
            $touched: true,
            $invalid: true,
          };
          expect($scope.isReadyForError(input)).toBe(true);
        });

        it('should return false when not dirty, but touched and invalid', function() {
          var input = {
            $dirty: false,
            $touched: true,
            $invalid: true,
          };
          expect($scope.isReadyForError(input)).toBe(false);
        });

        it('should return true when when first input is false, second true', function() {
          var input1 = {
            $dirty: false,
            $touched: true,
            $invalid: true,
          };
          var input2 = {
            $dirty: true,
            $touched: true,
            $invalid: true,
          };
          expect($scope.isReadyForError(input1, input2)).toBe(true);
        });
      });



      describe('submitOffer', function() {
        beforeEach(function() {
          $parentScope.submitClicked = jasmine.createSpy();
        });

        describe('with the form filled', function() {
          beforeEach(function() {
            $scope.title = 'a title';
            $scope.ingredients = [{
              text: 'ingredient1'
            }, {
              text: 'ingredient2'
            }];
            $scope.tags = [{
              name: 'tag1',
              a: 'a'
            }, {
              name: 'tag2',
              a: 'b'
            }];
            $scope.price = 2.5;
            $scope.date = new Date(2015, 3, 15);
            $scope.fromTime = new Date(1970, 0, 1, 10, 0, 0);
            $scope.toTime = new Date(1970, 0, 1, 15, 0, 0);
            $scope.image = 'image data';
          });

          it('should call the specified function with $offer as the argument', function() {
            $scope.submitOffer();

            expect($parentScope.submitClicked).toHaveBeenCalledWith({
              title: 'a title',
              ingredients: ['ingredient1', 'ingredient2'],
              tags: ['tag1', 'tag2'],
              price: 2.5,
              from_time: new Date(2015, 3, 15, 10, 0, 0),
              to_time: new Date(2015, 3, 15, 15, 0, 0),
              image: 'image data',
            });
          });
        });
      });

      describe('cancelOffer', function() {
        beforeEach(function() {
          $parentScope.cancelClicked = jasmine.createSpy();
        });

        it('should call the specified function with $offer as the argument', function() {
          $scope.cancelFunction();

          expect($parentScope.cancelClicked).toHaveBeenCalled();
        });
      });
    });
  });

  describe('edit an offer with offer-form directive', function() {
    var element, $scope, $parentScope;

    beforeEach(inject(function($httpBackend) {
      $httpBackend.whenGET('api/v1/tags').respond(offerUtils.getMockTags());
      var compiled = utils.compile('<offer-form edit="prefillOffer" on-submit="submitClicked($offer)"></offer-form>', function(parentScope) {
        parentScope.prefillOffer = {
          _id: '11',
          title: 'a title',
          ingredients: ['ingredient1', 'ingredient2'],
          tags: ['tag1', 'tag2'],
          price: 2.5,
          from_time: new Date(2015, 3, 15, 10, 0, 0),
          to_time: new Date(2015, 3, 15, 15, 0, 0),
          image: 'image data',
          additionalData: 'just something extra',
        };
      });
      element = compiled.element;
      $scope = compiled.scope;
      $parentScope = compiled.parentScope;
      $parentScope.submitClicked = jasmine.createSpy();
      $httpBackend.flush();
    }));

    it('should have an edit offer ID prefix', function() {
      expect($scope.idPrefix).toEqual('edit-offer-11-');
    });

    it('should prefill the inner scope variables', function() {
      expect($scope.title).toBe('a title');
      expect($scope.ingredients).toEqual([{
        text: 'ingredient1'
      }, {
        text: 'ingredient2'
      }]);
      expect($scope.tags).toEqual([{
        name: 'tag1'
      }, {
        name: 'tag2'
      }]);
      expect($scope.price).toEqual(2.5);
      expect($scope.date).toEqual(new Date(2015, 3, 15));
      expect($scope.fromTime).toEqual(new Date(1970, 0, 1, 10, 0, 0));
      expect($scope.toTime).toEqual(new Date(1970, 0, 1, 15, 0, 0));
      expect($scope.image).toEqual('image data');
    });

    describe('submit', function() {
      it('should copy and extend the the original offer', function() {
        $scope.title = 'a changed title';
        $scope.submitOffer();

        expect($parentScope.submitClicked).toHaveBeenCalledWith({
          _id: '11',
          title: 'a changed title',
          ingredients: ['ingredient1', 'ingredient2'],
          tags: ['tag1', 'tag2'],
          price: 2.5,
          from_time: new Date(2015, 3, 15, 10, 0, 0),
          to_time: new Date(2015, 3, 15, 15, 0, 0),
          image: 'image data',
          additionalData: 'just something extra',
        });
      });
    });
  });
});
