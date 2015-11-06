angular.module("zakaz-xd.main").run(["$templateCache", function($templateCache) {$templateCache.put("app/dialogs/error-dialog.tpl.html","<div class=\"modal-header\"><button type=\"button\" class=\"close\" ng-click=\"close()\" aria-label=\"Закрыть\"><span aria-hidden=\"true\">&times;</span></button><h4 class=\"modal-title\">Ошибка</h4></div><div class=\"modal-body\"><div role=\"alert\" class=\"alert alert-danger\">{{error.message}}</div><pre data-ng-if=\"error.stack && printStack\">{{error.stack}}></pre></div><div class=\"modal-footer\"><button class=\"btn btn-primary\" ng-click=\"close()\">Закрыть</button></div>");
$templateCache.put("app/dialogs/info-dialog.tpl.html","<div class=\"modal-header\"><button type=\"button\" class=\"close\" ng-click=\"close()\" aria-label=\"Закрыть\"><span aria-hidden=\"true\">&times;</span></button><h4 ng-if=\"title\" class=\"modal-title\">{{title}}</h4><h4 ng-if=\"!title\" class=\"modal-title\">Информация</h4></div><div class=\"modal-body\"><div role=\"alert\" class=\"alert alert-success\" ng-bind-html=\"message\"></div></div><div class=\"modal-footer\"><button class=\"btn btn-primary\" ng-click=\"close()\">Закрыть</button></div>");
$templateCache.put("app/dialogs/yes-no-dialog.tpl.html","<div class=\"modal-header\"><button type=\"button\" class=\"close\" ng-click=\"close()\" aria-label=\"Закрыть\"><span aria-hidden=\"true\">&times;</span></button><h4 ng-if=\"title\" class=\"modal-title\">{{title}}</h4><h4 ng-if=\"!title\" class=\"modal-title\">Запрос на изменение</h4></div><div class=\"modal-body\"><p ng-bind-html=\"message\"></p></div><div class=\"modal-footer\"><button class=\"btn btn-primary\" ng-click=\"yes()\">Да</button> <button class=\"btn btn-default\" ng-click=\"no()\">Нет</button></div>");
$templateCache.put("app/includes/footer.tpl.html","<div class=\"copyright\">© 2015 Заказы \"Хлебный Дом\"</div>");
$templateCache.put("app/includes/header.tpl.html","<div class=\"navbar-inner\"><button type=\"button\" class=\"navbar-toggle\" data-toggle=\"collapse\" data-target=\".navbar-collapse\"><span class=\"sr-only\">Toggle Navigation</span> <span class=\"icon-bar\"></span> <span class=\"icon-bar\"></span> <span class=\"icon-bar\"></span></button><nav class=\"collapse navbar-collapse\" role=\"navigation\"><ul class=\"nav navbar-nav navbar-right\"><li ng-show=\"isLogin() && AuthService.hasAccessByCodes(\'VIEW_OWN_ORDERS\')\"><a data-ui-sref=\"user-orders-list\">Заказы</a></li><li data-ng-show=\"isLogin() && AuthService.hasAccessByCodes(\'MANAGE_USERS,MANAGE_ORDERS,MANAGE_PRODUCTS\')\" class=\"dropdown\"><a href=\"javascript:void(0)\" class=\"dropdown-toggle\" data-toggle=\"dropdown\" role=\"button\" aria-haspopup=\"true\" aria-expanded=\"false\">Администрирование <span class=\"caret\"></span></a><ul class=\"dropdown-menu\"><li ng-if=\"AuthService.hasAccessByCodes(\'MANAGE_USERS\')\"><a href=\"#/manage-users/users-list\">Управление пользователями</a></li><li ng-if=\"AuthService.hasAccessByCodes(\'MANAGE_PRODUCTS\')\"><a data-ui-sref=\"products-list\">Управление товарами</a></li><li ng-if=\"AuthService.hasAccessByCodes(\'MANAGE_ORDERS\')\"><a data-ui-sref=\"all-orders\">Управление заказами</a></li></ul></li><li ng-show=\"isLogin()\"><a href=\"#/profile\">{{currentUser().username}}</a></li><li ng-show=\"isLogin()\"><a data-ng-click=\"logout()\" href=\"javascript:void(0)\">Выйти</a></li><li ng-show=\"!isLogin()\"><a href=\"#/login\">Войти</a></li></ul></nav></div>");
$templateCache.put("app/directives/datepicker/z-datepicker.tpl.html","<p class=\"input-group\"><input type=\"text\" class=\"form-control\" datepicker-popup=\"{{format}}\" ng-model=\"ngModel\" name=\"name\" datepicker-options=\"options\" ng-required=\"required\" is-open=\"opened\" datepicker-append-to-body=\"true\" clear-text=\"Очистить\" close-text=\"Закрыть\" current-text=\"Сегодня\"> <span class=\"input-group-btn\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"open($event)\"><i class=\"glyphicon glyphicon-calendar\"></i></button></span></p>");
$templateCache.put("app/directives/pagination/z-pagination.tpl.html","<pagination total-items=\"config.count\" ng-model=\"page\" max-size=\"config.maxSize\" items-per-page=\"config.itemsPerPage\" ng-change=\"config.pageChanged(page, config.itemsPerPage)\" class=\"pagination-sm\" boundary-links=\"true\" rotate=\"false\" previous-text=\"&lsaquo;\" next-text=\"&rsaquo;\" first-text=\"&laquo;\" last-text=\"&raquo;\"></pagination>");
$templateCache.put("app/main-pages/demo/demo.tpl.html","<h4>Demo</h4><form class=\"form-horizontal\" name=\"demoForm\" novalidate=\"\"><div class=\"form-group\"><label class=\"col-sm-2 control-label\">lowercase</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" name=\"lowercase1\" data-ng-model=\"models.lowercase1\" my-ui-mask=\"{{mask}}\"> {{models.lowercase1}}</div></div><div class=\"form-group\"><div class=\"col-sm-2\"><button type=\"submit\" class=\"btn btn-primary\">Сохранить</button></div></div></form>");
$templateCache.put("app/main-pages/user-profile/user-profile-change-password.tpl.html","<h4>Изменение пароля пользователя</h4><form class=\"form-horizontal\" ng-submit=\"changePassword(changePasswordForm.$invalid)\" name=\"changePasswordForm\" novalidate=\"\"><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Имя</label><div class=\"col-sm-10\"><p class=\"form-control-static\">{{user.username}}</p></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': changePasswordForm.$submitted && changePasswordForm.newPassword.$error.required}\"><label for=\"inputPassword\" class=\"col-sm-2 control-label\">Новый пароль</label><div class=\"col-sm-10\"><input type=\"password\" name=\"newPassword\" class=\"form-control\" id=\"inputPassword\" placeholder=\"Новый пароль\" data-ng-model=\"data.newPassword\" required=\"\"></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': changePasswordForm.$submitted && changePasswordForm.repeatNewPassword.$error.required}\"><label for=\"inputPassword2\" class=\"col-sm-2 control-label\">Повторить новый пароль</label><div class=\"col-sm-10\"><input type=\"password\" name=\"repeatNewPassword\" class=\"form-control\" id=\"inputPassword2\" placeholder=\"Повторить новый пароль\" data-ng-model=\"data.repeatNewPassword\" required=\"\"></div></div><div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\"><button type=\"submit\" class=\"btn btn-primary\">Изменить пароль</button></div></div></form>");
$templateCache.put("app/main-pages/user-profile/user-profile.tpl.html","<h4>Профиль пользователя</h4><ul class=\"nav nav-pills\"><li role=\"presentation\"><a ui-sref=\"user-profile-change-password\">Сменить пароль</a></li></ul><form class=\"form-horizontal\" ng-submit=\"save(changeUserForm.$invalid)\" name=\"changeUserForm\" novalidate=\"\"><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Имя</label><div class=\"col-sm-10\"><p class=\"form-control-static\">{{user.username}}</p></div></div><div class=\"form-group\" ng-class=\"{\'has-error\': changeUserForm.$submitted && changeUserForm.email.$error.pattern}\"><label for=\"email\" class=\"col-sm-2 control-label\">E-mail</label><div class=\"col-sm-10\"><input type=\"email\" class=\"form-control\" id=\"email\" name=\"email\" placeholder=\"E-mail\" data-ng-model=\"user.email\" data-ng-pattern=\"/^[a-z0-9!#$%&\'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\\.[a-z0-9-]+)*$/i\"></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Точки доставки</label><div class=\"col-sm-10\"><div class=\"row\"><div class=\"col-sm-12\"><table class=\"table table-bordered\"><thead><tr><th>Наименование</th><th>Адрес</th></tr></thead><tbody><tr ng-repeat=\"deliveryPoint in user.deliveryPoints\"><td><a data-ui-sref=\"user-profile-edit-delivery-point({deliveryPointId: deliveryPoint._id})\">{{deliveryPoint.title}}</a></td><td>{{deliveryPoint.address}}</td></tr></tbody></table></div></div><div class=\"row\" ng-if=\"!isCreate\"><div class=\"col-sm-6\"><a data-ui-sref=\"user-profile-add-delivery-point\">Добавить точку доставки</a></div></div></div></div><div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\"><button type=\"submit\" class=\"btn btn-primary\">Сохранить</button></div></div></form>");
$templateCache.put("app/main-pages/auth/access-denied/access-denied.tpl.html","<div role=\"alert\" class=\"alert alert-danger\">У вас нет доступа к ресурсу.</div>");
$templateCache.put("app/main-pages/auth/login-form/login-form.tpl.html","<form class=\"form-horizontal\" ng-submit=\"login(loginForm.$invalid)\" name=\"loginForm\" novalidate=\"\"><div class=\"form-group required\" ng-class=\"{\'has-error\': loginForm.$submitted && loginForm.username.$error.required}\"><label for=\"inputUser3\" class=\"col-sm-2 control-label\">Имя</label><div class=\"col-sm-10\"><input type=\"text\" name=\"username\" class=\"form-control\" id=\"inputUser3\" placeholder=\"Имя пользователя\" data-ng-model=\"credentials.username\" required=\"\"> <span class=\"text-danger\" ng-show=\"loginForm.$submitted && loginForm.username.$error.required\">Поле обязательно для заполнения</span></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': loginForm.$submitted && loginForm.password.$error.required}\"><label for=\"inputPassword3\" class=\"col-sm-2 control-label\">Пароль</label><div class=\"col-sm-10\"><input type=\"password\" name=\"password\" class=\"form-control\" id=\"inputPassword3\" placeholder=\"Пароль\" data-ng-model=\"credentials.password\" required=\"\"> <span class=\"text-danger\" ng-show=\"loginForm.$submitted && loginForm.password.$error.required\">Поле обязательно для заполнения</span></div></div><div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\"><div class=\"checkbox\"><label><input type=\"checkbox\" data-ng-model=\"credentials.rememberMe\"> Запомнить меня</label></div></div></div><div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\"><button type=\"submit\" class=\"btn btn-default\">Войти</button></div></div></form>");
$templateCache.put("app/main-pages/auth/logout-success/logout-success.tpl.html","<div role=\"alert\" class=\"alert alert-success\">Вы успешно вышли. <a ui-sref=\"login\">Войти</a></div>");
$templateCache.put("app/main-pages/auth/not-authenticated/not-authenticated.tpl.html","<div role=\"alert\" class=\"alert alert-danger\">Вы неавторизованы. <a ui-sref=\"login\">Войти</a></div>");
$templateCache.put("app/main-pages/manage-users/edit-user/edit-user.tpl.html","<h4 ng-if=\"isCreate\">Создание нового пользователя</h4><h4 ng-if=\"!isCreate\">Редактирование пользователя</h4><form class=\"form-horizontal\" ng-submit=\"save(changeUserForm.$invalid)\" name=\"changeUserForm\" novalidate=\"\"><div class=\"form-group required\" ng-class=\"{\'has-error\': changeUserForm.$submitted && changeUserForm.username.$error.required}\"><label class=\"col-sm-2 control-label\">Имя</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" name=\"username\" placeholder=\"Имя пользователя\" data-ng-model=\"user.username\" required=\"\"></div></div><div class=\"form-group\" ng-class=\"{\'has-error\': changeUserForm.$submitted && changeUserForm.email.$error.pattern}\"><label for=\"email\" class=\"col-sm-2 control-label\">E-mail</label><div class=\"col-sm-10\"><input type=\"email\" class=\"form-control\" id=\"email\" name=\"email\" placeholder=\"E-mail\" data-ng-model=\"user.email\" data-ng-pattern=\"/^[a-z0-9!#$%&\'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\\.[a-z0-9-]+)*$/i\"></div></div><div class=\"form-group required\" ng-if=\"isCreate\" ng-class=\"{\'has-error\': changeUserForm.$submitted && changeUserForm.newPassword.$error.required}\"><label for=\"inputPassword\" class=\"col-sm-2 control-label\">Пароль</label><div class=\"col-sm-10\"><input type=\"password\" name=\"newPassword\" class=\"form-control\" id=\"inputPassword\" placeholder=\"Пароль\" data-ng-model=\"user.password\" required=\"\"></div></div><div class=\"form-group required\" ng-if=\"isCreate\" ng-class=\"{\'has-error\': changeUserForm.$submitted && changeUserForm.repeatNewPassword.$error.required}\"><label for=\"inputPassword2\" class=\"col-sm-2 control-label\">Повторить пароль</label><div class=\"col-sm-10\"><input type=\"password\" name=\"repeatNewPassword\" class=\"form-control\" id=\"inputPassword2\" placeholder=\"Повторить пароль\" data-ng-model=\"user.repeatPassword\" required=\"\"></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Роли</label><div class=\"col-sm-10\"><table class=\"table table-bordered\"><thead><tr><th>#</th><th>Роль</th></tr></thead><tbody><tr ng-repeat=\"role in allRoles\"><td><input type=\"checkbox\" ng-model=\"role.checked\"></td><td>{{role.title}}</td></tr></tbody></table></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Точки доставки</label><div class=\"col-sm-10\"><div class=\"row\"><div class=\"col-sm-12\"><table class=\"table table-bordered\"><thead><tr><th>Наименование</th><th>Адрес</th></tr></thead><tbody><tr ng-repeat=\"deliveryPoint in user.deliveryPoints\"><td><a data-ui-sref=\"edit-user-delivery-point({userId: user._id, deliveryPointId: deliveryPoint._id})\">{{deliveryPoint.title}}</a></td><td>{{deliveryPoint.address}}</td></tr></tbody></table></div></div><div class=\"row\" ng-if=\"!isCreate\"><div class=\"col-sm-6\"><a data-ui-sref=\"add-user-delivery-point({id: user._id})\">Добавить точку доставки</a></div><div class=\"col-sm-6 text-right\"><button type=\"button\" data-ng-click=\"removeAllUserDeliveryPoints()\" class=\"btn btn-danger\">Удалить все точки доставки</button></div></div></div></div><div class=\"form-group\"><div class=\"col-sm-3\"><button type=\"submit\" class=\"btn btn-primary\">Сохранить</button> <a ng-if=\"!isCreate\" data-ui-sref=\"change-user-password({id: user._id})\">Сменить пароль</a></div><div class=\"col-sm-9 text-right\" ng-if=\"!isCreate\"><button ng-if=\"!user.locked\" type=\"button\" data-ng-click=\"lockUser()\" class=\"btn btn-warning\">Заблокировать</button> <button ng-if=\"user.locked\" type=\"button\" data-ng-click=\"unlockUser()\" class=\"btn btn-warning\">Разблокировать</button> <button type=\"button\" data-ng-click=\"deleteUser()\" class=\"btn btn-danger\">Удалить</button></div></div></form>");
$templateCache.put("app/main-pages/manage-users/users-list/users-list.tpl.html","<div class=\"row\"><div class=\"col-sm-6\"><h4>Список пользователей</h4></div><div class=\"col-sm-6 text-right\"><a ui-sref=\"create-user\" class=\"btn btn-success\">Создать пользователя</a></div></div><div class=\"row\"><div class=\"col-sm-12\"><z-pagination config=\"pageConfig\" page=\"pageConfig.page\"></z-pagination></div></div><div class=\"row\"><div class=\"col-sm-12\"><table class=\"table\"><thead><tr><th>Имя пользователя</th><th>Email</th></tr></thead><tbody><tr data-ng-repeat=\"user in userList\"><td><a ui-sref=\"edit-user({id: user._id})\">{{user.username}}</a></td><td>{{user.email}}</td></tr></tbody></table></div></div>");
$templateCache.put("app/main-pages/orders/all-orders-list/all-orders-list.tpl.html","<div class=\"row\"><div class=\"col-sm-6\"><h4>Список всех заказов</h4></div></div><div class=\"row\"><div class=\"col-sm-12\"><z-pagination config=\"pageConfig\" page=\"pageConfig.page\"></z-pagination></div></div><div class=\"row\"><div class=\"col-sm-12\"><table class=\"table\"><thead><tr><th>Номер</th><th>Автор</th><th>Наименование</th><th>Дата создания</th><th>Статус</th></tr></thead><tbody><tr data-ng-repeat=\"order in orderList\"><td><a ui-sref=\"edit-order({id: order._id})\">{{order.number}}</a></td><td>{{order.author.username}}</td><td>{{order.title}}</td><td>{{order.createdDate | date:\'dd.MM.yyyy HH:mm:ss\'}}</td><td>{{order.status.title}}</td></tr></tbody></table></div></div>");
$templateCache.put("app/main-pages/orders/edit-order/edit-order.tpl.html","<h4 ng-if=\"isCreate\">Создание заказа</h4><h4 ng-if=\"!isCreate\">Редактирование заказа</h4><form class=\"form-horizontal\" ng-submit=\"save(changeForm.$invalid)\" name=\"changeForm\" novalidate=\"\"><div class=\"form-group required\" ng-class=\"{\'has-error\': changeForm.$submitted && changeForm.number.$error.required}\"><label class=\"col-sm-2 control-label\">Номер</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" name=\"number\" placeholder=\"Номер заказа\" data-ng-model=\"order.number\" required=\"\"></div></div><div class=\"form-group\" ng-class=\"{\'has-error\': changeForm.$submitted && changeForm.title.$error.required}\"><label class=\"col-sm-2 control-label\">Наименование</label><div class=\"col-sm-6\"><input type=\"text\" class=\"form-control\" name=\"title\" placeholder=\"Наименование заказа\" data-ng-model=\"order.title\"></div><label class=\"col-sm-2 control-label\">Статус</label><div class=\"col-sm-2\"><p class=\"form-control-static\">{{order.status.title}}</p></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': changeForm.$submitted && changeForm.authorDeliveryPoint.$error.required}\"><label class=\"col-sm-2 control-label\">Точка доставки</label><div class=\"col-sm-10\"><ui-select ng-model=\"order.authorDeliveryPoint\" theme=\"bootstrap\" name=\"authorDeliveryPoint\" required=\"\"><ui-select-match placeholder=\"Точка доставки\" allow-clear=\"true\">{{$select.selected.title}}</ui-select-match><ui-select-choices repeat=\"item in user.deliveryPoints | filter: $select.search\"><div ng-bind-html=\"item.title | highlight: $select.search\"></div></ui-select-choices></ui-select></div></div><div class=\"form-group\" ng-if=\"!isCreate\"><label class=\"col-sm-2 control-label\">Продукты</label><div class=\"col-sm-10\"><div class=\"row\"><div class=\"col-sm-12\"><table class=\"table table-bordered\"><thead><tr><th>Наименование продукта</th><th>Количество заказаное</th><th>Количество отгруженое</th><th>Цена за единицу с НДС</th><th>НДС за единицу</th><th>Стоимость</th><th>Сумма НДС</th></tr></thead><tbody><tr ng-repeat=\"ap in order.authorProducts\"><td><a ui-sref=\"edit-order-product({orderId: order._id, productId: ap.product._id})\">{{ap.product.title}}</a></td><td>{{ap.quantity}}</td><td>{{ap.deliveryQuantity}}</td><td>{{ap.price}}</td><td>{{ap.vat}}</td><td>{{ap.sum}}</td><td>{{ap.sumVat}}</td></tr></tbody></table></div></div><div class=\"row\"><div class=\"col-sm-6\"><a data-ui-sref=\"add-order-product({orderId: order._id})\">Добавить продукт к заказу</a></div><div class=\"col-sm-6 text-right\"><button type=\"button\" data-ng-click=\"removeAllOrderProducts()\" class=\"btn btn-danger\">Удалить все продукты у заказа</button></div></div></div></div><div class=\"form-group\"><div class=\"col-sm-2\"><button type=\"submit\" class=\"btn btn-primary\">Сохранить</button></div><div class=\"col-sm-10 text-right\" ng-if=\"!isCreate\"><button type=\"button\" data-ng-click=\"deleteOrder()\" class=\"btn btn-danger\">Удалить</button></div></div><div class=\"form-group\" ng-if=\"!isCreate\"><div class=\"col-sm-12\"><button type=\"button\" data-ng-click=\"activate()\" class=\"btn btn-info\" ng-disabled=\"order.status.code!==\'CREATED\'\">Активировать</button> <button type=\"button\" data-ng-click=\"approve()\" class=\"btn btn-success\" ng-disabled=\"!(order.status.code===\'ACTIVE\' && AuthService.hasAccessByCodes(\'MANAGE_ORDERS\'))\">Подтвердить</button> <button type=\"button\" data-ng-click=\"ship()\" class=\"btn btn-warning\" ng-disabled=\"!(order.status.code===\'APPROVED\' && AuthService.hasAccessByCodes(\'MANAGE_ORDERS\'))\">Перевести в отгружен</button> <button type=\"button\" data-ng-click=\"close()\" class=\"btn btn-danger\" ng-disabled=\"order.status.code===\'CLOSED\' || !AuthService.hasAccessByCodes(\'MANAGE_ORDERS\')\">Закрыть</button></div></div></form>");
$templateCache.put("app/main-pages/orders/edit-order-product/edit-order-product.tpl.html","<h4 ng-if=\"isCreate\">Добавление товара-заказ</h4><h4 ng-if=\"!isCreate\">Редактирование товара-заказ</h4><form class=\"form-horizontal\" ng-submit=\"save(changeForm.$invalid)\" name=\"changeForm\" novalidate=\"\"><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Заказ номер</label><div class=\"col-sm-10\"><p class=\"form-control-static\">{{order.number}}</p></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': changeForm.$submitted && changeForm.product.$error.required}\"><label class=\"col-sm-2 control-label\">Продукт</label><div class=\"col-sm-10\"><ui-select ng-model=\"orderProduct.product\" theme=\"bootstrap\" name=\"product\" required=\"\"><ui-select-match placeholder=\"Продукт\" allow-clear=\"true\">{{$select.selected.title}}</ui-select-match><ui-select-choices repeat=\"item in products | filter: $select.search\"><div ng-bind-html=\"item.title | highlight: $select.search\"></div></ui-select-choices></ui-select></div></div><div class=\"form-group\"><label class=\"col-sm-3 control-label\">Количество заказаное</label><div class=\"col-sm-3\"><input type=\"text\" class=\"form-control\" name=\"quantity\" data-ng-model=\"orderProduct.quantity\"></div><label class=\"col-sm-3 control-label\">Количество отгруженое</label><div class=\"col-sm-3\"><input ng-disabled=\"!AuthService.hasAccessByCodes(\'MANAGE_ORDERS\')\" type=\"text\" class=\"form-control\" name=\"deliveryQuantity\" data-ng-model=\"orderProduct.deliveryQuantity\"></div></div><div class=\"form-group\"><label class=\"col-sm-3 control-label\">Цена за единицу с НДС</label><div class=\"col-sm-3\"><input ng-disabled=\"!AuthService.hasAccessByCodes(\'MANAGE_ORDERS\')\" type=\"text\" class=\"form-control\" name=\"price\" data-ng-model=\"orderProduct.price\"></div><label class=\"col-sm-3 control-label\">НДС за единицу</label><div class=\"col-sm-3\"><input ng-disabled=\"!AuthService.hasAccessByCodes(\'MANAGE_ORDERS\')\" type=\"text\" class=\"form-control\" name=\"vat\" data-ng-model=\"orderProduct.vat\"></div></div><div class=\"form-group\"><label class=\"col-sm-3 control-label\">Стоимость</label><div class=\"col-sm-3\"><input ng-disabled=\"!AuthService.hasAccessByCodes(\'MANAGE_ORDERS\')\" type=\"text\" class=\"form-control\" name=\"sum\" data-ng-model=\"orderProduct.sum\"></div><label class=\"col-sm-3 control-label\">Сумма НДС</label><div class=\"col-sm-3\"><input ng-disabled=\"!AuthService.hasAccessByCodes(\'MANAGE_ORDERS\')\" type=\"text\" class=\"form-control\" name=\"sumVat\" data-ng-model=\"orderProduct.sumVat\"></div></div><div class=\"form-group\"><div class=\"col-sm-2\"><button type=\"submit\" class=\"btn btn-primary\">Сохранить</button></div><div class=\"col-sm-10 text-right\" ng-if=\"!isCreate\"><button type=\"button\" data-ng-click=\"delete()\" class=\"btn btn-danger\">Удалить</button></div></div></form>");
$templateCache.put("app/main-pages/orders/orders-list/orders-list.tpl.html","<div class=\"row\"><div class=\"col-sm-6\"><h4>Список заказов пользователя {{user.username}}</h4></div><div class=\"col-sm-6 text-right\"><a ui-sref=\"create-order\" class=\"btn btn-success\">Создать заказ</a></div></div><div class=\"row\"><div class=\"col-sm-12\"><z-pagination config=\"pageConfig\" page=\"pageConfig.page\"></z-pagination></div></div><div class=\"row\"><div class=\"col-sm-12\"><table class=\"table\"><thead><tr><th>Номер</th><th>Наименование</th><th>Дата создания</th><th>Статус</th></tr></thead><tbody><tr data-ng-repeat=\"order in orderList\"><td><a ui-sref=\"edit-order({id: order._id})\">{{order.number}}</a></td><td>{{order.title}}</td><td>{{order.createdDate | date:\'dd.MM.yyyy HH:mm:ss\'}}</td><td>{{order.status.title}}</td></tr></tbody></table></div></div>");
$templateCache.put("app/main-pages/products/edit-product/edit-product.tpl.html","<h4 ng-if=\"isCreate\">Создание товара</h4><h4 ng-if=\"!isCreate\">Редактирование товара</h4><form class=\"form-horizontal\" ng-submit=\"save(changeProductForm.$invalid)\" name=\"changeProductForm\" novalidate=\"\"><div class=\"form-group required\" ng-class=\"{\'has-error\': changeProductForm.$submitted && changeProductForm.title.$error.required}\"><label class=\"col-sm-2 control-label\">Наименование</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" name=\"title\" placeholder=\"Наименование\" data-ng-model=\"product.title\" required=\"\"></div></div><div class=\"form-group\" ng-if=\"!isCreate\"><label class=\"col-sm-2 control-label\">Дата создания</label><div class=\"col-sm-10\"><p class=\"form-control-static\">{{product.createdDate | date:\'dd.MM.yyyy HH:mm:ss\'}}</p></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': changeProductForm.$submitted && changeProductForm.measureUnit.$error.required}\"><label class=\"col-sm-2 control-label\">Единица измерения</label><div class=\"col-sm-10\"><ui-select ng-model=\"product.measureUnit\" theme=\"bootstrap\" name=\"measureUnit\" required=\"\"><ui-select-match placeholder=\"Единица измерения\" allow-clear=\"true\">{{$select.selected.title}}</ui-select-match><ui-select-choices repeat=\"item in allMeasureUnits | filter: $select.search\"><div ng-bind-html=\"item.title | highlight: $select.search\"></div></ui-select-choices></ui-select></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Тип</label><div class=\"col-sm-10\"><ui-select ng-model=\"product.type\" theme=\"bootstrap\" name=\"type\"><ui-select-match placeholder=\"Тип\" allow-clear=\"true\">{{$select.selected.title}}</ui-select-match><ui-select-choices repeat=\"item in allProductTypes | filter: $select.search\"><div ng-bind-html=\"item.title | highlight: $select.search\"></div></ui-select-choices></ui-select></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Кратность в упаковке</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" name=\"packageMultiplicity\" placeholder=\"Кратность в упаковке\" data-ng-model=\"product.packageMultiplicity\"></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Штрих код</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" name=\"barcode\" placeholder=\"Штрих код\" data-ng-model=\"product.barcode\"></div></div><div class=\"form-group\"><div class=\"col-sm-2\"><button type=\"submit\" class=\"btn btn-primary\">Сохранить</button></div><div class=\"col-sm-10 text-right\" ng-if=\"!isCreate\"><a data-ui-sref=\"product-users-list({id: product._id})\">Список пользователей товара</a> <button type=\"button\" data-ng-click=\"deleteProduct()\" class=\"btn btn-danger\">Удалить</button></div></div></form>");
$templateCache.put("app/main-pages/products/products-list/products-list.tpl.html","<div class=\"row\"><div class=\"col-sm-6\"><h4>Список товаров</h4></div><div class=\"col-sm-6 text-right\"><a ui-sref=\"create-product\" class=\"btn btn-success\">Создать товар</a></div></div><div class=\"row\"><div class=\"col-sm-12\"><z-pagination config=\"pageConfig\" page=\"pageConfig.page\"></z-pagination></div></div><div class=\"row\"><div class=\"col-sm-12\"><table class=\"table\"><thead><tr><th>Наименование</th><th>Дата создания</th><th>Единица измерения</th><th>Тип</th></tr></thead><tbody><tr data-ng-repeat=\"product in productList\"><td><a ui-sref=\"edit-product({id: product._id})\">{{product.title}}</a></td><td>{{product.createdDate | date:\'dd.MM.yyyy HH:mm:ss\'}}</td><td>{{product.measureUnit.title}}</td><td>{{product.type.title}}</td></tr></tbody></table></div></div>");
$templateCache.put("app/main-pages/user-products/edit-user-product/edit-user-product.tpl.html","<h4 ng-if=\"isCreate\">Создание связи товара с пользователем</h4><h4 ng-if=\"!isCreate\">Редактирование связи товара с пользователем</h4><form class=\"form-horizontal\" ng-submit=\"save(changeForm.$invalid)\" name=\"changeForm\" novalidate=\"\"><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Продукт</label><div class=\"col-sm-10\"><p class=\"form-control-static\">{{userProduct.product.title}}</p></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': changeForm.$submitted && changeForm.user.$error.required}\"><label class=\"col-sm-2 control-label\">Пользователь</label><div class=\"col-sm-10\"><ui-select ng-model=\"userProduct.user\" theme=\"bootstrap\" name=\"user\" required=\"\"><ui-select-match placeholder=\"Пользователь\" allow-clear=\"true\">{{$select.selected.username}}</ui-select-match><ui-select-choices repeat=\"item in allUserList | filter: $select.search\"><div ng-bind-html=\"item.username | highlight: $select.search\"></div></ui-select-choices></ui-select></div></div><div class=\"form-group\" ng-if=\"!isCreate\"><label class=\"col-sm-2 control-label\">Цены</label><div class=\"col-sm-10\"><div class=\"row\"><div class=\"col-sm-12\"><table class=\"table table-bordered\"><thead><tr><th>Дата</th><th>Цена</th></tr></thead><tbody><tr ng-repeat=\"userProductPrice in userProductPrices\"><td><a data-ui-sref=\"edit-user-product-price({userProductPriceId: userProductPrice._id})\">{{userProductPrice.priceDate | date:\'dd.MM.yyyy\'}}</a></td><td>{{userProductPrice.productPrice}}</td></tr></tbody></table></div></div><div class=\"row\"><div class=\"col-sm-8\"><z-pagination config=\"pageConfig\" page=\"pageConfig.page\"></z-pagination></div><div class=\"col-sm-4\"><ul class=\"nav nav-pills pull-right\" ng-if=\"!isCreate\"><li><a data-ui-sref=\"add-user-product-price({userProductId: userProduct._id})\">Добавить цену</a></li></ul></div></div></div></div><div class=\"form-group\"><div class=\"col-sm-2\"><button type=\"submit\" class=\"btn btn-primary\">Сохранить</button></div><div class=\"col-sm-10 text-right\" ng-if=\"!isCreate\"><button type=\"button\" data-ng-click=\"delete()\" class=\"btn btn-danger\">Удалить</button></div></div></form>");
$templateCache.put("app/main-pages/user-products/edit-user-product-price/edit-user-product-price.tpl.html","<h4 ng-if=\"isCreate\">Создание цены на связь товар-пользователь</h4><h4 ng-if=\"!isCreate\">Редактирование цены на связь товар-пользователь</h4><form class=\"form-horizontal\" ng-submit=\"save(changeForm.$invalid)\" name=\"changeForm\" novalidate=\"\"><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Продукт</label><div class=\"col-sm-10\"><p class=\"form-control-static\">{{userProductPrice.userProduct.product.title}}</p></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Цена товара</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" name=\"productPrice\" placeholder=\"Цена товара\" data-ng-model=\"userProductPrice.productPrice\"></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': changeForm.$submitted && changeForm.priceDate.$error.required}\"><label class=\"col-sm-2 control-label\">Дата действия</label><div class=\"col-sm-10\"><z-datepicker ng-model=\"userProductPrice.priceDate\" options=\"{}\" name=\"priceDate\" required=\"true\"></z-datepicker></div></div><div class=\"form-group\"><div class=\"col-sm-2\"><button type=\"submit\" class=\"btn btn-primary\">Сохранить</button></div><div class=\"col-sm-10 text-right\" ng-if=\"!isCreate\"><button type=\"button\" data-ng-click=\"delete()\" class=\"btn btn-danger\">Удалить</button></div></div></form>");
$templateCache.put("app/main-pages/user-products/product-users-list/product-users-list.tpl.html","<div class=\"row\"><div class=\"col-sm-6\"><h4>Список пользователей товара <a ui-sref=\"edit-product({id: product._id})\">{{product.title}}</a></h4></div><div class=\"col-sm-6 text-right\"><a ui-sref=\"create-user-product({productId: product._id})\" class=\"btn btn-success\">Добавить пользователя к товару</a></div></div><div class=\"row\"><div class=\"col-sm-12\"><z-pagination config=\"pageConfig\" page=\"pageConfig.page\"></z-pagination></div></div><div class=\"row\"><div class=\"col-sm-12\"><table class=\"table\"><thead><tr><th>Дата создания</th><th>Имя пользователя</th></tr></thead><tbody><tr data-ng-repeat=\"item in items\"><td><a ui-sref=\"edit-user-product({userProductId: item._id})\">{{item.createdDate | date:\'dd.MM.yyyy HH:mm:ss\'}}</a></td><td><a ui-sref=\"edit-user({id: item.user._id})\">{{item.user.username}}</a></td></tr></tbody></table></div></div>");
$templateCache.put("app/main-pages/user-profile/delivery-point/delivery-point.tpl.html","<h4 ng-if=\"isCreate\">Добавление точки доставки</h4><h4 ng-if=\"!isCreate\">Редактирование точки доставки</h4><form class=\"form-horizontal\" ng-submit=\"save(changeForm.$invalid)\" name=\"changeForm\" novalidate=\"\"><div class=\"form-group required\" ng-class=\"{\'has-error\': changeForm.$submitted && changeForm.title.$error.required}\"><label class=\"col-sm-2 control-label\">Наименование точки</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" name=\"title\" placeholder=\"Наименование точки доставки\" data-ng-model=\"deliveryPoint.title\" required=\"\"></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': changeForm.$submitted && changeForm.address.$error.required}\"><label class=\"col-sm-2 control-label\">Адресс</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" name=\"address\" placeholder=\"Адресс\" data-ng-model=\"deliveryPoint.address\" required=\"\"></div></div><div class=\"form-group\" ng-class=\"{\'has-error\': changeForm.$submitted && changeForm.email.$error.pattern}\"><label for=\"email\" class=\"col-sm-2 control-label\">E-mail</label><div class=\"col-sm-10\"><input type=\"email\" class=\"form-control\" id=\"email\" name=\"email\" placeholder=\"E-mail\" data-ng-model=\"deliveryPoint.email\" data-ng-pattern=\"/^[a-z0-9!#$%&\'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\\.[a-z0-9-]+)*$/i\"></div></div><div class=\"form-group\"><div class=\"col-sm-2\"><button type=\"submit\" class=\"btn btn-primary\">Сохранить</button></div><div class=\"col-sm-10 text-right\" ng-if=\"!isCreate\"><button type=\"button\" data-ng-click=\"delete()\" class=\"btn btn-danger\">Удалить</button></div></div></form>");
$templateCache.put("app/main-pages/manage-users/edit-user/change-password/edit-user-change-password.tpl.html","<h4>Изменение пароля пользователя</h4><form class=\"form-horizontal\" ng-submit=\"changePassword(changePasswordForm.$invalid)\" name=\"changePasswordForm\" novalidate=\"\"><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Имя</label><div class=\"col-sm-10\"><p class=\"form-control-static\">{{user.username}}</p></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': changePasswordForm.$submitted && changePasswordForm.newPassword.$error.required}\"><label for=\"inputPassword\" class=\"col-sm-2 control-label\">Новый пароль</label><div class=\"col-sm-10\"><input type=\"password\" name=\"newPassword\" class=\"form-control\" id=\"inputPassword\" placeholder=\"Новый пароль\" data-ng-model=\"data.newPassword\" required=\"\"></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': changePasswordForm.$submitted && changePasswordForm.repeatNewPassword.$error.required}\"><label for=\"inputPassword2\" class=\"col-sm-2 control-label\">Повторить новый пароль</label><div class=\"col-sm-10\"><input type=\"password\" name=\"repeatNewPassword\" class=\"form-control\" id=\"inputPassword2\" placeholder=\"Повторить новый пароль\" data-ng-model=\"data.repeatNewPassword\" required=\"\"></div></div><div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\"><button type=\"submit\" class=\"btn btn-primary\">Изменить пароль</button></div></div></form>");
$templateCache.put("app/main-pages/manage-users/edit-user/delivery-point/edit-user-delivery-point.tpl.html","<h4 ng-if=\"isCreate\">Добавление точки доставки</h4><h4 ng-if=\"!isCreate\">Редактирование точки доставки</h4><form class=\"form-horizontal\" ng-submit=\"save(changeForm.$invalid)\" name=\"changeForm\" novalidate=\"\"><div class=\"form-group required\" ng-class=\"{\'has-error\': changeForm.$submitted && changeForm.title.$error.required}\"><label class=\"col-sm-2 control-label\">Наименование точки</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" name=\"title\" placeholder=\"Наименование точки доставки\" data-ng-model=\"deliveryPoint.title\" required=\"\"></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': changeForm.$submitted && changeForm.address.$error.required}\"><label class=\"col-sm-2 control-label\">Адресс</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" name=\"address\" placeholder=\"Адресс\" data-ng-model=\"deliveryPoint.address\" required=\"\"></div></div><div class=\"form-group\" ng-class=\"{\'has-error\': changeForm.$submitted && changeForm.email.$error.pattern}\"><label for=\"email\" class=\"col-sm-2 control-label\">E-mail</label><div class=\"col-sm-10\"><input type=\"email\" class=\"form-control\" id=\"email\" name=\"email\" placeholder=\"E-mail\" data-ng-model=\"deliveryPoint.email\" data-ng-pattern=\"/^[a-z0-9!#$%&\'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\\.[a-z0-9-]+)*$/i\"></div></div><div class=\"form-group\"><div class=\"col-sm-2\"><button type=\"submit\" class=\"btn btn-primary\">Сохранить</button></div><div class=\"col-sm-10 text-right\" ng-if=\"!isCreate\"><button type=\"button\" data-ng-click=\"delete()\" class=\"btn btn-danger\">Удалить</button></div></div></form>");}]);