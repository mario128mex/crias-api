'use strict';

const LoginFailedError = require('../../errors/LoginFailedError');
const customLogin = {};
const self = customLogin;
let app = null;

customLogin.execute = (request, fn) => {
  app = request.app;

  const promise = self.findUser(request.body)
  .then(self.validatePassword)
  .then(self.login)
  .then(self.getRole)
  .then(self.findCenter)
  .then(token => fn(null, token))
  .catch(err => fn(err));

  return promise;
};

customLogin.findUser = credentials => {
  self.credentials = credentials;

  const query = {
    username: credentials.username,
    deleted: false
  };

  return new Promise((resolve, reject) => {
    app.models.user.findOne({where: query}, (err, user) => {
      if(err) return reject(err);
      if(!user) return reject(new LoginFailedError());
      return resolve(user);
    });
  });
};

customLogin.validatePassword = user => {
  self.user = user;

  return new Promise((resolve, reject) => {
    user.hasPassword(self.credentials.password, (err, match) => {
      if(err) return reject(err);
      if(!match) return reject(new LoginFailedError());
      return resolve(match);
    });
  });
};

customLogin.login = match => {
  return new Promise((resolve, reject) => {
    self.user.createAccessToken(self.credentials, (err, token) => {
      if(err) return reject(err);
      return resolve(token);
    });
  });
};

customLogin.getRole = token => {
  token = token.toJSON();
  token.user = self.user.toJSON();
  const user = token.user;

  return new Promise( (resolve, reject) => {
    app.models.role.findById(user.roleId, (err, role) => {
      if(err) return reject(err);
      if(token.user.deleted) reject(new LoginFailedError());

      token.user.role = {name: role.name};
      return resolve(token);
    });
  });
};

customLogin.findCenter = token => {
  const user = token.user;

  return new Promise((resolve, reject) => {
    if(!user.serviceCenterId && !user.receptionCenterId){
      return resolve(token);
    }
    else if(user.serviceCenterId){
      app.models.serviceCenter.findById(user.serviceCenterId,
                                        (err, serviceCenter) => {
        if(err) return reject(err);
        token.user.serviceCenter = serviceCenter;
        return resolve(token);
       });
    }
    else {
      const receptionCenterFilter = {
        include: 'address'
      };
      app.models.receptionCenter.findById(user.receptionCenterId,
                                          receptionCenterFilter,
                                          (err, receptionCenter) => {
        if(err) return reject(err);
        token.user.receptionCenter = receptionCenter;
        return resolve(token);
       });
    }
  });
};

module.exports = customLogin;