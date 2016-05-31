'use strict';
const createEatingPlan = require('../remoteMethods/eatingPlans/createEatingPlan');
const updateEatingPlan = require('../remoteMethods/eatingPlans/updateEatingPlan');

module.exports = function(EatingPlan) {
  EatingPlan.disableRemoteMethod('create', true);
  EatingPlan.disableRemoteMethod('updateAttributes', false);

  EatingPlan.createEatingPlan = createEatingPlan.execute;
  EatingPlan.remoteMethod('createEatingPlan', {
    http: {
      verb: 'POST',
      path: '/'
    },
    accepts: {
      arg: 'request',
      type: 'object',
      http: {source: 'req'}
    },
    returns: {
      type: 'object',
      root: true
    }
  });

  EatingPlan.updateEatingPlan = updateEatingPlan.execute;
  EatingPlan.remoteMethod('updateEatingPlan', {
    http: {
      verb: 'PUT',
      path: '/:id'
    },
    accepts: {
      arg: 'request',
      type: 'object',
      http: {source: 'req'}
    },
    returns: {
      type: 'object',
      root: true
    }
  });
};
