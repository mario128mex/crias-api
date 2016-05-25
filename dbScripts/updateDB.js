(function() {
  var MIGRATION_ARGS_INDEX = 2;

  var path = require('path');
  var app = require(path.resolve(__dirname, '../server/server'));
  var dataSource = app.datasources.postgresql;

  var model = null;
  var operation = null;

  var migrateModel = function() {
    dataSource.automigrate(model, function(err) {
      if(err) throw err;
      dataSource.disconnect();
      console.log('Migration finished!');
    });
  };

  var updateModel = function() {
    dataSource.autoupdate(model, function(err) {
      if(err) throw err;
      dataSource.disconnect();
      console.log('Update finished!');
    });
  };

  var discoverSchemaModel = function() {
    dataSource.discoverSchema(model, {schema: 'public'}, function(err, schema) {
      if (err) throw err;

      var json = JSON.stringify(schema, null, '  ');
      console.log(json);

      dataSource.disconnect();
      console.log('Discover Schema finished!');
      console.log('Remember lowercase model name and add in "id" property:');
      console.log('["required": false, "id": true, "generated": true,]');
    });
  };

  var args = process.argv[MIGRATION_ARGS_INDEX];

  if(!args) throw new Error('No args provided!');
  args = args.split(':');

  operation = args[0];
  model = args[1];

  if(!operation || !model)
    throw new Error('Please specify an operation to execute ' +
                    'and a model to affect');

  switch(operation) {
    case 'migrate': return migrateModel();
    case 'update' : return updateModel();
    case 'discover' : return discoverSchemaModel();
    default: throw new Error('Unknow operation specified!');
  }
})();