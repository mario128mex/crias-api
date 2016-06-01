'use strict';

const Uc = require('../../../useCases/calves/createCalf');
const createCalf = {};

createCalf.execute = (request, fn) => {
  let db = createCalf._createDBObject(request);
  createCalf.app = request.app;

  const uc = new Uc(db);
  const promise = uc.execute(request.body);

  promise.then( calf => fn(null, calf) )
         .catch( err => fn(err));

  return promise;
};

createCalf._createDBObject = request =>{
  return {
    beginTransaction: createCalf._beginTransaction,
    createCalf: createCalf._createCalf,
    findPen: createCalf._findPen,
    updatePen: createCalf._updatePen,
    findSensor: createCalf._findSensor,
    updateSensor: createCalf._updateSensor,
    rollbackTransaction: createCalf._rollbackTransaction,
    commitTransaction: createCalf._commitTransaction
  };
};

createCalf._beginTransaction = () =>{
  return createCalf.app.models.calf.beginTransaction({
    isolationLevel: 'READ COMMITTED',
    timeout: 30000
  });
};

createCalf._createCalf = (calf, transaction) => {
  return new Promise((resolve, reject) => {
    createCalf.app.models.calf.create(calf, {transaction: transaction}, (err, newCalf) => {
      if(err) return reject(err);
      return resolve(newCalf);
    });
  });
};

createCalf._findPen = (penId, transaction) => {
console.log('on find pen', penId);
  return new Promise((resolve, reject) => {
    createCalf.app.models.pen.findById(penId, {transaction: transaction}, (err, pen) => {
      if(err) return reject(err);
      return resolve(pen);
    });
  });
};

createCalf._updatePen = (pen, transaction) => {
  return new Promise((resolve, reject) => {
    pen.updateAttributes({currentCapacity: pen.currentCapacity + 1}, 
                         {transaction: transaction}, 
                         (err, updatedPen) => {
      if(err) return reject(err);
      return resolve(updatedPen);
    });
  });
};

createCalf._findSensor = (sensorId, transaction) => {
console.log('on findSensor', sensorId);
  return new Promise((resolve, reject) => {
    createCalf.app.models.sensor.findById(sensorId, {transaction: transaction}, (err, sensor) => {
      if(err) return reject(err);
      return resolve(sensor);
    });
  });
};

createCalf._updateSensor = (sensor, calfId, transaction) => {
  return new Promise((resolve, reject) => {
    sensor.updateAttributes({calfId: calfId}, {transaction: transaction}, (err, updatedSensor) => {
      if(err) return reject(err);
      return resolve(updatedSensor);
    });
  });
};

createCalf._rollbackTransaction = (transaction) => {
  return transaction.rollback();
};

createCalf._commitTransaction = (transaction) => {
  return transaction.commit();
};

module.exports = createCalf;