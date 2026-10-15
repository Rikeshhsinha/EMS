export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}
export function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";
  if (error.name === "ValidationError") { statusCode = 400; message = error.message; }
  if (error.name === "CastError") { statusCode = 400; message = "Invalid resource ID"; }
  if (error.code === 11000) { statusCode = 409; message = "A record with this value already exists"; }
  if (process.env.NODE_ENV !== "production") console.error(error);
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" ? { stack: error.stack } : {})
  });
}
