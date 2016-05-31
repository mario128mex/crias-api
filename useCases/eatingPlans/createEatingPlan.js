'use strict';
const _ = require('lodash');

function CreateEatingPlan(db){
  this.db = db;
  this.resolve = null;
  this.reject = null;
}

CreateEatingPlan.prototype.resolvePromise = function() {
  this.resolve(this.newEatingPlan);
};

CreateEatingPlan.prototype.rejectPromise = function(err) {
  this.reject(err);
};

CreateEatingPlan.prototype.execute = function(eatingPlan) {
  const self = this;
  self.eatingPlan = eatingPlan;

  return new Promise( (resolve, reject) => {
    self.resolve = resolve;
    self.reject = reject;

    self.beginTransaction()
    .then(this.createEatingPlan.bind(self))
    .then(this.createRelationBetweenPlanAndFoods.bind(self))
    .then(this.commitTransaction.bind(self))
    .then(this.resolvePromise.bind(self));
  });
};

CreateEatingPlan.prototype.beginTransaction = function() {
  const promise = this.db.beginTransaction();
  promise.catch(this.resolvePromise.bind(this));
  return promise;
};

CreateEatingPlan.prototype.createEatingPlan = function(transaction) {
  this.transaction = transaction;
  const promise = this.db.createEatingPlan(this.eatingPlan, transaction);
  promise.catch(this.rollbackTransaction.bind(this));
  return promise;
};

CreateEatingPlan.prototype.createRelationBetweenPlanAndFoods = function(newEatingPlan) {
  this.newEatingPlan = newEatingPlan.toJSON();
  this.newEatingPlan.foods = this.eatingPlan.foods;

  let data = _.map(this.eatingPlan.foods, (food) => {
    return {
      eatingPlanId: this.newEatingPlan.id,
      foodId: food.id
    }
  });

  const promise = 
  this.db.createRelationBetweenPlanAndFoods(data,this.transaction);
  promise.catch(this.rollbackTransaction.bind(this));
  return promise;
};

CreateEatingPlan.prototype.commitTransaction = function(data) {
  const promise = this.db.commitTransaction(this.transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

CreateEatingPlan.prototype.rollbackTransaction = function(err) {
  const self = this;
  this.db.rollbackTransaction(this.transaction)
  .then(() => self.rejectPromise(err))
  .catch(this.rejectPromise.bind(this));
};

module.exports = CreateEatingPlan;