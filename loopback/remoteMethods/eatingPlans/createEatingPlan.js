'use strict';

const Uc = require('../../../useCases/eatingPlans/createEatingPlan');
const createEatingPlan = {};

createEatingPlan.execute = (request, fn) => {
  let db = createEatingPlan._createDBObject(request);
  createEatingPlan.app = request.app;

  const uc = new Uc(db);
  const promise = uc.execute(request.body);

  promise.then( user => fn(null, user) )
         .catch( err => fn(err));

  return promise;
};

createEatingPlan._createDBObject = request =>{
  return {
    beginTransaction: createEatingPlan._beginTransaction,
    createEatingPlan: createEatingPlan._createEatingPlan,
    createRelationBetweenPlanAndFoods:createEatingPlan._createRelationBetweenPlanAndFoods,
    rollbackTransaction: createEatingPlan._rollbackTransaction,
    commitTransaction: createEatingPlan._commitTransaction
  };
};

createEatingPlan._beginTransaction = () =>{
  return createEatingPlan.app.models.user.beginTransaction({
    isolationLevel: 'READ COMMITTED',
    timeout: 30000
  });
};

createEatingPlan._createEatingPlan = (planData, transaction) => {
  return new Promise((resolve, reject) => {
    createEatingPlan.app.models.eatingPlan.create(planData, { transaction: transaction }, (err, newPlan) => {
      if(err) return reject(err);
      return resolve(newPlan);
    });
  });
};

createEatingPlan._createRelationBetweenPlanAndFoods = (data, transaction) => {
  return new Promise( (resolve, reject) => {
    createEatingPlan.app.models.eatingPlanFood.create(data, {transaction: transaction}, (err, relations) =>{
      if(err) return reject(err);
      return resolve(relations);
    });
  });
};

createEatingPlan._rollbackTransaction = (transaction) => {
  return transaction.rollback();
};

createEatingPlan._commitTransaction = (transaction) => {
  return transaction.commit();
};

module.exports = createEatingPlan;