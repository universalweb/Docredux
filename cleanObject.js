const lucy = require(`Lucy`);
const {
  compactMapObject,
  hasValue,
  omit,
  isEmpty,
  isString
} = lucy;
module.exports = (cleanThis, cleanTag) => {
  if (cleanTag && cleanThis.source) {
    cleanThis.source = cleanThis.source.replace(`@${cleanTag}\n`, '')
      .replace(`@${cleanTag}`, '')
      .trim();
  }
  return compactMapObject(omit(cleanThis, ['line']), (item) => {
    if (hasValue(item) && !isEmpty(item)) {
      if (isString(item)) {
        return item.trim();
      }
      return item;
    }
  });
};
