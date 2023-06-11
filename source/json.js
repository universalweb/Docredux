import {
	findItem,
	eachObject,
	sortCollectionAlphabetically,
	eachAsyncArray
} from '@universalweb/acid';
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
import { validTags } from './validTags.js';
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
	await eachAsyncArray(matches, async (item) => {
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
		const classTag = findItem(comment, 'class', 'tag');
		let nameTag = functionTag;
		if (classTag && functionTag) {
			nameTag = `${classTag.name}.${functionTag.name}`;
		} else if (classTag) {
			nameTag = classTag;
		}
		if (!nameTag) {
			return;
		}
		let category;
		const commentName = nameTag.name || nameTag;
		const categoryTag = findItem(comment, 'category', 'tag');
		if (categoryTag) {
			category = categoryTag.name;
			if (category) {
				category = category.trim().toLowerCase();
				if (!sourceMap.categories[category]) {
					sourceMap.categories[category] = [];
				}
				sourceMap.categories[category].push(commentName);
			}
		}
		const type = findItem(comment, 'class', 'tag');
		const isAsync = findItem(comment, 'async', 'tag');
		sourceMap.items[commentName] = {
			category,
			code: '',
			description,
			examples: [],
			name: commentName,
			params: [],
			type: type || (classTag && functionTag) ? 'class' : 'function'
		};
		if (isAsync) {
			sourceMap.items[commentName].isAsync = true;
		}
		if (classTag) {
			sourceMap.items[commentName].classTag = classTag.name;
		}
		if (functionTag) {
			sourceMap.items[commentName].functionTag = functionTag.name;
		}
		await eachAsyncArray(validTags, async (tagName) => {
			const tagItem = findItem(comment, tagName, 'tag');
			if (tagItem) {
				sourceMap.items[commentName][tagName] = cleanObject(tagItem, tagName);
			}
		});
		await eachAsyncArray(comment, async (commentTag) => {
			if (commentTag.tag === 'example') {
				const exampleCode = cleanObject(commentTag, 'example');
				exampleCode.source = await format({
					prettierOptions: {
						parser: 'babel',
					},
					text: exampleCode.description.replace('// =>', '\n// =>'),
				});
				sourceMap.items[commentName].examples.push(exampleCode);
			}
		});
		await eachAsyncArray(comment, async (commentTag) => {
			if (commentTag.tag === 'param') {
				sourceMap.items[commentName].params.push(cleanObject(commentTag, 'param'));
			}
		});
		sourceMap.items[commentName] = cleanObject(sourceMap.items[commentName]);
	});
	const categoriesSorted = [];
	eachObject(sourceMap.categories, (catItem, title) => {
		if (title) {
			categoriesSorted.push({
				title,
				items: catItem.sort(),
			});
		}
	});
	sourceMap.categories = sortCollectionAlphabetically(categoriesSorted, 'title');
	const jsonMap = `window.docMap = ${JSON.stringify(sourceMap)}`;
	writeFile(`${destination}${filename}.js`, jsonMap);
}
export { buildJson };
