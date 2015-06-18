angular
    .module('zakaz-xd.auth.access', [])

    .constant('ACCESS', {
        MANAGE_USERS: 1<<0, // 00001 Управление пользователями
        CREATE_ORDER: 1<<1, // 00010 Создание заказа
        VIEW_OWN_ORDERS: 1<<2, // 00100 Просмотр своих заказов
        EDIT_OWN_ORDER: 1<<3, // 01000 Редактирование своего заказа
        REMOVE_OWN_ORDER: 1<<4, // 10000 Удаление своего заказа
        VIEW_ALL_ORDER: 1<<5, // 100000 Просмотр всех заказов
        EDIT_ANY_ORDER: 1<<6, // Редактирование любого заказа
        REMOVE_ANY_ORDER: 1<<7, // Удаление любого заказа
        CHANGE_OWN_PASSWORD: 1<<8, // Изменение своего пароля
        CHANGE_OWN_ROLE_LIST: 1<<9, // Назначение себе ролей
        VIEW_ROLES: 1<<10, // Просмотр ролей (списка, детализация роли)
        EDIT_ROLES: 1<<11 // Редактирование ролей
    });