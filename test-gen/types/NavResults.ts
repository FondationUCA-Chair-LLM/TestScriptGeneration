import { ObserveResult } from "./ObserveResults.js";

export type NavResults = {
  testCaseName: string;
  task: string[];
  UIactions: ObserveResult[][];
  expectedTestCase: number[];
  pageContent: string;
};

