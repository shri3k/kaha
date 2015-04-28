/**
 * plexusSelect Module
 *
 * Description
 */
angular.module('plexusSelect', [])
.directive('plexusSelect', ['$ionicModal',
           function($ionicModal) {
               // Runs during compile
               return {
                   scope: {
                       'items': '=',
                       'text': '@',
                       'headerText': '@',
                       'textField': '@',
                       'valueField': '@',
                       'placeholderText':'@',
                       'callback': '&'
                   },
                   require: 'ngModel',
                   restrict: 'E',
                   templateUrl: 'templates/plexusSelect.html',
                   link: function($scope, iElm, iAttrs, ngModel) {

                       if (!ngModel) return; // do nothing if no ng-model
                       $scope.allowEmpty = iAttrs.allowEmpty === 'false' ? false : true;
                       $scope.defaultText = $scope.text || '';
                       $ionicModal.fromTemplateUrl('plexusSelectItems.html', {
                           'scope': $scope
                       }).then(function(modal) {
                           $scope.modal = modal;
                           //$scope.modal['backdropClickToClose'] = false;
                       });
                       $scope.showItems = function($event) {
                           $event.preventDefault();
                           $scope.modal.show();
                       };
                       $scope.hideItems = function() {
                           $scope.modal.hide();
                       };
                       /* Destroy modal */
                       $scope.$on('$destroy', function() {
                           $scope.modal.remove();
                       });
                       $scope.viewModel = { search: '' };
                       $scope.clearSearch = function() {
                           $scope.viewModel.search = '';
                       };
                       /* Get field name and evaluate */
                       $scope.getItemName = function(field, item) {
                           if (field && item) {
                               return $scope.$eval(field, item);
                           }
                       };
                       $scope.validateSingle = function(item) {
                           $scope.text = item;
                           $scope.value = item;
                           $scope.hideItems();
                           if (typeof $scope.callback == 'function') {
                               $scope.callback($scope.value);
                           }
                           ngModel.$setViewValue($scope.value);
                       };
                       $scope.$watch('text', function(value) {
                           if ($scope.defaultText === value) $scope.placeholder = 'placeholderGray';
                           else $scope.placeholder = 'placeholderBlack';
                       });
                   }
               };
           }
])
