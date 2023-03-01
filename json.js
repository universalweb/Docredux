import {
	findItem,
	eachObject,
	sortAlphabetical,
} from 'Acid';
import format from 'prettier-eslint';
import fs from 'fs';
import { parse } from 'comment-parser';
import cleanObject from './cleanObject.js';
const regexComments = /(\/\*([\s\S]*?)\*\/)/gm;
const readFile = (filePath) => {
	return fs.readFileSync(filePath).toString();
};
const writeFile = (fileLocation, fileData) => {
	return fs.writeFileSync(`${fileLocation}`, fileData, 'utf8');
};
import syntax from './syntax.js';
async function buildJson({
	source,
	destination,
	filename = 'sourceMap'
}) {
	const fileData = readFile(source);
	const matches = fileData.match(regexComments);
	const sourceMap = {
		categories: {},
		items: {}
	};
	matches.forEach((item) => {
		if (item.includes('@ignore')) {
			return;
		}
		const sourceSyntax = cleanObject(parse(item)[0]);
		const comment = sourceSyntax.tags;
		const description = sourceSyntax.description;
		if (!comment) {
			return;
		}
		const functionTag = findItem(comment, 'function', 'tag');
		if (!functionTag) {
			return;
		}
		let categoryName;
		const commentName = functionTag.name;
		const categoryTag = findItem(comment, 'category', 'tag');
		if (categoryTag) {
			categoryName = categoryTag.name;
			if (categoryName) {
				categoryName = categoryName.trim().toLowerCase();
				if (!sourceMap.categories[categoryName]) {
					sourceMap.categories[categoryName] = [];
				}
				sourceMap.categories[categoryName].push(commentName);
			}
		}
		sourceMap.items[commentName] = {
			categoryName,
			code: '',
			description,
			examples: [],
			name: commentName,
			params: [],
		};
		syntax.forEach((tagName) => {
			const tagItem = findItem(comment, tagName, 'tag');
			if (tagItem) {
				sourceMap.items[commentName][tagName] = cleanObject(tagItem, tagName);
			}
		});
		comment.forEach((commentTag) => {
			if (commentTag.tag === 'example') {
				const exampleCode = cleanObject(commentTag, 'example');
				exampleCode.source = format({
					prettierOptions: {
						parser: 'babel',
					},
					text: exampleCode.description.replace('// =>', '\n// =>'),
				});
				sourceMap.items[commentName].examples.push(exampleCode);
			}
		});
		comment.forEach((commentTag) => {
			if (commentTag.tag === 'param') {
				sourceMap.items[commentName].params.push(cleanObject(commentTag, 'param'));
			}
		});
		sourceMap.items[commentName] = cleanObject(sourceMap.items[commentName]);
	});
	const categoriesSorted = [];
	eachObject(sourceMap.categories, (catItem, categoryName) => {
		if (categoryName) {
			categoriesSorted.push({
				categoryName,
				items: catItem.sort(),
			});
		}
	});
	sourceMap.categories = sortAlphabetical(categoriesSorted, 'categoryName');
	const jsonMap = `window.docMap = ${JSON.stringify(sourceMap)}`;
	writeFile(`${destination}${filename}.js`, jsonMap);
}
export { buildJson };
