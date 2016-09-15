angular.module('common.hcs-dropdown2',
    ['ui.bootstrap.position'])

    .service('hcsDropdown2Utils', ['$document', '$window', function($document, $window) {
        var BODY_SCROLLBAR_WIDTH;
        this.getBodyScrollbarWidth = function() {
            if (!BODY_SCROLLBAR_WIDTH) {
                var bodyElem = $document.find('body');
                bodyElem.addClass('uib-position-body-scrollbar-measure');
                BODY_SCROLLBAR_WIDTH = $window.innerWidth - bodyElem[0].clientWidth;
                BODY_SCROLLBAR_WIDTH = isFinite(BODY_SCROLLBAR_WIDTH) ? BODY_SCROLLBAR_WIDTH : 0;
                bodyElem.removeClass('uib-position-body-scrollbar-measure');
            }
            return BODY_SCROLLBAR_WIDTH;
        };
    }])
    .controller('hcsDropdown2Ctrl', [
        '$scope', '$element', '$attrs', '$parse', 'dropdownService', '$animate',
        '$position', '$document', 'hcsDropdown2Utils', '$timeout',
        function ($scope, $element, $attrs, $parse, dropdownService, $animate,
                  $position, $document, hcsDropdown2Utils, $timeout) {
            var self = this,
                scope = $scope.$new(), // create a child scope so we are not polluting original one
                getIsOpen,
                setIsOpen = angular.noop,
                toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop,
                appendTo = $document.find('body');

            this.init = function () {
                if ($attrs.isOpen) {
                    getIsOpen = $parse($attrs.isOpen);
                    setIsOpen = getIsOpen.assign;

                    $scope.$watch(getIsOpen, function (value) {
                        scope.isOpen = !!value;
                    });
                }

                if (self.dropdownMenu) {
                    appendTo.append(self.dropdownMenu);
                    $element.on('$destroy', function handleDestroyEvent() {
                        self.dropdownMenu.remove();
                    });
                }
            };

            this.toggle = function (open) {
                scope.isOpen = arguments.length ? !!open : !scope.isOpen;
                if (angular.isFunction(setIsOpen)) {
                    setIsOpen(scope, scope.isOpen);
                }

                return scope.isOpen;
            };

            // Allow other directives to watch status
            this.isOpen = function () {
                return scope.isOpen;
            };

            scope.getToggleElement = function () {
                return self.toggleElement;
            };

            scope.getAutoClose = function () {
                return $attrs.autoClose || 'always'; //or 'outsideClick' or 'disabled'
            };

            scope.getDropdownElement = function () {
                return self.dropdownMenu;
            };

            scope.focusToggleElement = function () {
                if (self.toggleElement) {
                    self.toggleElement[0].focus();
                }
            };

            function updatePosition(_isOpen, isAsync) {
                function refresh() {
                    var pos = $position.positionElements($element, self.dropdownMenu, 'bottom-left', true);
                    var css = {
                        top: pos.top + 'px',
                        display: _isOpen ? 'block' : 'none'
                    };

                    var rightalign = self.dropdownMenu.hasClass('dropdown-menu-right');
                    if (!rightalign) {
                        css.left = pos.left + 'px';
                        css.right = 'auto';
                    } else {
                        css.left = 'auto';

                        var scrollParent = $document[0].documentElement;
                        var scrollbarWidth = hcsDropdown2Utils.getBodyScrollbarWidth();
                        var heightOverflow = scrollParent.scrollHeight > scrollParent.clientHeight;
                        if (!(heightOverflow && scrollbarWidth)) {
                            scrollbarWidth = 0;
                        }
                        css.right = window.innerWidth - scrollbarWidth - (pos.left + $element.prop('offsetWidth')) + 'px';
                    }
                    self.dropdownMenu.css(css);
                }

                if (self.dropdownMenu) {
                    if (isAsync) {
                        refresh();
                        $timeout(refresh);
                    } else {
                        refresh();
                    }
                }
            }

            $(window).on('resize.hcsDropdown2', function () {
                scope.$apply(function() {
                    // if window have been resized then close
                    if (scope.isOpen) {
                        scope.isOpen = false;
                    }
                    //updatePosition(scope.isOpen, false);
                });
            });

            scope.$on('$destroy',function () {
                $(window).off('resize.hcsDropdown2');
            });

            scope.$watch('isOpen', function (isOpen, wasOpen) {
                updatePosition(isOpen, true);
                if (isOpen) {
                    scope.focusToggleElement();
                    dropdownService.open(scope);
                } else {
                    dropdownService.close(scope);
                }

                if (angular.isFunction(setIsOpen)) {
                    setIsOpen($scope, isOpen);
                }

                if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
                    toggleInvoker($scope, {open: !!isOpen});
                }
            });
        }])

    .directive('hcsDropdown2', function () {
        return {
            controller: 'hcsDropdown2Ctrl',
            link: function (scope, element, attrs, dropdownCtrl) {
                dropdownCtrl.init();
            }
        };
    })

    .directive('hcsDropdown2Menu', function () {
        return {
            restrict: 'A',
            require: '?^hcsDropdown2',
            link: function (scope, element, attrs, dropdownCtrl) {
                if (!dropdownCtrl) {
                    return;
                }

                if (!dropdownCtrl.dropdownMenu) {
                    dropdownCtrl.dropdownMenu = element;
                }
            }
        };
    })

    .directive('hcsDropdown2Toggle', function () {
        return {
            require: '?^hcsDropdown2',
            link: function (scope, element, attrs, dropdownCtrl) {
                if (!dropdownCtrl) {
                    return;
                }

                dropdownCtrl.toggleElement = element;

                function toggleDropdown(event) {
                    event.preventDefault();
                    if (!element.hasClass('disabled') && !attrs.disabled) {
                        scope.$apply(function () {
                            dropdownCtrl.toggle();
                        });
                    }
                }

                element.on('click.hcsDropdown2', toggleDropdown);

                // WAI-ARIA
                element.attr({'aria-haspopup': true, 'aria-expanded': false});
                scope.$watch(dropdownCtrl.isOpen, function (isOpen) {
                    element.attr('aria-expanded', !!isOpen);
                });

                scope.$on('$destroy', function () {
                    element.off('click.hcsDropdown2', toggleDropdown);
                });
            }
        };
    });
