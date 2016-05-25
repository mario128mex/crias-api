'use strict';

module.exports = function(app){
  const User = app.models.user;
  const Role = app.models.Role;
  const RoleMapping = app.models.roleMapping;
  let adminRole = {};

  const defaultCredentials = {
    name: 'Administrador',
    username: 'admin',
    email: 'admin@crias.com',
    password: 'admin'
  };

  const asignAdminRole = user => {
    console.log('...default admin created succesfully!');
    console.log('assigning admin role...');
    
    return new Promise( (resolve, reject) => {
      adminRole.principals.create({
        principalType: RoleMapping.USER,
        principalId: user.id
      }, (err, principal) => {
        if(err) return reject(err);
        else return resolve(principal);
      });
    });
  };

  const createUser = () => {
    return new Promise( (resolve, reject) => {
      User.create(defaultCredentials, (err, user) => {
        if(err) return reject(err);
        else return resolve(user);
      });
    });
  };

  const createDefaultAdmin = () => {
    console.log('There is no admin user, creating...');

    createUser()
    .then(asignAdminRole)
    .then( relation => console.log('...role asignation succesfully!') )
    .catch( err => console.log(err.message) );
  };

  const getAdminRole = () => {
    return new Promise( (resolve, reject) => {
      Role.findOne({where: {name: 'admin'}}, (err, role) => {
        if(err) return reject(err);
        else return resolve(role);
      });
    });
  };

  const validateAdminUsers = role => {
    adminRole = role;
    defaultCredentials.roleId = adminRole.id;

    return new Promise( (resolve, reject) => {
      User.find({where:{roleId: adminRole.id}}, (err, users) => {
        if(err) return reject(err);
        else return resolve(users);
      });
    });
    
  };

  const validateUsers = () => {
    getAdminRole()
    .then(validateAdminUsers)
    .then( users => {
      if(users.length === 0) createDefaultAdmin();
    })
    .catch( err => console.log(err.message) );
  };

  validateUsers();
};