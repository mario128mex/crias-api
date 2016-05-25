'use strict';

const TESTING_MODULE = 'Config script: file-upload';
const CONFIGURATOR_PATH = '../../../../server/boot/configs/files-upload';

const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const configurator = require(CONFIGURATOR_PATH);


test(`${TESTING_MODULE}; exposed module's type`, (assert) => {
  assert.equal(typeof configurator, 'object',
              'The exposed configurator should be an object');
  assert.end();
});

test(`${TESTING_MODULE}; multer storage config`, (assert) => {
  const fakeMulterObject = {
    diskStorage: sinon.spy()
  };

  const configurator = proxyquire(CONFIGURATOR_PATH, {
    multer: fakeMulterObject
  });

  const actualMulterStorageConfig = fakeMulterObject.diskStorage
                                    .lastCall.args[0];

  assert.deepEqual(actualMulterStorageConfig, {
    destination: configurator._getFileDestinationByRequestURL,
    filename: configurator._setFilename
  }, `Multer's configuration related to file storage should be proxied to
    propper instance functions of the configurator`);

  assert.end();
});

test(`${TESTING_MODULE}; file attribute name in request`, (assert) => {
  const fakeMulterObject = {
    single: sinon.spy()
  };

  const configurator = proxyquire(CONFIGURATOR_PATH, {
    multer: () => { return fakeMulterObject; }
  });

  const fakeApp = { use: () => {} };

  configurator.run(fakeApp);

  assert.equal(fakeMulterObject.single.lastCall.args[0], 'file',
              `The multer configuration to handle single files uploads
              should expect them in an request attribute with the name "file"`);
  assert.end();
});

test(`${TESTING_MODULE}; files destination`, (assert) => {
  const expectedPaths = ['cdn/cellphoneModelsImages'];

  assert.deepEqual(expectedPaths, Object.keys(configurator.availablePaths),
                  `Configurator should be ready to handle the file upload for
                  URL's related to:
                  *Images for cellphone models`);

  const pathCb = sinon.spy();

  configurator._getFileDestinationByRequestURL({
    originalUrl: '/api/cellphoneModels/1/images/upload'
  }, null, pathCb);

  const actualPath = pathCb.lastCall.args[1];
  const expectedPath = 'cdn/cellphoneModelsImages';

  assert.equal(actualPath, expectedPath,
              `Multer should identify the destination path for a file uploaded
              using an URL included in the configured object of URL's`);

  assert.throws(() => {
    configurator._getFileDestinationByRequestURL({
      originalUrl: '/an/invalid/URL'
    });
  }, Error, `An exception should be thrown when an
            invalid URL is used to upload a file`);

  assert.end();
});

test(`${TESTING_MODULE}; files rename`, (assert) => {
  const timestamp = 1450917062551;
  const clock = sinon.useFakeTimers(timestamp);
  const cb = sinon.spy();
  const fakeFile = { originalname: 'auseslessname.jpg' };

  configurator._setFilename(null, fakeFile, cb);
  assert.equal(cb.lastCall.args[1], `${timestamp}.jpg`,
              `When a new file is uploaded it's name should be replaced by
              current timestamp`);

  clock.restore();
  assert.end();
});