// Centralized error handler.
// Never exposes stack traces or internal details to the client in production.
// This prevents Information Disclosure (STRIDE category).
module.exports = (err, req, res, next) => {
  console.error(err.stack); // log internally only

  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An internal error occurred.'
    : err.message;

  res.status(status).json({ error: message });
};
