var ACCESSES = {
    MANAGE_USERS: 1<<0,

    CREATE_ORDER: 1<<1, // not used
    VIEW_OWN_ORDERS: 1<<2, // not used

    EDIT_OWN_ORDER: 1<<3,

    REMOVE_OWN_ORDER: 1<<4, // not used
    VIEW_ALL_ORDER: 1<<5, // not used
    EDIT_ANY_ORDER: 1<<6, // not used
    REMOVE_ANY_ORDER: 1<<7, // not used

    CHANGE_OWN_PASSWORD: 1<<8,
    CHANGE_OWN_ROLE_LIST: 1<<9,
    VIEW_ROLES: 1<<10,
    MANAGE_PRODUCTS: 1<<11,
    MANAGE_ORDERS: 1<<12
};

exports.ACCESSES = ACCESSES;
