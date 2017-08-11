const lucy = require(`Lucy`);
const {
  findItem,
} = lucy;
const fs = require(`fs`);
const extractComments = require('comment-parser');
const regexComments = /(\/\*([\s\S]*?)\*\/)/gm;
const readFile = (filePath) => {
  return fs.readFileSync(filePath).toString();
};
const writeFile = (fileLocation, fileData) => {
  return fs.writeFileSync(`${fileLocation}`, formattedCode, 'utf8');
};
const syntax = ['abstract', 'access', 'alias', 'async', 'augments', 'author', 'borrows','category', 'callback', 'class', 'classdesc', 'constant', 'constructs', 'copyright', 'default', 'deprecated', 'description', 'enum', 'event', 'test', 'exports', 'external', 'file', 'fires', 'generator', 'global', 'hideconstructor', 'ignore', 'implements', 'inheritdoc', 'inner', 'instance', 'interface', 'kind', 'lends', 'license', 'listens', 'member', 'memberof', 'mixes', 'mixin', 'module', 'name', 'namespace', 'override', 'package', 'param', 'private', 'property', 'protected', 'public', 'readonly', 'requires', 'returns', 'see', 'since', 'static', 'summary', 'this', 'throws', 'todo', 'tutorial', 'type', 'typedef', 'variation', 'version', 'yields'];
const buildJson = async ({
  source,
}) => {
  const fileData = readFile(source);
  const matches = fileData.match(regexComments);
  const sourceMap = {};
  matches.forEach((item) => {
    if (item.includes('@ignore') || item.includes('@ignoreTest')) {
      return;
    }
    const comment = extractComments(item)[0].tags;
    console.log(comment);
    if (!comment) {
      return;
    }
    const functionTag = findItem(comment, 'function', 'tag');
    if (!functionTag) {
      return;
    }
    const commentName = functionTag.name;
    sourceMap[commentName] = {
      code: '',
      examples: []
    };
    syntax.forEach((tagName) => {
      sourceMap[commentName][tagName] = findItem(comment, tagName, 'tag');
    });
    comment.forEach((commentTag) => {
      if (commentTag.tag === 'example') {
        sourceMap[commentName].examples.push(commentTag);
      }
    });
  });
  console.log(sourceMap);
};
exports.build = {
  json: buildJson
};
