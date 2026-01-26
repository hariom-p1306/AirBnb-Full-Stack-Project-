class ExpressError extends Error {
    constructor(statusCode, message) {
        super(message); // pass message to the parent Error class
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;
