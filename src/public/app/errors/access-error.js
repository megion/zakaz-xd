/**
 * Custom Error object for user access errors
 */
function AccessError() {
    var temp = Error.apply(this, arguments);
    temp.name = this.name = 'AccessError';
    this.stack = temp.stack;
    this.message = temp.message;
}
//inherit prototype using ECMAScript 5 (IE 9+)
AccessError.prototype = Object.create(Error.prototype, {
    constructor: {
        value: AccessError,
        writable: true,
        configurable: true
    }
});

