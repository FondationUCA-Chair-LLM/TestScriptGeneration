# GenCode - AI-Powered Test Generation Framework

GenCode is a test generation program that automatically creates, executes, and self-heals test cases using AI. It combines web automation with LLM-powered code generation to produce robust test suites.

## How It Works
1. **Navigation & Observation**: Stagehand navigates the target application and records UI actions
2. **Test Generation**: LLM generates initial test code based on:
   - Test case name
   - Task description
   - UI actions performed
   - Expected test outcomes
   - Page content/context
3. **Execution**: Tests are executed in the specified framework (Playwright/Selenium)
4. **Self-Healing Loop**: If tests fail:
   - Analyzes error details and failing step
   - LLM regenerates the problematic code
   - Shows diff of changes
   - Re-executes until passing or max retries reached
5. **Multi-Run Strategy**: If all retries fail, can restart from scratch with a fresh generation

## Installation

Install dependencies using npm in the main directory and all subdirectories:

```bash
npm install
cd test-gen
npm install
cd ../tester
npm install
cd ..
```

If you encounter issues, try using the legacy peer dependencies flag:

```bash
npm install --legacy-peer-deps
cd test-gen
npm install --legacy-peer-deps
cd ../tester
npm install --legacy-peer-deps
cd ..
```

## Configuration

Edit the configuration file at [config.ts](config.ts) to adjust:
- Target URL
- Test framework (Playwright/Selenium)
- LLM model settings
- Max retry attempts
- Other configuration values

## Usage

Start the test generator:

```bash
npm start
```

The program will:
1. Navigate the target application
2. Generate test code
3. Execute the tests
4. Display results and save generated test files

## Framework Architecture

GenCode is designed with extensibility in mind, using a framework abstraction layer.

### Project Structure

```
GenCode/
├── index.ts                 # Main entry point
├── config.ts                # Configuration settings
├── test-gen/                # Test generation module
│   ├── GenCodeForTests.ts  # Stagehand navigation
│   ├── Tcgenerator.ts      # AI test code generator
│   ├── Framework/
│   │   ├── FrameworkInterface.ts
│   │   └── Implementation/
│   │       └── stagehand/
│   └── types/
│       ├── NavResults.ts
│       └── ObserveResults.ts
└── tester/                  # Test execution module
    ├── tester.ts           # Test execution engine
    └── framework/
        ├── framework.ts
        ├── default/
        │   ├── playwright/
        │   └── selenium/
        └── implementations/
            ├── playwright.ts
            └── selenium.ts
```

### Extensibility

GenCode supports adding new frameworks in two places:

#### Test Generation Framework (test-gen)

The navigation framework abstraction layer is defined in [test-gen/Framework/FrameworkInterface.ts](test-gen/Framework/FrameworkInterface.ts). You can add your own navigation framework implementations by:

1. Creating a new folder under [test-gen/Framework/Implementation/](test-gen/Framework/Implementation/)
2. Implementing the framework interface
3. Following the pattern used in the existing [Stagehand integration](test-gen/Framework/Implementation/stagehand/)

#### Test Execution Framework (tester)

The test execution framework abstraction layer is defined in [tester/framework/framework.ts](tester/framework/framework.ts). You can add your own test execution framework implementations by:

1. Creating a new implementation file under [tester/framework/implementations/](tester/framework/implementations/)
2. Implementing the framework interface
3. Adding default configuration under [tester/framework/default/](tester/framework/default/)
4. Following the pattern used in the existing [Playwright](tester/framework/implementations/playwright.ts) and [Selenium](tester/framework/implementations/selenium.ts) implementations

This dual-layer architecture makes it easy to swap or add different frameworks for both navigation and test execution while maintaining consistent behavior.

## Known Issues

### XPath Resolution with llama3.3:70b

When using llama3.3:70b with Stagehand's `.act()` observation functionality, element IDs may be returned wrapped in brackets (e.g., `[0-42]` instead of `0-42`), causing XPath lookup failures.

#### Workaround

Modify the Stagehand package to strip brackets from element IDs:

**File**: `node_modules/@browserbasehq/stagehand/dist/index.js`

**Search for**: `const lookUpIndex = elementId.toString();`

**Replace with**:
```javascript
const lookUpIndex = elementId.toString().replace(/^\[|\]$/g, "");
```

**Context** (for reference):
```javascript
const elementsWithSelectors = yield Promise.all(
  observationResponse.elements.map((element) => __async(this, null, function* () {
    const _a15 = element, { elementId } = _a15, rest = __objRest(_a15, ["elementId"]);
    
    this.logger({
      category: "observation",
      message: "Getting xpath for element",
      level: 1,
      auxiliary: {
        elementId: {
          value: elementId.toString(),
          type: "string"
        }
      }
    });
    
    // Apply the fix here
    const lookUpIndex = elementId.toString().replace(/^\[|\]$/g, "");
    const xpath = combinedXpathMap[lookUpIndex];
    
    if (!xpath || xpath === "") {
      this.logger({
        category: "observation",
        message: `Empty xpath returned for element: ${elementId}`,
        level: 1
      });
    }
    // ...
```

> **Note**: This is a temporary workaround. Consider creating a patch file or reporting this issue to the Stagehand repository.

### Python Code Generation on Some Test Cases

On some test cases, GenCode may generate Python output instead of the expected programming language (TypeScript/JavaScript or Java).

#### Root Cause

We believe this is a default behavior when the LLM doesn't know which programming language to use. This typically happens when:
- The page content is too long
- The LLM "forgets" parts of the prompt due to context length limitations
- Language specification gets lost in the conversation context

#### Planned Solution

**TODO**: Refactor the assertion flow to avoid sending the entire page content to the LLM:
1. Perform assertions in the GenCode loop
2. Return only the XPath of the asserted elements
3. Send the compact XPath data to the LLM instead of the full page content

This will reduce context size and ensure the programming language specification is consistently maintained.

