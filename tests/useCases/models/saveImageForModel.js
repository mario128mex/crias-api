'use strict';

const TESTING_MODULE = 'Use case: save image for model';
const test = require('blue-tape');
const sinon = require('sinon');
const uc = require('../../../useCases/models/saveImageForModel');

test(`${TESTING_MODULE}; execution order`, (assert) => {
  return new Promise((resolve) => {
    const relationCreationPromise = new Promise((resolve) => {});

    let db = {
      createImage: sinon.stub().returns(new Promise((resolve) => {})),
      createRelationBetweenModelAndImage: sinon.stub()
                                          .returns(Promise.resolve())
    };

    uc.execute(null, null, db);

    assert.equal(db.createImage.callCount, 1,
                `The function to create a new image record should be called at
                first on use case execution`);

    assert.equal(db.createRelationBetweenModelAndImage.callCount, 0,
                `The function to create the relation between an image and
                a model shouldn't be called on use case execution...`);

    db.createImage = () => { return Promise.resolve({ id: 1 }); };

    uc.execute(null, null, db).then(() => {
      assert.equal(db.createRelationBetweenModelAndImage.callCount, 1,
                  `...it just should be called after image is saved`);
      resolve();
    });
  });
});

test(`${TESTING_MODULE}; filename of image`, (assert) => {
  let db = {
    createImage: sinon.stub().returns(Promise.resolve({ id: 666 })),
    createRelationBetweenModelAndImage: sinon.stub(Promise.resolve())
  };

  uc.execute(1, 'afakename.jpg', db);

  assert.equal(db.createImage.lastCall.args[0].filename, 'afakename.jpg',
    `The function to save an image should be called with an object that
    includes the filename as one of it's properties`);

  assert.end();
});

test(`${TESTING_MODULE}; ids used to create relation`, (assert) => {
  return new Promise((resolve) => {
    let db = {
      createImage: sinon.stub().returns(Promise.resolve({ id: 2 })),
      createRelationBetweenModelAndImage: sinon.stub()
                                          .returns(Promise.resolve())
    };

    uc.execute(1, '', db).then(() => {
      assert.equal(db.createRelationBetweenModelAndImage.lastCall.args[0], 1,
        `The function to create  a relation between a model and an image should
        be called with model's id as first parameter`);

      assert.equal(db.createRelationBetweenModelAndImage.lastCall.args[1], 2,
        `The function to create  a relation between a model and an image should
        be called with image's id as second parameter`);

      resolve();
    });
  });
});

test(`${TESTING_MODULE}; resolution`, (assert) => {
  return new Promise((resolve) => {
    const file = { filename: '123.jpg' };
    const db = {
      createImage: sinon.stub().returns(Promise.resolve(file)),
      createRelationBetweenModelAndImage: sinon.stub()
                                          .returns(Promise.resolve())
    };

    uc.execute(1, '', db)
    .then((resolution) => {
      assert.equals(resolution, file.filename,
        `Use case should resolve with the filename of saved image`);

      resolve();
    });
  });
});

test(`${TESTING_MODULE}; rejections`, (assert) => {
  return new Promise((resolve) => {
    let db = {
      createImage: sinon.stub().returns(Promise.reject()),
      createRelationBetweenModelAndImage: sinon.stub()
                                          .returns(Promise.reject())
    };

    uc.execute(1, '', db)
    .then(() => {
      assert.fail(`The success callback shouldn't be called when an
                  error ocurrs trying to save an image` );
    })
    .catch(() => {
      assert.equals(db.createRelationBetweenModelAndImage.callCount, 0,
        `The function to create  a relation should not be called in case of
        an error of the function to save the image`);

      db.createImage = () => { return Promise.resolve({ id: 1}); };

      uc.execute(1, '', db)
      .then(() => {
        assert.fail(`The success callback shouldn't be called when an
                    error ocurrs trying to create a relation between a model
                    and an image`);
      })
      .catch(() => resolve());
    });
  });
});