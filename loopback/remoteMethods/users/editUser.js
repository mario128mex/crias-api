'use strict';

const _ = require('lodash');
const NoModelFoundError = require('../../errors/NotFoundModel');
const Uc = require('../../../useCases/users/editUser');
const editUser = {};

editUser.execute = (request, fn) => {
  let db = editUser._createDBObject(request);
  editUser.app = request.app;

  const hashPassword = function(plainPassword) {
    return editUser.app.models.user.base.hashPassword(plainPassword);
  };

  const uc = new Uc(db, hashPassword);
  const promise = uc.execute(request.body);

  promise.then( user => fn(null, user) )
         .catch( err => fn(err));

  return promise;
};

editUser._createDBObject = request =>{
  return {
    beginTransaction: editUser._beginTransaction,
    findCurrentUser: editUser._findCurrentUser,
    deleteRelationBetweenUserAndRole:
      editUser._deleteRelationBetweenUserAndRole,
    updateUser: editUser._updateUser,
    findRole: editUser._findRole,
    createRelationBetweenUserAndRole:editUser._createRelationBetweenUserAndRole,
    getCenter: editUser._getCenter,
    rollbackTransaction: editUser._rollbackTransaction,
    commitTransaction: editUser._commitTransaction
  };
};

editUser._beginTransaction = () =>{
  return editUser.app.models.user.beginTransaction({
    isolationLevel: 'READ COMMITTED'
  });
};

editUser._findCurrentUser = (user, transaction) => {
  return new Promise( (resolve, reject) => {
    editUser.app.models.user.findById(user.id, {transaction: transaction},
                                     (err, user) => {
        if(err) return reject(err);
        if(!user) return reject(new NoModelFoundError('Specified user ' +
                                                      'does not exist'));
        return resolve(user);
    });
  });
};

editUser._deleteRelationBetweenUserAndRole = (user, transaction) => {
  return new Promise( (resolve, reject) => {
    const deletionRelationFilter = {
      principalId: {inq: [user.id]}
    };

    editUser.app.models.roleMapping.destroyAll(deletionRelationFilter,
                                              {transaction: transaction},
                                              (err, info) => {
      if(err) return reject(err);
      return resolve();
    });
  });
};

editUser._updateUser = (userData, transaction) => {
  const UserModel = editUser.app.models.user;
  const dataToUpdate = _.pick(userData, [
    'name',
    'username',
    'email',
    'password',
    'roleId',
    'serviceCenterId',
    'receptionCenterId'
  ]);

  return new Promise((resolve, reject) => {
    UserModel.findById(userData.id)
    .then((user) => {
      user.updateAttributes(dataToUpdate, {
        transaction: transaction
      }, (err, updatedUser) => {
        if(err) return reject(err);
        return resolve(updatedUser.toJSON());
      });
    })
    .catch((err) => reject(err));
  });
};

editUser._findRole = (user, transaction) => {
  return new Promise( (resolve, reject) => {
    editUser.app.models.role.findById(user.roleId,
                                     {transaction: transaction},
                                     (err, role) => {
      if(err) return reject(err);
      if(!role) return reject(new NoModelFoundError('Specified role ' +
                                                    'does not exist'));
      return resolve(role);
    });
  });
};

editUser._createRelationBetweenUserAndRole = (role, user, transaction) => {
  return new Promise( (resolve, reject) => {
    role.principals.create({
                            principalType: editUser.app.models.roleMapping.USER,
                            principalId: user.id
                           },
                           {transaction: transaction},
                           (err, principal) => {
      if(err) return reject(err);
      return resolve(principal);
    });
  });
};

editUser._getCenter = (user, transaction) => {
  return new Promise( (resolve, reject) => {
    if(user.serviceCenterId){
      editUser.app.models.serviceCenter
      .findById(user.serviceCenterId,
               {transaction: transaction},
               (err, serviceCenter) => {
        if(err) return reject(err);
        if(!serviceCenter) return reject(new NoModelFoundError('Specified ' +
                                                               'service ' +
                                                               'center does ' +
                                                               'not exist'));
        return resolve(serviceCenter);
      });
    }
    else if(user.receptionCenterId){
      editUser.app.models.receptionCenter
      .findById(user.receptionCenterId,
               {transaction: transaction},
               (err, receptionCenter) => {
        if(err) return reject(err);
        if(!receptionCenter) return reject(new NoModelFoundError('Specified ' +
                                                                'reception ' +
                                                                'center does '+
                                                                'not exist'));
        return resolve(receptionCenter);
      });
    }
    else
      return resolve();
  });
};

editUser._rollbackTransaction = (transaction) => {
  return transaction.rollback();
};

editUser._commitTransaction = (transaction) => {
  return transaction.commit();
};

module.exports = editUser;