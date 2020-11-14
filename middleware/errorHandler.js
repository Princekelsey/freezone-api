const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  // development error
  console.log(err.stack.red);

  // mongoose bad ObjectId error
  if (err.name === "CastError") {
    const message = `Resource not found `;
    error = new ErrorResponse(message, 404);
  }

  // mongoose duplicate key error
  if (err.code === 11000) {
    const message = "Duplicate field value entered. Value already exists";
    error = new ErrorResponse(message, 400);
  }

  // mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    sucess: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;
