
import { writeFileSync, existsSync, cpSync } from 'fs';
import { join } from 'path';
import { Framework } from '../framework';

export class PlaywrightFramework extends Framework {
    setupCommand = 'npm init -y';
    fileName = 'test.ts';
    startCommand = 'npx playwright test';
    defaultPath = join(this.currentPath, 'default', 'playwright');
    dependencies = 'npm install -D @playwright/test playwright typescript ts-node';

    async installDependencies(): Promise<void> {
        if (this.setupCommand) {
            await this.execPromise(`cd ${this.outputPath} && ${this.setupCommand}`);
        }
        if (this.dependencies) {
            await this.execPromise(`cd ${this.outputPath} && ${this.dependencies}`);
        }
    }

    verifyDependencies(): void {
        for (const file of ['package.json', 'node_modules']) {
            if (!existsSync(join(this.outputPath, file))) {
                throw new Error(`${file} was not created`);
            }
        }
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
        const testPath = join(this.outputPath, this.fileName);
        writeFileSync(testPath, this.code);
        console.debug(`Written test code to output/${this.fileName}`);
    }

    async executeTests(): Promise<void> {
        const { stdout: testOutput } = await this.execPromise(`cd ${this.outputPath} && ${this.startCommand}`);
    }
}


