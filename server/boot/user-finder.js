module.exports = function(app) {
  app.findUserForRequest = (req) => {
    return new Promise((resolve, reject) => {
      req.app.models.AccessToken.findForRequest(req, (err, token) => {
        if(err) return reject(err);

        token = token.toJSON();

        req.app.models.user.findById(token.userId, {
          include: [
            'role',
            'receptionCenter',
            'serviceCenter'
          ]
        })
        .then((user) => resolve(user.toJSON()))
        .catch((err) => reject(err));
      });
    });
  };
};
