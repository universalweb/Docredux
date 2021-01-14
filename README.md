# Docredux
Dead simple documentation generator for JSDOC syntax. Docredux plucks out the JSDOC syntax inside of your compiled code and returns an organized JSON structure and saves it to a JSON file. The generated JSON Object is then used for creating an HTML documentation website for the code.  


### Example  
The destination is the location where the generated file will save.

~~~~
const docredux = require('docredux');
docredux.build.json({
  destination: `${__dirname}/docs/`,
  source: `${__dirname}/docs/bundle.js`,
});
~~~~
© copyright 2021 [Universal Web, Inc](https://universalweb.io)
