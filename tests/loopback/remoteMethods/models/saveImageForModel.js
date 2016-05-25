'use strict';

const TESTING_MODULE = 'Remote method: saveImageForModel';
const REMOTE_METHOD_PATH = '../../../../loopback/remoteMethods/' +
                           'models/saveImageForModel';

const test = require('blue-tape');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const remoteMethod = require(REMOTE_METHOD_PATH);

const fakeLodash = {
  bind: (fn, thisVal) => { return fn; }
};

const mockRemoteMethod = (fakeUseCase) => {
  return proxyquire(REMOTE_METHOD_PATH, {
    'lodash': fakeLodash,
    '../../../useCases/models/saveImageForModel': fakeUseCase
  });
};

test(`${TESTING_MODULE}; remote method's type`, (assert) => {
  assert.equal(typeof remoteMethod.execute, 'function',
              'Remote method should be a function');
  assert.end();
});

test(`${TESTING_MODULE}; selection of image name from request "file" attribute`,
  (assert) => {
    const fileName = 'MyImageName.jpg';
    const fakeRequest = {
      params: { modelId: 1 },
      file: { filename: fileName }
    };
    const fakeUseCase = {
      execute: sinon.stub().returns(new Promise(() => {}))
    };

    let remoteMethod = mockRemoteMethod(fakeUseCase);
    remoteMethod._createDBObject = sinon.stub(remoteMethod, '_createDBObject');
    remoteMethod.execute(fakeRequest, () => {});

    assert.equal(fakeUseCase.execute.lastCall.args[1], fileName,
                `Remote method should pick image\'s filename from request and
                pass it as second parameter of the use case function`);
    assert.end();
});

test(`${TESTING_MODULE}; DB object generation`, (assert) => {
  const remoteMethod = mockRemoteMethod({});

  const fakeRequest = {
    app: {
      models: {
        image: { create: () => {} },
        modelImage: { create: () => {} }
      }
    }
  };

  const actual = remoteMethod._createDBObject(fakeRequest);
  const expected = {
    createImage: fakeRequest.app.models.image.create,
    createRelationBetweenModelAndImage: remoteMethod
                                        ._createRelationBetweenModelAndImage
  };

  assert.deepEqual(actual, expected,
    `Given a request object the remote method should generate a DB handler
    with the functions to create new images, relations between a model and an
    image. Those functions should be taken from the loopback models exposed
    in the app object of request.`);

  assert.end();
});

test(`${TESTING_MODULE}; relation between model and image`, (assert) => {
  remoteMethod.app = {
    models: {
      cellphoneModelImage: { create: sinon.spy() }
    }
  };

  remoteMethod._createRelationBetweenModelAndImage(1, 2);

  assert.deepEqual(remoteMethod.app.models
                  .cellphoneModelImage.create.lastCall.args[0],
    { cellphoneModelId: 1, imageId: 2 },
    `The function to create a new record of the model modelImage should
     be called with an object containing both, model's id and image's id`);

  assert.end();
});

test(`${TESTING_MODULE}; callback resolution`, (assert) => {
  return new Promise((resolve) => {
    const fakeUseCase = {
      execute: () => { return Promise.resolve('123.jpg'); }
    };

    const fakeRequest = {
      params: { modelId: 1 },
      app: null,
      file: { filename: '123.jpg' }
    };

    const fakeCallback = sinon.stub();

    let remoteMethod = mockRemoteMethod(fakeUseCase);
    remoteMethod._createDBObject = sinon.stub().returns({});

    remoteMethod.execute(fakeRequest, fakeCallback)
    .then(() => {
      assert.equal(fakeCallback.lastCall.args[0], null,
        `Loopback's callback should be called without error in case that
        remote method's execution had been succesful`);

      assert.equals(fakeCallback.lastCall.args[1], '123.jpg',
        `Loopback's callback should be resolve passing filename of saved image
        as second parameter`);

      resolve();
    });
  });
});

test(`${TESTING_MODULE}; callback rejection`, (assert) => {
  return new Promise((resolve) => {
    const fakeError = new Error();

    const fakeUseCase = {
      execute: () => { return Promise.reject(fakeError); }
    };

    const fakeRequest = {
      params: { modelId: 1 },
      app: null,
      file: { filename: '' }
    };

    const fakeCallback = sinon.stub();

    let remoteMethod = mockRemoteMethod(fakeUseCase);
    remoteMethod._createDBObject = sinon.stub().returns({});

    remoteMethod.execute(fakeRequest, fakeCallback)
    .then(() => {})
    .catch(() => {
      assert.equal(fakeCallback.lastCall.args[0], fakeError,
        `Loopback's callback should be called with the error returned by the
        use case execution`);

      resolve();
    });
  });
});