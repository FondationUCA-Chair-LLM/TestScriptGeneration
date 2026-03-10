
import { writeFileSync, existsSync, cpSync } from 'fs';
import { join } from 'path';
import { Framework } from '../framework';

export class SeleniumFramework extends Framework {
    fileName = '';
    startCommand = 'mvn test';
    defaultPath = join(this.currentPath, 'default', 'selenium');

    constructor(code: string) {
        super(code);
        let match = this.code.match(/\bclass\s+(\w+)/);
        if (match) {
            this.fileName = match[1].replace(/(^Test|Test$|Tests$|TestCase$)/ig, '');
            this.fileName = `${this.fileName}Test.java`;
        } else {
            throw new Error('Could not determine Java class name from the test code.');
        }
    }

    async installDependencies(): Promise<void> {
        console.debug('Skipping dependency installation for Selenium framework.');
    }

    verifyDependencies(): void {
        console.debug('Skipping dependency verification for Selenium framework.');
    }

    copyDefaultFiles(): void {
        if (existsSync(this.defaultPath)) {
            cpSync(this.defaultPath, this.outputPath, { recursive: true });
            console.debug('Copied files from default/ to output/');
        } else {
            console.debug('Warning: default/ directory does not exist, skipping copy');
        }
    }

    writeTestFile(): void {
        this.code = this.code.replace(/public\s+class\s+\w+/, `public class ${this.fileName.replace('.java', '')}`);
        const testPath = join(this.outputPath,'src', 'test', 'java', 'com', this.fileName);
        writeFileSync(testPath, this.code);
        console.debug(`Written test code to output/src/test/java/com/${this.fileName}`);
    }

    async executeTests(): Promise<void> {
        const { stdout: testOutput } = await this.execPromise(`cd ${this.outputPath} && ${this.startCommand}`);
    }
}




