**
 * Created by Decipher on 01-11-2017.
 * mailtodecipher@gmail.com
 */
angular.module('ngIntlTelInput', []);angular.module('ngIntlTelInput')
    .provider('ngIntlTelInput', function () {
        var me = this;
        var props = {};
        var setFn = function (obj) {
            if (typeof obj === 'object') {
                for (var key in obj) {
                    props[key] = obj[key];
                }
            }
        };
        me.set = setFn;

        me.$get = ['$log', function ($log) {
            return Object.create(me, {
                init: {
                    value: function (elm) {
                        if (!window.intlTelInputUtils) {
                            $log.warn('intlTelInputUtils is not defined. Formatting and validation will not work.');
                        }
                        elm.intlTelInput(props);
                    }
                },
            });
        }];
    });
angular.module('ngIntlTelInput')
    .directive('ngIntlTelInput', ['ngIntlTelInput', '$log', '$window', '$parse','$http',
        function (ngIntlTelInput, $log, $window, $parse,$http) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, elm, attr, ctrl) {
                    // Warning for bad directive usage.
                    if ((!!attr.type && (attr.type !== 'text' && attr.type !== 'tel')) || elm[0].tagName !== 'INPUT') {
                        $log.warn('ng-intl-tel-input can only be applied to a *text* or *tel* input');
                        return;
                    }
                    // console.log("Attributes=> ",attr.geoip)
                    if (attr.onlyCountry) {
                        ngIntlTelInput.set({onlyCountries: [attr.onlyCountry]});
                    }
                    if (attr.allowdropdown != '') {
                        ngIntlTelInput.set({allowDropdown: attr.allowdropdown});
                    }
                    if (attr.autohidedialcode != '') {
                        ngIntlTelInput.set({autoHideDialCode: attr.autohidedialcode});
                    }
                    if (attr.initialcountry != '') {
                        ngIntlTelInput.set({initialCountry: attr.initialcountry});
                    }
                    if (attr.nationalmode != '') {
                        ngIntlTelInput.set({nationalMode: attr.nationalmode});
                    }
                    if (attr.onlycountries != '') {
                        var tempOnlyCountries = new Array();
                        // this will return an array with strings "1", "2", etc.
                        tempOnlyCountries = attr.onlycountries.split(",");
                        ngIntlTelInput.set({onlyCountries: tempOnlyCountries });
                    }
                    if (attr.separatedialcode != '' && attr.separatedialcode == "true") {
                        ngIntlTelInput.set({separateDialCode: true});
                    }
                    if (attr.geoip != '' && attr.geoip == "true") {
                            var country_code ='';
                            $http.get('https://ipinfo.io')
                            .then(function(response) {
                                country_code = response.data.country;
                                elm.intlTelInput('setCountry',country_code)
                            });
                    }
                    // Initialize.
                    ngIntlTelInput.init(elm);
                    // Set Selected Country Data.
                    function setSelectedCountryData(model) {
                        var getter = $parse(model);
                        var setter = getter.assign;
                        setter(scope, elm.intlTelInput('getSelectedCountryData'));
                    }
                    // Handle Country Changes.
                    function handleCountryChange() {
                        setSelectedCountryData(attr.selectedCountry);
                    }
                    // Country Change cleanup.
                    function cleanUp() {
                        angular.element($window).off('countrychange', handleCountryChange);
                    }
                    // Selected Country Data.
                    if (attr.selectedCountry) {
                        setSelectedCountryData(attr.selectedCountry);
                        angular.element($window).on('countrychange', handleCountryChange);
                        scope.$on('$destroy', cleanUp);
                    }
                    // Validation.
                    ctrl.$validators.ngIntlTelInput = function (value) {
                        // if phone number is deleted / empty do not run phone number validation
                        if (value || elm[0].value.length > 0) {
                            return elm.intlTelInput('isValidNumber');
                        } else {
                            return true;
                        }
                    };
                    // Set model value to valid, formatted version.
                    ctrl.$parsers.push(function (value) {
                        return elm.intlTelInput('getNumber');
                    });
                    // Set input value to model value and trigger evaluation.
                    ctrl.$formatters.push(function (value) {
                        if (value) {
                            if(value.charAt(0) !== '+') {
                                value = '+' + value;
                            }
                            elm.intlTelInput('setNumber', value);
                        }
                        return value;
                    });
                }
            };
        }]);
