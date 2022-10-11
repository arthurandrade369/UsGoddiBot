import { readdirSync } from "fs";
import { join, resolve } from "path";

export class MappingDirectories {
    /**
     * Returns a array of elements in a directory.
     * @param directory string
     * @returns string[ ]
     */
    static pathResolve(directory: string, file?: string): string {
        let dir;

        if (!file) { dir = join(resolve(__dirname, '../..'), directory); }
        else { dir = join(directory, file); }

        return dir;
    }

    /**
     * Return the path resolved to all files in the directory, even if they are in a directory
     * @param directory string 
     * @returns string[]
     */
    static filesResolve(directory: string): string[] {
        let files: string[] = [];
        readdirSync(directory, { withFileTypes: true }).forEach(dirent => {
            if(dirent.isDirectory()) files = files.concat(readdirSync(`${directory}\\${dirent.name}`).map(files => `${dirent.name}\\${files}`));
            else files.push(dirent.name);
        });

        return files;
    }
}