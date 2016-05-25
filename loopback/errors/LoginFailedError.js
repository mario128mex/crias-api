'use strict';

class LoginFailedError extends Error {
  constructor() {
    let message = 'login failed';
    super(message);

    this.name = 'Error';
    this.status = 401;
    this.message = message;
    this.statusCode = 401;
    this.code = 'LOGIN_FAILED';
  }
}

module.exports = LoginFailedError;