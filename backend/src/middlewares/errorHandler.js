module.exports = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'test') {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: error.details || null,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};
