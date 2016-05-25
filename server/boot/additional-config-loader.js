const fileUpload = require('./configs/files-upload');
const filePaths = require('./configs/file-paths');

module.exports = function (app) {
  fileUpload.run(app);
  filePaths(app);
};