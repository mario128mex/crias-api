'use strict';
const createUser = require('../remoteMethods/users/createUser');
const editUser = require('../remoteMethods/users/editUser');
const customLogin = require('../remoteMethods/users/customLogin');

module.exports = function(User) {
  const deleteModel = 
    require('../remoteMethods/common/deleteModel')(User);
  const usernameUniqueness =
    require('../validators/users/usernameUniqueness')(User);

  usernameUniqueness.removeDefaultUsernameValidation();
  User.validateAsync('username', function(err, done){
    usernameUniqueness.createRestriction.call(this, err, done);
  }, {
    message: 'User already exists',
    code: 'uniqueness'
  });

  const emailUniqueness = require('../validators/users/emailUniqueness')(User);

  emailUniqueness.removeDefaultEmailValidation();
  User.validateAsync('email', function(err, done){
    emailUniqueness.createRestriction.call(this, err, done);
  }, {
    message: 'Email already exists',
    code: 'uniqueness'
  });

  User.disableRemoteMethod('create', true);
  User.disableRemoteMethod('updateAttributes', false);
  User.disableRemoteMethod('login', true);
  User.disableRemoteMethod('deleteById', true);

  User.createUser = createUser.execute;
  User.remoteMethod('createUser', {
    http: {
      verb: 'POST',
      path: '/'
    },
    accepts: {
      arg: 'request',
      type: 'object',
      http: {source: 'req'}
    },
    returns: {
      type: 'object',
      root: true
    }
  });

  User.editUser = editUser.execute;
  User.remoteMethod('editUser', {
    http: {
      verb: 'PUT',
      path: '/:userId'
    },
    accepts: {
      arg: 'request',
      type: 'object',
      http: {source: 'req'}
    },
    returns: {
      type: 'object',
      root: true
    }
  });

  User.customLogin = customLogin.execute;
  User.remoteMethod('customLogin', {
    http: {
      verb: 'POST',
      path: '/login'
    },
    accepts: {
      arg: 'request',
      type: 'object',
      http: {source: 'req'}
    },
    returns: {
      type: 'object',
      root: true
    }
  });

  User.delete = deleteModel.execute;
  User.remoteMethod('delete', {
    http: {
      verb: 'DELETE',
      path: '/:id'
    },
    accepts: {
      arg: 'request',
      type: 'object',
      http: { source: 'req' }
    },
    returns: {
      type: 'object',
      root: true
    }
  });
};
