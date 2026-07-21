export function getHealth(_request, response) {
  response.status(200).json({
    success: true,
    message: "WashPanda API is running",
    timestamp: new Date().toISOString(),
  });
}
