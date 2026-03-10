import { Obs } from "./models/Observe.js";
import { NavResults } from "./types/NavResults.js";
import { readFileSync } from "fs";
import { resolve } from "path";
import { extract } from "./utils/extractor.js";
import { ObserveResult } from "./types/ObserveResults.js";
import { FrameworkStagehand } from "./Framework/Implementation/stagehand/FrameworkStagehand.js"
import { FrameworkInterface } from "./Framework/FrameworkInterface.js";

var UIactions: ObserveResult[][] = [];

async function CreateFramework() {
  //Changer l'implementation en changeant cette classe.
  //Rien n'impose l'utilisation/création de la méthode InitFramework
  //Soit la créer dans l'implementation, soit modifier la ligne ci-dessous.
  //Il existe une interface permettant de verifier que la methode existe bien, mais jsp l'utiliser avec une methode static.
  return await FrameworkStagehand.InitFramework();
}

/* function evaluation */
function loadTestCases(filename: string): any {
  const filePath = resolve(filename);
  const fileContent = readFileSync(filePath, "utf-8");
  return JSON.parse(fileContent);
}

export async function run_all_tests(test_suite: string) {
  const test_cases = loadTestCases(test_suite);
  let res = await run_search(test_cases[0]);
  return res;
}

async function run_search(
  test: any,
): Promise<NavResults | null> {
  const framework = await CreateFramework()

  const result = await simple_runGenCode(test.actions, framework, test.name, test.expected);
  await framework.CloseFramework()
  return result;
}

async function observe(old: Obs, action_performed: boolean, framework: FrameworkInterface): Promise<[Obs, boolean]> {
  var obs = new Obs();
  var b: boolean = false;
  await obs.getUIElements(framework);
  //debug
  console.debug("Observe : found ", obs.links.length, " links");
  console.debug("Observe : found ", obs.buttons.length, " buttons");
  console.debug("Observe : found ", obs.forms.length, " forms");
  console.debug("Observe : found ", obs.fields.length, " fields");
  console.debug("Observe : found ", obs.checkboxes.length, " checkboxes");
  console.debug("Observe :  performed ", action_performed);

  return [obs, action_performed];
}

async function simple_runGenCode(
  task: string[],
  framework: FrameworkInterface,
  testCaseName: string,
  expectedTestCase: number[]
): Promise<NavResults | null> {

  var data: Obs = new Obs();
  var observed: boolean = false;
  let verdict: boolean = true;

  for (var i = 0; i < task.length; i++) {
    if (i === 0) {
      const site = task[0].match(/'([^']*)'/);
      if (!site) {
        console.log("No valid web site found.");
        break;
      }
      try {
        await framework.goto(site[1]);
        await framework.waitForTimeout(5000);
        [data, observed] = await observe(data, true, framework);

      } catch (error) {
        console.log(`Navigation failed for ${site[1]}:`, error);
      }
      //observe
      [data, observed] = await observe(data, true, framework);
      //*******TOCHECK retour agent mis a true ? */
      if (observed == false) {
      }
    } else {
      if (!task[i].startsWith("Assert") && verdict) {
        try {
          const [action] = await framework.observe(task[i]);
          UIactions.push([action]);
          //console.log("UI action for this step:", action);
          let r;
          if (action == null || typeof action == 'undefined') {
            r = await framework.act(task[i]);
          }
          else {
            r = await framework.act(action);
          }
          await framework.waitForTimeout(5000);
          console.debug('action', task[i], r.success);
          //observe
          [data, observed] = await observe(data, r.success, framework);
          if (observed == false) {
            verdict = false;
          }
        }
        catch (error) {
          console.log(`Action failed at step ${i}: ${task[i]} ->`, error);
          verdict = false;
        }
      }
    }
    if (!verdict) {
      return null;
    }
  }
  const pageContent = await extract(data, framework);
  return { testCaseName, task, UIactions, expectedTestCase, pageContent };
}
