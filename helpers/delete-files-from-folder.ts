import fs from "fs";
import path from "path";

export const deleteFilesFromFolder = (
	folderPath: string,
	filesToDelete: string[]
): void => {
	filesToDelete.forEach(file => {
		const filePath = path.join(folderPath, file);
		fs.unlink(filePath, err => {
			if (err) {
				console.error(`Error while deleting file ${file}:`, err);
				return;
			}
			console.log(`File ${file} removed.`);
		});
	});
};
