import { ObserveResult } from "../types/ObserveResults.js";
interface ActResult {
  success: boolean;
  message: string;
  action: string;
}

export interface FrameworkInterface {
  init(): Promise<void>
  CloseFramework(): Promise<void>
  goto(url: string): Promise<Response>;
  act(action: string | ObserveResult): Promise<ActResult>;
  waitForTimeout(ms: number): Promise<void>;
  getUIElements(): Promise<{
    links: string[];
    buttons: string[];
    fields: string[];
    forms: string[];
    checkboxes: string[];
    selects: string[];
    staticText: string[];
  }>
  extract(): Promise<{ page_text?: string | undefined; }>
  locate(element: string): Promise<any>
  locateInnerHandles(element: string): Promise<any>
  locateWithInnerText(element: string): Promise<string[]>
  getInnerText(element: string): Promise<string>
  isPresent(element: string): Promise<boolean>
  getByRole(element: string, target: string): Promise<any>
  getByTextWithInnerText(filter: string): Promise<string[]>
  expect(locator: any): Promise<void>
  extractTables(): Promise<string[][][]>
  observe(action: string): Promise<any>
}