'use strict';

const UnprocessableUserError = require('./errors/UnprocessableUser');

function EditUser (db, hashPassword){
  this.db = db;
  this.hashPassword = hashPassword;
  this.resolve = null;
  this.reject = null;
}

EditUser.prototype.resolvePromise = function() {
  this.resolve(this.updatedUser);
};

EditUser.prototype.rejectPromise = function(err) {
  this.reject(err);
};

EditUser.prototype.execute = function(user) {
  const self = this;
  self.user = user;

  return new Promise( (resolve, reject) => {
    self.resolve = resolve;
    self.reject = reject;

    this.beginTransaction()
    .then(this.validateUser.bind(self))
    .then(this.findCurrentUser.bind(self))
    .then(this.deleteRelationBetweenUserAndRoleIfChanged.bind(self))
    .then(this.updateUser.bind(self))
    .then(this.findRole.bind(self))
    .then(this.createRelationBetweenUserAndRoleIfChanged.bind(self))
    .then(this.commitTransaction.bind(self))
    .then(this.resolvePromise.bind(self));
  });
};

EditUser.prototype.beginTransaction = function() {
  const promise = this.db.beginTransaction();
  promise.catch(this.resolvePromise.bind(this));
  return promise;
};

EditUser.prototype.validateUser = function(transaction) {
  this.transaction = transaction;
  const self = this;

  const promise = new Promise((resolve, reject) => {
    this.db.findRole(this.user, this.transaction)
    .then(function(role) {
      let roleName = role.name;
      
      if(roleName === 'empleado_centro_recepcion' || 
         roleName === 'jefe_centro_recepcion'){
        if(self.user.receptionCenterId && !self.user.serviceCenterId)
          return resolve();
        else
          return reject(new UnprocessableUserError());
      }

      if(roleName === 'empleado_centro_servicio' || 
         roleName === 'jefe_centro_servicio'){
        if(!self.user.receptionCenterId && self.user.serviceCenterId)
          return resolve();
        else
          return reject(new UnprocessableUserError());
      }

      if(roleName === 'admin' || roleName === 'supervisor'){
        if(!self.user.receptionCenterId && !self.user.serviceCenterId)
          return resolve();
        else
          return reject(new UnprocessableUserError());
      }

      return reject(new UnprocessableUserError());
    })
    .catch(reject);
  });

  promise.catch(this.rollbackTransaction.bind(this));
  return promise;
};

EditUser.prototype.findCurrentUser = function() {
  const promise = this.db.findCurrentUser(this.user, this.transaction);
  promise.catch(this.rollbackTransaction.bind(this));
  return promise;
};

EditUser.prototype.deleteRelationBetweenUserAndRoleIfChanged = 
function(notUpdatedUser) {
  this.notUpdatedUser = notUpdatedUser;
  
  const promise = new Promise((resolve, reject) => {
    if(this.notUpdatedUser.roleId !== this.user.roleId){
      this.db.deleteRelationBetweenUserAndRole(this.user, this.transaction)
      .then(resolve)
      .catch(reject);
    }
    else
      resolve();
  });

  promise.catch(this.rollbackTransaction.bind(this));
  return promise;
};

EditUser.prototype.updateUser = function() {
  if(this.user.password)
    this.user.password = this.hashPassword(this.user.password);
  const promise = this.db.updateUser(this.user, this.transaction);
  promise.catch(this.rollbackTransaction.bind(this));
  return promise;
};

EditUser.prototype.findRole = function(updatedUser) {
  this.updatedUser = updatedUser;
  const promise = this.db.findRole(this.updatedUser, this.transaction);
  promise.catch(this.rollbackTransaction.bind(this));
  return promise;
};

EditUser.prototype.createRelationBetweenUserAndRoleIfChanged = function(role) {
  this.updatedUser.role = role;

  const promise = new Promise((resolve, reject) => {
    if(this.notUpdatedUser.roleId !== this.updatedUser.roleId){
      this.db.createRelationBetweenUserAndRole(role, this.updatedUser,
                                               this.transaction)
      .then(resolve)
      .catch(reject);
    }
    else
      resolve();    
  });

  promise.catch(this.rollbackTransaction.bind(this));
  return promise;
};

EditUser.prototype.commitTransaction = function() {
  const promise = this.db.commitTransaction(this.transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

EditUser.prototype.rollbackTransaction = function(err) {
  const self = this;
  this.db.rollbackTransaction(this.transaction)
  .then(() => self.rejectPromise(err))
  .catch(this.rejectPromise.bind(this));
};

module.exports = EditUser;