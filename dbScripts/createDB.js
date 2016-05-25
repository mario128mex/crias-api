(function() {
  const DATASOURCE_ARGS_INDEX = 2;

  const path = require('path');
  const app = require(path.resolve(__dirname, '../server/server'));
  const datasourceArg = process.argv[DATASOURCE_ARGS_INDEX];

  if(!datasourceArg)
    throw new Error('A datasource name should be provided');

  const datasource = app.datasources[datasourceArg];

  if(!datasource)
    throw new Error('Specified datasource does not exist');

  datasource.automigrate(function(err) {
    if(err) throw err;

    datasource.disconnect();
    console.log('Migration finished!');
    return;
  });
})();