//test suite
export const test_suite = "./littleTest.json"; // "test_cases.json"; // "test_casesV2.json"; // "test_casesV3.json"; // "test_casesV4.json"; // "test_casesV5.json";

//models
export const model_nav="qwen3:14b"; //"llama3.3:70b"; //"mistral-nemo:latest"; //"qwen3:14b"; //"qwen2.5:7b"; //"llama3.3:70b"; //"qwen2.5:7b"; //"qwen2.5:32b-instruct-q4_K_M";
export const model_tcgen="llama3.3:70b"; //"llama3.3:70b"; //"mistral-nemo:latest"; //"qwen3:14b"; //"qwen2.5:7b"; //"llama3.3:70b"; //"qwen2.5:7b"; //"qwen2.5:32b-instruct-q4_K_M";

export const server = "http://192.168.128.44:11434"; // "http://localhost:11434"; //"http://192.168.128.44:11434"

// configuration
export const maxRetries = 7; // maximum number of retries for test generation
export const maxNB_RUNS = 20; // maximum number of test generation runs
export const framework = 'Playwright'; //'Playwright'; //'Selenium';
export const language = 'TypeScript'; //'TypeScript'; //'java';

// Disable console.debug to avoid cluttering the output
console.debug = () => {};