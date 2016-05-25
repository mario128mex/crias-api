'use strict';

class NotFoundModelError extends Error {
  constructor(message) {
    message = message || 'There\'s no model with provided id';
    super(message);

    this.name = 'NotFoundModelError';
    this.message = message;
    this.status = 404;
  }
}

module.exports = NotFoundModelError;