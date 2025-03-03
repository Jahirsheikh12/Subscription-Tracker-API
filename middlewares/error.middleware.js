const errorMiddleware = (err, req, res, next) => {
    try {
        let error = { ...err };

        error.message = err.message;

        console.error(err);

        // Mongoose validation error
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(val => val.message);
            error = new Error(message.join(','))
            error.statusCode = 400;
        }


        // Mongoose bad ObjectId
        if (err.name === 'CastError') {
            const message = 'Resource not found';
            error = new Error(message)
            error.statusCode = 404;
        }

        // Mongoose duplicate key
        if (err.code === 11000) {
            const message = 'Duplicate field value entered';
            error = new Error(message)
            error.statusCode = 400;
        }

        // Mongoose jsonwebtoken error
        if (err.name === 'JsonWebTokenError') {
            const message = 'Invalid token. Please log in again';
            error = new Error(message)
            error.statusCode = 401;
        }

        // Mongoose jsonwebtoken expired error
        if (err.name === 'TokenExpiredError') {
            const message = 'Your token has expired. Please log in again';
            error = new Error(message)
            error.statusCode = 401;
        }

        res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Server Error' });

    } catch (error) {
        next(error);
    }
}

export default errorMiddleware;