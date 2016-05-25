'use strict';

const _ = require('lodash');
const multer = require('multer');

const configurator = {
  availablePaths: {
    'cdn/cellphoneModelsImages':
      /\/api\/cellphoneModels\/[0-9a-zA-Z]+\/images\/upload/
  }
};

configurator.run = (app) =>  {
  const FILE_ATTR_NAME = 'file';
  const multerConfig = multer({
    storage: configurator._storageConfig
  });

  app.use(multerConfig.single(FILE_ATTR_NAME));
};

configurator._getFileDestinationByRequestURL = (request, file, cb) => {
  for(let path in configurator.availablePaths) {
    if(configurator.availablePaths[path].test(request.originalUrl))
      return cb(null, path);
  }

  cb(new Error('Unable to handle uploaded file using the specified URL: ' +
                request.originalUrl + ', please use a valid URL'));
};

configurator._setFilename = (request, file, cb) => {
  let fileExtension = _.last(file.originalname.split('.'));
  let newFileName = Date.now() + '.' + fileExtension;

  cb(null, newFileName);
};

configurator._storageConfig = multer.diskStorage({
  destination: configurator._getFileDestinationByRequestURL,
  filename: configurator._setFilename
});

module.exports = configurator;