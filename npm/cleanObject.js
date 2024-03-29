import { stringify } from 'comment-parser';
import {
	isArray,
	compactMapObject,
	hasValue,
	omit,
	isEmpty,
	isString
} from '@universalweb/acid';
function cleanObject(cleanThisArg, cleanTag) {
	if (cleanTag && cleanThisArg.source) {
		const cleanThis = cleanThisArg.source;
		if (isArray(cleanThis)) {
			cleanThisArg.source = stringify(cleanThisArg).replace(`@${cleanTag}\n`, '')
				.replace(`@${cleanTag}`, '')
				.trim();
		} else if (isString(cleanThis)) {
			cleanThisArg.source = cleanThis.replace(`@${cleanTag}\n`, '')
				.replace(`@${cleanTag}`, '')
				.trim();
		}
	}
	if (cleanThisArg) {
		return compactMapObject(omit(cleanThisArg, ['line']), (item) => {
			if (hasValue(item) && !isEmpty(item)) {
				if (isString(item)) {
					return item.trim();
				}
				return item;
			}
		});
	}
	return cleanThisArg;
}
export default cleanObject;
