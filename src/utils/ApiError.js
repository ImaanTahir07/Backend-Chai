class ApiError extends Error{
    constructor(
        statusCode,
        message = 'An error occurred while processing your request.',
        errors = [],
        statck = ""
    ) {
        super(message),
        this.statusCode = statusCode,
        this.errors = errors,
        this.data = null,
        this.success = false // because it is api error so success to false he hogi
    }
}

export {ApiError}