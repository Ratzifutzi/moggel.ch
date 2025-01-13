import * as fs from 'fs/promises';
import * as path from 'path';

export async function readDirRecursive(dir: string): Promise<string[]> {
	let results: string[] = [];

	const list = await fs.readdir(dir, { withFileTypes: true });
	for (const file of list) {
		const filePath = path.join(dir, file.name);
		if (file.isDirectory()) {
			results = results.concat(await readDirRecursive(filePath));
		} else {
			results.push(filePath);
		}
	}
	return results;
}