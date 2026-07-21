export function errorHandler(error, _request, response, _next) {
  const status = error.status
    || (error.name === "ValidationError" || error.name === "CastError" ? 400 : 500);
  const safeMessage = status >= 500
    ? "Internal server error"
    : error.name === "ValidationError"
      ? Object.values(error.errors).map((item) => item.message).join(", ")
      : error.name === "CastError"
        ? "The supplied record identifier is invalid"
        : error.message;

  response.status(status).json({
    success: false,
    message: safeMessage || "Request could not be completed",
  });
}
