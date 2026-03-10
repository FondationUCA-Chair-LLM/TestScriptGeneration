
import { mkdirSync, existsSync, rmSync, } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';

export class Framework {
    execPromise = promisify(exec);
    currentPath = __dirname;
    outputPath = join(this.currentPath, 'output');
    defaultPath = join(this.currentPath, 'default');

    constructor(
        public code: string
    ) {}

    async installDependencies(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    verifyDependencies(): void {
        throw new Error('Method not implemented.');
    }

    clearOrCreateOutputDirectory(): void {
        if (existsSync(this.outputPath)) {
            rmSync(this.outputPath, { recursive: true, force: true });
            console.debug('Cleared output/ directory');
        }
        mkdirSync(this.outputPath, { recursive: true });
        console.debug('Created output/ directory');
    }

    copyDefaultFiles(): void {
        throw new Error('Method not implemented.');
    }

    writeTestFile(): void {
        throw new Error('Method not implemented.');
    }

    async executeTests(): Promise<void> {
        throw new Error('Method not implemented.');
    }
}