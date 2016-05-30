'use strict';

const Uc = require('../../../useCases/eatingPlans/updateEatingPlan');
const updateEatingPlan = {};

updateEatingPlan.db = {
  beginTransaction: () => {
    return updateEatingPlan.app.models.eatingPlan.beginTransaction({
      isolationLevel: 'READ COMMITTED',
      timeout: 30000
    });
  },

  commitTransaction: transaction => transaction.commit(),

  rollbackTransaction: transaction => transaction.rollback(),

  findEatingPlanById: (eatingPlanId, transaction) => {
    return new Promise((resolve, reject) => {
      updateEatingPlan.app.models.eatingPlan.findById(eatingPlanId, {
        include: 'foods'
      }, {
        transaction: transaction
      })
      .then(eatingPlan => resolve(eatingPlan.toJSON()))
      .catch(err => reject(err));
    });
  },

  updateEatingPlanById: (eatingPlanId, data, transaction) => {
    return new Promise((resolve, reject) => {
      updateEatingPlan.app.models.eatingPlan.updateAll({
        id: eatingPlanId
      }, data, {
        transaction: transaction
      })
      .then(() => {
        updateEatingPlan.app.models.eatingPlan.findById(eatingPlanId,{
          include: 'foods'
        },{
          transaction: transaction
        })
        .then(eatingPlan => resolve(eatingPlan.toJSON()))
        .catch(err => reject(err));
      })
      .catch(err => reject(err));
    });
  },

  createRelationsWithFood: (relations, transaction) => {
    return new Promise((resolve, reject) => {
      updateEatingPlan.app.models
      .eatingPlanFood.create(relations, {
        transaction: transaction
      }, (err, relations) => {
        if(err) return reject(err);
        resolve(relations.map(relation => relation.toJSON()));
      });
    });
  },

  deleteRelationsWithCellphoneModel: (eatingPlanId, foodsIds, transaction) => {
    return updateEatingPlan.app.models.eatingPlanFood.destroyAll({
            eatingPlanId: eatingPlanId,
            foodId: { inq: cellphoneModelsIds }
          }, {
            transaction: transaction
          });
  }
};

updateEatingPlan.execute = (request, fn) => {
  updateEatingPlan.app = request.app;

  const uc = new Uc(updateEatingPlan.db);
  const promise = uc.execute(request.body);

  promise.then(sparePart => fn(null, sparePart))
         .catch(err => fn(err));

  return promise;
};

module.exports = updateEatingPlan;