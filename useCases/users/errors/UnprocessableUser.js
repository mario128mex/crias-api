'use strict';

class UnprocessableUserError extends Error {
  constructor(message) {
    message = message || 'Entidad usuario no procesable';
    super(message);

    this.name = 'UnprocessableUser';
    this.message = message;
    this.status = 422;
  }
}

module.exports = UnprocessableUserError;