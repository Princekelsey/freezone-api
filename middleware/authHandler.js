const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("./asyncHandler");
const User = require("../models/Users");
const Consultant = require("../models/Consultants");

// protect userRoute
exports.authorizeUser = asyncHandler(async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    token = authorization.split(" ")[1];
  }

  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // check if token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  // decode token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});

// protect consultantRoute
exports.authorizeConsultant = asyncHandler(async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    token = authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // check if token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  // decode token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.consultant = await Consultant.findById(decoded.id);
    next();
  } catch (error) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});
