angular
    .module('auth.access', [])

    .constant('ACCESS', {
        MANAGE_USERS: {
            title: 'Управление пользователями',
            code: 'EDIT_USER',
            value: 1<<0 // 00001
        },
        CREATE_ORDER: {
            title: 'Создание заказа',
            code: 'CREATE_ORDER',
            value: 1<<1 // 00010
        },
        VIEW_OWN_ORDERS: {
            title: 'Просмотр своих заказов',
            code: 'VIEW_OWN_ORDERS',
            value: 1<<2 // 00100
        },
        EDIT_OWN_ORDER: {
            title: 'Редактирование своего заказа',
            code: 'VIEW_OWN_ORDERS',
            value: 1<<3 // 01000
        },
        REMOVE_OWN_ORDER: {
            title: 'Удаление своего заказа',
            code: 'REMOVE_OWN_ORDER',
            value: 1<<4 // 10000
        },
        VIEW_ALL_ORDER: {
            title: 'Просмотр всех заказов',
            code: 'VIEW_ALL_ORDER',
            value: 1<<5 // 100000
        },
        EDIT_ANY_ORDER: {
            title: 'Редактирование любого заказа',
            code: 'EDIT_ANY_ORDER',
            value: 1<<6
        },
        REMOVE_ANY_ORDER: {
            title: 'Удаление любого заказа',
            code: 'REMOVE_ANY_ORDER',
            value: 1<<7
        }
    });