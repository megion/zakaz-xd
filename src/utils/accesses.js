var ACCESSES = {
    MANAGE_USERS: 1<<0,
    CREATE_ORDER: 1<<1,
    VIEW_OWN_ORDERS: 1<<2,
    EDIT_OWN_ORDER: 1<<3,
    REMOVE_OWN_ORDER: 1<<4,
    VIEW_ALL_ORDER: 1<<5,
    EDIT_ANY_ORDER: 1<<6,
    REMOVE_ANY_ORDER: 1<<7,
    CHANGE_OWN_PASSWORD: 1<<8,
    CHANGE_OWN_ROLE_LIST: 1<<9, // Назначение себе ролей
    VIEW_ROLES: 1<<10, // Просмотр ролей (списка, детализация роли)
    EDIT_ROLES: 1<<11 // Редактирование ролей
};

exports.ACCESSES = ACCESSES;
