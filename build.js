(async () => {
  const docredux = require('./index');
  await docredux.build.json({
    destination: './docs/',
    source: './bundle.js',
  });
})();
