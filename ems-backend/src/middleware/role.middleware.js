import HttpError from "../utils/httpError.js";

export const allowRoles = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new HttpError(403, "You are not authorized to perform this action"));
  }
  next();
};
