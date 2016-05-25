'use strict';

const NoModelFoundError = require('../../errors/NotFoundModel');

function deleteModel(Model) {
  const Uc = require('../../../useCases/common/deleteModel');
  const deleteModel = {};

  deleteModel.execute = (request, fn) => {
    let db = deleteModel._createDBObject(request);
    deleteModel.app = request.app;

    const uc = new Uc(db);
    const promise = uc.execute(request.params);
    
    promise.then((client) => fn(null, client))
           .catch((err) => fn(err));

    return promise;
  };

  deleteModel._createDBObject = (request) => {
    return {
      deleteModel: deleteModel._deleteModel
    };
  };
  
  deleteModel._deleteModel = (modelId) => {
    return new Promise((resolve, reject) => {
      const logicalDeletionSentense = {
        deleted: true
      };

      Model.updateAll({id: {inq: [modelId]} }, logicalDeletionSentense,
                      (err, info) => {
        if(err) return reject(err);
        if(!info.count) return reject(new NoModelFoundError('Specified ' +
                                                            'models instance ' +
                                                            'does not exist'));
        return resolve(info);
      });
    });
  };

  return deleteModel;
}

module.exports = deleteModel;