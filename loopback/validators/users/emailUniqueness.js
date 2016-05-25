'use strict';
const _ = require('lodash');
function emailUniqueness(User){

  const removeDefaultEmailValidation = () => {
    const index = _.findIndex(User.validations.email, element => {
      return element.validation === 'uniqueness';
    });
    User.validations.email.splice(index, 1);
  };

  const createRestriction = function (throwError, done){
    const userToModify = this;

    const filter = {
      email: userToModify.email,
      deleted: false
    };

    User.findOne({where: filter}, (err , userFound) => {
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
    removeDefaultEmailValidation: removeDefaultEmailValidation,
    createRestriction: createRestriction
  };
}

module.exports = emailUniqueness;