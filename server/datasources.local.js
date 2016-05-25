'use strict';

const mongoURI = process.env.MONGO_URL ||
                 process.env.MONGOLAB_URI ||
                 process.env.MONGOHQ_URL ||
                'mongodb://localhost/crias-api';

module.exports = {
  mongodb: {
    defaultForType: 'mongodb',
    connector: 'loopback-connector-mongodb',
    url: mongoURI
  }
};
