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
        if (!file) {
            dir = join(resolve(__dirname, '../..'), directory);
        }else{
            dir = join(directory, file);
        }

        return dir;
    }

    static filesResolve(directory: string): string[] {
        const files = readdirSync(directory).filter((file) => file.endsWith('.ts'));
        return files;
    }
}