class HttpError extends Error {
  constructor(message, errocode) {
    super(message);
    this.code = errocode;
  }
}

module.exports = HttpError;
