'use strict';
const _ = require('lodash');

function updateEatingPlan (db) {
  this.db = db;
  this.resolve = null;
  this.reject = null;
}

updateEatingPlan.prototype.resolvePromise = function() {
  this.resolve(this.updatedSparePart);
};

updateEatingPlan.prototype.rejectPromise = function(err) {
  this.reject(err);
};

updateEatingPlan.prototype.execute = function(eatingPlan) {
  const self = this;

  self.newEatingPlanData = eatingPlan;
  self.newFoodsIds = _.pluck(eatingPlan.foods, 'id');

  return new Promise((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;

    this.beginTransaction()
    .then(this.findEatingPlanById.bind(self))
    .then(this.updateEatingPlan.bind(self))
    .then(this.createRelationsWithFood.bind(self))
    .then(this.deleteRelationsWithFood.bind(self))
    .then(this.commitTransaction.bind(self))
    .then(this.resolvePromise.bind(self));
  });
};

updateEatingPlan.prototype.beginTransaction = function() {
  const promise = this.db.beginTransaction();
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

updateEatingPlan.prototype.findEatingPlanById = function(transaction) {
  this.transaction = transaction;
  const promise = this.db.findEatingPlanById(this.newEatingPlanData.id,
                                             transaction);
  promise.catch(this.rollbackTransaction.bind(this));
  return promise;
};

updateEatingPlan.prototype.updateEatingPlan = function(eatingPlan) {
  this.existingEatingPlan = eatingPlan;
  this.existingFoodsIds = _.pluck(eatingPlan.foods, 'id');
  const promise = this.db.updateEatingPlanById(eatingPlan.id,
                                              _.omit(this.newEatingPlanData,
                                                     'foods'),
                                              this.transaction);
  promise.catch(this.rollbackTransaction.bind(this));
  return promise;
};

updateEatingPlan.prototype.createRelationsWithFood 
= function(updatedEatingPlan) {
  const self = this;

  self.updatedEatingPlan = _.extend(updatedEatingPlan, {
    foods: self.existingEatingPlan.foods
  });

  return new Promise((resolve, reject) => {
    const relationsToCreate = _.chain(self.newFoodsIds)
                               .difference(self.existingFoodsIds)
                               .map(foodId => {
                                  return {
                                    foodId: foodId,
                                    eatingPlanId: self.updatedEatingPlan.id
                                  };
                               })
                               .value();

    if(_.isEmpty(relationsToCreate)) return resolve(relationsToCreate);

    self.db.createRelationsWithFood(relationsToCreate, self.transaction)
    .then(relations => {
      self.updatedEatingPlan.foods = self.updatedEatingPlan
                                         .foods
                                         .concat(relations);
      resolve();
    })
    .catch(err => {
      self.rollbackTransaction(err);
      reject();
    });
  });
};

updateEatingPlan.prototype
.deleteRelationsWithFood = function() {
  const self = this;

  return new Promise((resolve, reject) => {
    const idsToDelete = _.chain(self.existingFoodsIds)
                         .difference(self.newFoodsIds)
                         .value();

    if(_.isEmpty(idsToDelete)) return resolve();

    self.db.deleteRelationsWithFood(self.updateEatingPlan.id,
                                        idsToDelete,
                                        self.transaction)
    .then(() => resolve())
    .catch(err => {
      self.rollbackTransaction(err);
      reject();
    });
  });
};

updateEatingPlan.prototype.commitTransaction = function() {
  const promise = this.db.commitTransaction(this.transaction);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

updateEatingPlan.prototype.rollbackTransaction = function(err) {
  const self = this;

  this.db.rollbackTransaction(this.transaction)
  .then(() => self.rejectPromise(err))
  .catch(this.rejectPromise.bind(this));
};

module.exports = updateEatingPlan;