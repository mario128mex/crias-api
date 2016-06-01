'use strict';
const _ = require('lodash');

function EditCalf(db){
  this.db = db;
  this.resolve = null;
  this.reject = null;
}

EditCalf.prototype.resolvePromise = function() {
  this.resolve(this.newCalf);
};

EditCalf.prototype.rejectPromise = function(err) {
  this.reject(err);
};

EditCalf.prototype.execute = function(calf) {
  const self = this;
  self.calf = calf;

  return new Promise( (resolve, reject) => {
    self.resolve = resolve;
    self.reject = reject;

    self.beginTransaction()
    .then(this.findCalf.bind(self))
    .then(this.editCalf.bind(self))

    .then(this.findOldPen.bind(self))
    .then(this.updateOldPen.bind(self))
    .then(this.findOldSensor.bind(self))
    .then(this.updateOldSensor.bind(self))

    .then(this.findNewPen.bind(self))
    .then(this.updateNewPen.bind(self))
    .then(this.findNewSensor.bind(self))
    .then(this.updateNewSensor.bind(self))

    .then(this.commitTransaction.bind(self))
    .then(this.resolvePromise.bind(self));
  });
};

EditCalf.prototype.beginTransaction = function() {
  const promise = this.db.beginTransaction();
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

EditCalf.prototype.findCalf = function(transaction) {
console.log('findCalf');
  this.transaction = transaction;

  const promise = this.db.findCalf(this.calf.id, this.transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

EditCalf.prototype.editCalf = function(oldCalf) {
console.log('editCalf');
  this.oldCalf = oldCalf;

  const data = {
    name: oldCalf.name,
    category: oldCalf.category,
    healthStatus: oldCalf.healthStatus,
    
    weight: oldCalf.weight,
    penId: oldCalf.penId,
    sensorId: oldCalf.sensorId
  };

  const promise = this.db.editCalf(oldCalf, data, this.transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

EditCalf.prototype.findOldPen = function(newCalf) {
console.log('findOldPen');
try{
  this.newCalf = newCalf;

  if(!this.oldCalf.penId)
    return Promise.resolve();

  const promise = this.db.findPen(this.oldCalf.penId, this.transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
}
catch(err){console.log(err);}
};

EditCalf.prototype.updateOldPen = function(oldPen) {
console.log('updateOldPen');
  if(!oldPen)
    return Promise.resolve();

  const data = {currentCapacity: oldPen.currentCapacity - 1};

  const promise = this.db.updatePen(oldPen, data, this.transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

EditCalf.prototype.findOldSensor = function(updatedOldPen) {
console.log('findOldSensor');
  if(!this.oldCalf.sensorId)
    return Promise.resolve();

  const promise = this.db.findSensor(this.oldCalf.sensorId, this.transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

EditCalf.prototype.updateOldSensor = function(oldSensor) {
console.log('updateOldSensor');
  if(!oldSensor)
    return Promise.resolve();
  
  const promise = this.db.updateSensor(oldSensor, null, this.transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

EditCalf.prototype.findNewPen = function() {
console.log('findNewPen');
  if(!this.newCalf.penId)
    return Promise.resolve();

  const promise = this.db.findPen(this.newCalf.penId, this.transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

EditCalf.prototype.updateNewPen = function(newPen) {
console.log('updateNewPen');
  if(!newPen)
    return Promise.resolve();

  const data = {currentCapacity: newPen.currentCapacity + 1};

  const promise = this.db.updatePen(newPen, data, this.transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

EditCalf.prototype.findNewSensor = function(updatedNewPen) {
console.log('findNewSensor');
  if(!this.newCalf.sensorId)
    return Promise.resolve();

  const promise = this.db.findSensor(this.newCalf.id, this.transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

EditCalf.prototype.updateNewSensor = function(newSensor) {
console.log('updateNewSensor');
  if(!newSensor)
    return Promise.resolve();
  
  const promise = this.db.updateSensor(newSensor, this.newCalf.sensorId, this.transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

EditCalf.prototype.commitTransaction = function(data) {
  const promise = this.db.commitTransaction(this.transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

EditCalf.prototype.rollbackTransaction = function(err) {
  const self = this;
  this.db.rollbackTransaction(this.transaction)
  .then(() => self.rejectPromise(err))
  .catch(this.rejectPromise.bind(this));
};

module.exports = EditCalf;