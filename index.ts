import { executeTests } from './tester/tester';
import chalk from "chalk";
import { diffLines } from "diff";
import { test_suite, model_tcgen, server, maxNB_RUNS, framework, language, maxRetries } from "./console";
import { run_all_tests as runStagehand } from "./test-gen/GenCodeForTests";
import { NavResults } from './test-gen/types/NavResults';
import { Tcgenerator } from './test-gen/Tcgenerator';

async function main() {
  let result = { passed: false, step: '', details: '' };
  const navResults: NavResults | null = await runStagehand(test_suite);
  if (!navResults) {
    console.log(chalk.red("No test case information available to generate test."));
    return;
  }

  for (let NB_RUNS = 1; NB_RUNS <= maxNB_RUNS; NB_RUNS++) {
    console.log(chalk.blue(`\n=== TEST GENERATION RUN ${NB_RUNS} / ${maxNB_RUNS} ===`));

    let tcGenerator = new Tcgenerator(model_tcgen, server, framework, language);
    // call gen-test to generate test code
    let { output, prompt } = await tcGenerator.generateTestCase(navResults.task, navResults.UIactions, navResults.expectedTestCase, navResults.pageContent);

    // extract code block from output
    let test = parseCodeFromOutput(output);
    if (!test) {
      console.log(chalk.red("No code block found in the generated output."));
      continue;
    }
    console.log(chalk.cyan("FIRST TEST GENERATED:", test));

    // call executeTests with the output of gen-test
    result = await executeTests(test, framework, true);
    if (!result.passed) {
      console.log(`The initial generated test failed at the '${result.step}' step with the error : \n${chalk.red(result.details)}`)
    }
    else {
      console.log(chalk.green(`The initial test passed successfully in ${NB_RUNS} runs!`));
      return;
    }

    for (let i = 1; i <= maxRetries; i++) {
      console.log(`### updating test with LLM... Attempt ${i}/${maxRetries} ###`);

      // call fix-test with the error details and previous code
      output = await tcGenerator.fixTestCase(prompt, test, result.step, result.details);
      let new_test = parseCodeFromOutput(output);
      if (!new_test) {
        console.log(chalk.red("No code block found in the newly generated output."));
        continue;
      }

      // show diff
      if (!checkDiff(test, new_test)) {
        break;
      }
      test = new_test;

      // call executeTests again
      result = await executeTests(test, framework)
      if (!result.passed) {
        console.log(`The test failed at the '${result.step}' step with the error : \n${chalk.red(result.details)}`)
      }
      else {
        console.log(chalk.green(`The test passed successfully in ${NB_RUNS} runs, at attempt ${i}!`));
        return;
      }
    }
  }
  console.log(chalk.red(`The test could not be fixed after ${maxRetries} attempts.`));
}
main();


function diffString(a: string, b: string): { diff: string, changes: number } {
  const parts = diffLines(a, b);

  let oldLine = 1;
  let newLine = 1;
  let out = "";
  let changes = 0;

  for (const part of parts) {
    const lines = part.value.split("\n");
    if (lines[lines.length - 1] === "") lines.pop();

    for (const line of lines) {
      if (part.removed) {
        out += `${String(oldLine).padStart(4)} - ${line}\n`;
        oldLine++;
        changes++;
      } else if (part.added) {
        out += `${String(newLine).padStart(4)} + ${line}\n`;
        newLine++;
        changes++;
      } else {
        oldLine++;
        newLine++;
      }
    }
  }

  return { diff: out.trimEnd(), changes };
}

function checkDiff(test: string, new_test: string): boolean {
  let diff = diffString(test, new_test)
  if (diff.changes === 0) {
    console.log(chalk.red("No changes detected in the updated test. Stopping further attempts."));
    return false;
  }
  else if (diff.changes > 30) {
    console.log(`Too many changes (${diff.changes}) detected in the updated test, showing the full updated code.`);
    console.log(chalk.yellow(new_test));
  }
  else {
    console.log(chalk.yellow(diff.diff))
  }
  return true;
}

function parseCodeFromOutput(output: string) {
  if (output.includes("```")) {
    const match = output.match(/```[a-zA-Z0-9]*\n([\s\S]*?)```/);
    return match ? match[1] : null;
  } else {
    return output;
  }
}
