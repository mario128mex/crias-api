'use strict';
const createCalf = require('../remoteMethods/calves/createCalf');
const editCalf = require('../remoteMethods/calves/editCalf');

module.exports = function(Calf) {
  Calf.disableRemoteMethod('create', true);
  Calf.disableRemoteMethod('updateAttributes', false);

  Calf.createCalf = createCalf.execute;
  Calf.remoteMethod('createCalf', {
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

  Calf.editCalf = editCalf.execute;
  Calf.remoteMethod('editCalf', {
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
