import { copyFolder, currentPath } from '@universalweb/acid';
import path from 'path';
const currentDirname = currentPath(import.meta);
await copyFolder(path.join(currentDirname, './source/'), path.join(currentDirname, './github/'));
await copyFolder(path.join(currentDirname, './source/'), path.join(currentDirname, './npm/'));
