'use strict';

const CDN_ROOT_PATH = '../../../cdn';

const fs = require('fs');
const path = require('path');

const paths = {
  cdnRoot: CDN_ROOT_PATH,
  cellPhoneModelImages: `${CDN_ROOT_PATH}/cellphoneModelsImages`
};

function ensureFilePathsExistence(server) {
  for(let cdnPath in paths) {
    cdnPath = path.resolve(__dirname, paths[cdnPath]);
    if(!fs.existsSync(cdnPath)) fs.mkdirSync(cdnPath);
  }
}

module.exports = ensureFilePathsExistence;