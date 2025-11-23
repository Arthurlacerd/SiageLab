function buildError(code, message, details) {
  const erro = { code, message };
  if (details) erro.details = details;
  return { erro };
}

module.exports = { buildError };
