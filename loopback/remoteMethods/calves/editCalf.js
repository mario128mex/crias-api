'use strict';

const Uc = require('../../../useCases/calves/editCalf');
const editCalf = {};

editCalf.execute = (request, fn) => {
  let db = editCalf._createDBObject(request);
  editCalf.app = request.app;
console.log('execute');
  const uc = new Uc(db);
  const promise = uc.execute(request.body);

  promise.then( calf => fn(null, calf) )
         .catch( err => fn(err));

  return promise;
};

editCalf._createDBObject = request =>{
  return {
    beginTransaction: editCalf._beginTransaction,
    findCalf: editCalf._findCalf,
    editCalf: editCalf._editCalf,
    findPen: editCalf._findPen,
    updatePen: editCalf._updatePen,
    findSensor: editCalf._findSensor,
    updateSensor: editCalf._updateSensor,
    rollbackTransaction: editCalf._rollbackTransaction,
    commitTransaction: editCalf._commitTransaction
  };
};

editCalf._beginTransaction = () =>{
  return editCalf.app.models.calf.beginTransaction({
    isolationLevel: 'READ COMMITTED',
    timeout: 30000
  });
};

editCalf._findCalf = (calfId, transaction) => {
  return new Promise((resolve, reject) => {
    editCalf.app.models.calf.findById(calfId, {transaction: transaction}, (err, calf) => {
      if(err) return reject(err);
      return resolve(calf);
    });
  });
};

editCalf._editCalf = (calf, data, transaction) => {
  return new Promise((resolve, reject) => {
    calf.updateAttributes(data, {transaction: transaction}, (err, newCalf) => {
      if(err) return reject(err);
      return resolve(newCalf);
    });
  });
};

editCalf._findPen = (penId, transaction) => {
  return new Promise((resolve, reject) => {
    editCalf.app.models.pen.findById(penId, {transaction: transaction}, (err, pen) => {
      if(err) return reject(err);
      return resolve(pen);
    });
  });
};

editCalf._updatePen = (pen, data, transaction) => {
  return new Promise((resolve, reject) => {
    pen.updateAttributes(data, 
                         {transaction: transaction}, 
                         (err, updatedPen) => {
      if(err) return reject(err);
      return resolve(updatedPen);
    });
  });
};

editCalf._findSensor = (sensorId, transaction) => {
  return new Promise((resolve, reject) => {
    editCalf.app.models.sensor.findById(sensorId, {transaction: transaction}, (err, sensor) => {
      if(err) return reject(err);
      return resolve(sensor);
    });
  });
};

editCalf._updateSensor = (sensor, calfId, transaction) => {
  return new Promise((resolve, reject) => {
    sensor.updateAttributes({calfId: calfId}, {transaction: transaction}, (err, updatedSensor) => {
      if(err) return reject(err);
      return resolve(updatedSensor);
    });
  });
};

editCalf._rollbackTransaction = (transaction) => {
  return transaction.rollback();
};

editCalf._commitTransaction = (transaction) => {
  return transaction.commit();
};

module.exports = editCalf;