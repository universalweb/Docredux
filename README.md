# Docredux

Dead simple documentation generator for JSDOC syntax. Docredux plucks out the JSDOC syntax inside of your compiled code and returns an organized JSON structure and saves it to a JSON file. The generated JSON Object is then used for creating an HTML documentation website for the code.  

### Example  

The destination is the location where the generated file will save.

~~~~
import docredux from 'docredux';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const currentDirname = dirname(fileURLToPath(import.meta.url));
docredux({
  destination: `${currentDirname}/docs/`,
  source: `${currentDirname}/docs/bundle.js`,
});
~~~~

© copyright 2023 [Universal Web, Inc](https://universalweb.io)
