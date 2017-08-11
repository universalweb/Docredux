const lucy = require('Lucy');
const docredux = async () => {};
const {
  assignDeep,
} = lucy;
assignDeep(docredux, require(`./json.js`));
module.exports = docredux;
