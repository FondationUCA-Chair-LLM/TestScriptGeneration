import { PlaywrightFramework } from './framework/implementations/playwright';
import { SeleniumFramework } from './framework/implementations/selenium';
import { Framework } from './framework/framework';

type Verdict = {
    passed: boolean;
    step: "dependencies" | "execution" | "end" | "unknown";
    details: string;
}

export async function executeTests(code: string, framework: string, setup: boolean = false): Promise<Verdict> {
    let frameworkInstance: Framework = new Framework(code);
    let verdict: Verdict = { passed: true, step: "unknown", details: '' };

    framework = framework.toLowerCase();
    //check if the framework is supported by this tester
    switch (framework) {
        case 'playwright':
            console.debug('Running tests with Playwright...');
            frameworkInstance = new PlaywrightFramework(code);
            break;
        case 'selenium':
            console.debug('Running tests with Selenium...');
            frameworkInstance = new SeleniumFramework(code);
            break;
        default:
            console.error(`Framework ${framework} is not supported.`);
            process.exit(1);
    }

    if (setup) {
        // Clear output directory if it exists, create it otherwise
        frameworkInstance.clearOrCreateOutputDirectory();

        try {
            // Install dependencies
            console.debug('Installing dependencies...');
            await frameworkInstance.installDependencies();
            frameworkInstance.verifyDependencies();
            console.debug('Dependencies installed successfully.');
        } catch (error: any) {
            console.debug('Error during dependency installation');
            console.error(error.stdout);
            verdict.passed = false;
            verdict.step = "dependencies";
            verdict.details = `${error.message}\n${error.stdout}`;
            return verdict;
        }

        // Copy all files from default/frameworkName to output/
        frameworkInstance.copyDefaultFiles();
    }

    // Write test code to output/test.ts
    frameworkInstance.writeTestFile();

    try {
        // Execute the test script and capture the exit code
        console.debug('\nRunning tests...\n');
        await frameworkInstance.executeTests();
    } catch (error: any) {
        if (error.message && !error.stdout) {
            // Errors from our own checks
            console.error('Error:', error.message);
            process.exit(1);
        }

        const exitCode = error.code || 1;
        if (exitCode !== 0) {
            console.debug('Some tests failed. error code:', exitCode);
            verdict.passed = false;
            verdict.step = "execution";
            verdict.details = error.stdout + error.stderr;
            return verdict;
        }
    }
    verdict.step = "end";
    console.debug('All tests passed successfully!');
    return verdict;
}

