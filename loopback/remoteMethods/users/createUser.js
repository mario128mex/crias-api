'use strict';

const Uc = require('../../../useCases/users/createUser');
const saveUser = {};

saveUser.execute = (request, fn) => {
  let db = saveUser._createDBObject(request);
  saveUser.app = request.app;

  const uc = new Uc(db);
  const promise = uc.execute(request.body);

  promise.then( user => fn(null, user) )
         .catch( err => fn(err));

  return promise;
};

saveUser._createDBObject = request =>{
  return {
    beginTransaction: saveUser._beginTransaction,
    createUser: saveUser._createUser,
    findRole: saveUser._findRole,
    createRelationBetweenUserAndRole:saveUser._createRelationBetweenUserAndRole,
    rollbackTransaction: saveUser._rollbackTransaction,
    commitTransaction: saveUser._commitTransaction
  };
};

saveUser._beginTransaction = () =>{
  return saveUser.app.models.user.beginTransaction({
    isolationLevel: 'READ COMMITTED',
    timeout: 30000
  });
};

saveUser._createUser = (userData, transaction) => {
  const UserModel = saveUser.app.models.user;
  const user = new UserModel(userData);

  return new Promise((resolve, reject) => {
    user.save({ transaction: transaction }, (err, newUser) => {
      if(err) return reject(err);
      return resolve(newUser.toJSON());
    });
  });
};

saveUser._findRole = (user, transaction) => {
  return new Promise( (resolve, reject) => {
    saveUser.app.models.role.findOne({where: {id: user.roleId}},
                                      {transaction: transaction},
                                      (err, role) => {
      if(err) return reject(err);
      return resolve(role);
    });
  });
};

saveUser._createRelationBetweenUserAndRole = (role, user, transaction) => {
  return new Promise( (resolve, reject) => {
    role.principals.create({
                            principalType: saveUser.app.models.roleMapping.USER,
                            principalId: user.id
                           },
                           {transaction: transaction},
                           (err, principal) => {
      if(err) return reject(err);
      return resolve(principal);
    });
  });
};

saveUser._rollbackTransaction = (transaction) => {
  return transaction.rollback();
};

saveUser._commitTransaction = (transaction) => {
  return transaction.commit();
};

module.exports = saveUser;