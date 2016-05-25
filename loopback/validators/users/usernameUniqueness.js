'use strict';
const _ = require('lodash');

function usernameUniqueness(User) {
  const removeDefaultUsernameValidation = () => {
    const index = _.findIndex(User.validations.username, element => {
      return element.validation === 'uniqueness';
    });

    User.validations.username.splice(index, 1);
  };

  const createRestriction = function(throwError, done) {
    const userToModify = this;

    const filter = {
      username: userToModify.username,
      deleted: false
    };

    User.findOne({where: filter}, (err, userFound) => {
      if(err){
        throwError();
        return done();
      }

      if(userToModify.deleted || !userFound) return done();
      if(userFound.id !== userToModify.id) throwError();

      done();
    });
  };

  return {
    removeDefaultUsernameValidation: removeDefaultUsernameValidation,
    createRestriction: createRestriction
  };
}

module.exports = usernameUniqueness;