'use strict';
const _ = require('lodash');

function CreateCalf(db){
  this.db = db;
  this.resolve = null;
  this.reject = null;
}

CreateCalf.prototype.resolvePromise = function() {
  this.resolve(this.newCalf);
};

CreateCalf.prototype.rejectPromise = function(err) {
  this.reject(err);
};

CreateCalf.prototype.execute = function(calf) {
  const self = this;
  self.calf = calf;

  return new Promise( (resolve, reject) => {
    self.resolve = resolve;
    self.reject = reject;

    self.beginTransaction()
    .then(this.createCalf.bind(self))
    .then(this.findPen.bind(self))
    .then(this.updatePen.bind(self))
    .then(this.findSensor.bind(self))
    .then(this.updateSensor.bind(self))
    .then(this.commitTransaction.bind(self))
    .then(this.resolvePromise.bind(self));
  });
};

CreateCalf.prototype.beginTransaction = function() {
  const promise = this.db.beginTransaction();
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

CreateCalf.prototype.createCalf = function(transaction) {
  this.transaction = transaction;
  const promise = this.db.createCalf(this.calf, transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

CreateCalf.prototype.findPen = function(newCalf) {
  this.newCalf = newCalf;

  if(!this.newCalf.penId)
    return Promise.resolve();

  const promise = this.db.findPen(newCalf.penId, this.transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

CreateCalf.prototype.updatePen = function(pen) {
  if(!pen)
    return Promise.resolve();

  const promise = this.db.updatePen(pen, this.transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

CreateCalf.prototype.findSensor = function(updatedPen) {
  if(!this.newCalf.sensorId)
    return Promise.resolve();

  const promise = this.db.findSensor(this.newCalf.sensorId, this.transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

CreateCalf.prototype.updateSensor = function(sensor) {
  if(!sensor)
    return Promise.resolve();
  
  const promise = this.db.updateSensor(sensor, this.newCalf.id, this.transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

CreateCalf.prototype.commitTransaction = function(data) {
  const promise = this.db.commitTransaction(this.transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

CreateCalf.prototype.rollbackTransaction = function(err) {
  const self = this;
  this.db.rollbackTransaction(this.transaction)
  .then(() => self.rejectPromise(err))
  .catch(this.rejectPromise.bind(this));
};

module.exports = CreateCalf;