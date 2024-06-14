const jwt = require("jsonwebtoken");
const HttpError = require("../models/error-model");

const authMiddleware = (req, res, next) => {
  const Authorization =
    req.headers.authorization || request.headers.authorization;
  if (Authorization && Authorization.startsWith("Bearer")) {
    const token = Authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, info) => {
      if (err) {
        return next(
          new HttpError("Unauthorized. Invalid token. pls login", 403)
        );
      }

      req.user = info;
      next();
    });
  } else {
    return next(new HttpError("Unauthorized. no token. pls login", 403));
  }
};

module.exports = authMiddleware;
