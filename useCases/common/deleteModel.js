'use strict';

function DeleteModel (db) {
  this.db = db; 
  this.resolve = null;
  this.reject = null;
}

DeleteModel.prototype.resolvePromise = function(info) { 
  this.resolve(info); 
};

DeleteModel.prototype.rejectPromise = function(err) {
  this.reject(err);
};

DeleteModel.prototype.execute = function(params) {
  const self = this;
  self.modelId = params.id;
  
  return new Promise((resolve, reject) => {
    self.resolve = resolve;
    self.reject = reject;
    
    this.deleteModel()
    .then(this.resolvePromise.bind(self));
  });
};

DeleteModel.prototype.deleteModel = function() {
  const promise = this.db.deleteModel(this.modelId);
  promise.catch(this.rejectPromise.bind(this));
  return promise;
};

module.exports = DeleteModel;