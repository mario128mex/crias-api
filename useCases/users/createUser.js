'use strict';

function CreateUser (db){
  this.db = db;
  this.resolve = null;
  this.reject = null;
}

CreateUser.prototype.resolvePromise = function() {
  this.resolve(this.newUser);
};

CreateUser.prototype.rejectPromise = function(err) {
  this.reject(err);
};

CreateUser.prototype.execute = function(user) {
  const self = this;
  self.user = user;

  return new Promise( (resolve, reject) => {
    self.resolve = resolve;
    self.reject = reject;

    this.beginTransaction()
    .then(this.createUser.bind(self))
    .then(this.findRole.bind(self))
    .then(this.createRelationBetweenUserAndRole.bind(self))
    .then(this.getCenter.bind(self))
    .then(this.atachCenter.bind(self))
    .then(this.commitTransaction.bind(self))
    .then(this.resolvePromise.bind(self));
  });
};

CreateUser.prototype.beginTransaction = function() {
  const promise = this.db.beginTransaction();
  promise.catch(this.resolvePromise.bind(this));
  return promise;
};

CreateUser.prototype.createUser = function(transaction) {
  this.transaction = transaction;
  const promise = this.db.createUser(this.user, transaction);
  promise.catch(this.rollbackTransaction.bind(this));
  return promise;
};

CreateUser.prototype.findRole = function(user) {
  this.newUser = user;
  const promise = this.db.findRole(this.newUser, this.transaction);
  promise.catch(this.rollbackTransaction.bind(this));
  return promise;
};

CreateUser.prototype.createRelationBetweenUserAndRole = function(role) {
  this.newUser.role = role;

  const promise = 
  this.db.createRelationBetweenUserAndRole(role, this.newUser,this.transaction);
  promise.catch(this.rollbackTransaction.bind(this));
  return promise;
};

CreateUser.prototype.getCenter = function() {
  const promise = this.db.getCenter(this.newUser, this.transaction);
  promise.catch(this.rollbackTransaction.bind(this));
  return promise;
};

CreateUser.prototype.atachCenter = function(center) {
  return new Promise( (resolve, reject) => {
    if(this.newUser.serviceCenterId)
      this.newUser.serviceCenter = center;
    
    else if(this.newUser.receptionCenterId)
      this.newUser.receptionCenter = center;

    return resolve(this.newUser);
  });
};

CreateUser.prototype.commitTransaction = function() {
  const promise = this.db.commitTransaction(this.transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

CreateUser.prototype.rollbackTransaction = function(err) {
  const self = this;
  this.db.rollbackTransaction(this.transaction)
  .then(() => self.rejectPromise(err))
  .catch(this.rejectPromise.bind(this));
};

module.exports = CreateUser;