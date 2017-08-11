import app from '../app';
const {
  componentMethods,
  utility: {
    findIndex,
    hasValue,
    get,
    isPlainObject,
    findItem,
    assignDeep,
    ensureArray,
    assign,
    each,
    isArray,
    isEmpty,
    sortNewest,
    sortOldest,
    clear,
  }
} = app;
export const extendRactive = {
  async afterIndex(componentView, path, indexMatch, item, indexName) {
    const index = findIndex(componentView.get(path), indexMatch, indexName);
    if (hasValue(index)) {
      await componentView.splice(path, index + 1, 0, ...ensureArray(item));
    } else {
      await componentView.push(path, item);
    }
  },
  async assign(componentView, path, mergeObject) {
    const item = componentView.get(path);
    if (hasValue(item)) {
      assignDeep(item, mergeObject);
      await componentView.update(path);
      return item;
    }
  },
  async beforeIndex(componentView, path, indexMatch, item, indexName) {
    const index = findIndex(componentView.get(path), indexMatch, indexName);
    if (hasValue(index)) {
      await componentView.splice(path, index - 1, 0, ...ensureArray(item));
    } else {
      await componentView.push(path, item);
    }
  },
  async clearArray(componentView, path) {
    const arrayToClear = componentView.get(path);
    if (arrayToClear) {
      clear(arrayToClear);
      await componentView.update(path);
    }
  },
  findItem(componentView, path, indexMatch, indexName) {
    const item = find(componentView.get(path), indexMatch, indexName);
    if (hasValue(item)) {
      return item;
    }
  },
  getIndex(componentView, path, indexMatch, indexName) {
    const index = findIndex(componentView.get(path), indexMatch, indexName);
    if (hasValue(index)) {
      return index;
    }
  },
  async mergeItem(componentView, path, indexMatch, newVal, indexName) {
    const item = findItem(componentView.get(path), indexMatch, indexName);
    if (hasValue(item)) {
      assignDeep(item, newVal);
      await componentView.update(path);
      return item;
    }
  },
  async removeIndex(componentView, path, indexMatch, indexName) {
    const index = findIndex(componentView.get(path), indexMatch, indexName);
    if (hasValue(index)) {
      await componentView.splice(path, index, 1);
    }
  },
  async setIndex(componentView, path, indexMatch, item, indexName, optionsArg) {
    const options = optionsArg || {};
    const index = findIndex(componentView.get(path), indexMatch, indexName);
    if (hasValue(index)) {
      const pathSuffix = (options.pathSuffix) ? `.${options.pathSuffix}` : '';
      await componentView.set(`${path}.${index}${pathSuffix}`, item);
    } else if (get('conflict', options) === 'insert') {
      await componentView[get('conflictMethod', options) || 'push'](path, item);
    }
  },
  async sortNewest(componentView, path, property) {
    const array = componentView.get(path);
    sortNewest(array, property, true);
    await componentView.update(path);
  },
  async sortOldest(componentView, path, property) {
    const array = componentView.get(path);
    sortOldest(array, property, true);
    await componentView.update(path);
  },
  async syncCollection(componentView, path, newValArg, type = 'push', indexName = 'id') {
    const oldVal = componentView.get(path);
    if (isPlainObject(oldVal)) {
      assignDeep(oldVal, newValArg);
    } else {
      const newVal = ensureArray(newValArg);
      each(newVal, (item) => {
        const oldValItem = findItem(oldVal, item[indexName], indexName);
        if (hasValue(oldValItem)) {
          assign(oldValItem, item);
        } else {
          oldVal[type](item);
        }
      });
    }
    await componentView.update(path);
  },
  async toggleIndex(componentView, path, indexMatchArg, pathSuffixArg, indexName) {
    let indexMatch;
    const arrayCheck = isArray(indexMatchArg);
    if (arrayCheck && !isEmpty(indexMatchArg)) {
      indexMatch = indexMatchArg.shift();
    } else {
      indexMatch = indexMatchArg;
    }
    const index = findIndex(componentView.get(path), indexMatch, indexName);
    if (hasValue(index)) {
      const pathSuffix = (pathSuffixArg) ? `.${pathSuffixArg}` : '';
      await componentView.toggle(`${path}.${index}${pathSuffix}`);
    }
    if (arrayCheck && !isEmpty(indexMatchArg)) {
      await componentView.toggleIndex(path, indexMatchArg, pathSuffixArg, indexName);
    }
  },
  async updateItem(componentView, path, indexMatch, react, indexName) {
    const item = findItem(componentView.get(path), indexMatch, indexName);
    if (hasValue(item)) {
      react(item);
      await componentView.update(path);
      return item;
    }
  }
};
assign(componentMethods, {
  extendRactive(view) {
    each(extendRactive, (item, key) => {
      view[key] = function(...args) {
        return item(view, ...args);
      };
    });
  },
});
