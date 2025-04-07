const errorHandler = (err, req, res, next) => {
  // Log error stack in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Set status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  }

  if (err.name === 'SequelizeError' || err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Authentication failed',
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  }

  // Default error response
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;