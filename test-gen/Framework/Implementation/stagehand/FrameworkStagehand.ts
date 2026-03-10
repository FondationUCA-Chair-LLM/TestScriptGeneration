import { Stagehand, Page, BrowserContext, ActOptions, ActResult } from "@browserbasehq/stagehand";
import StagehandConfig from "./stagehand.config.js";
import boxen from "boxen";
import chalk from "chalk";
import { FrameworkInterface } from "../../FrameworkInterface.js";
import { ElementHandle, Locator } from "playwright";
import { expect } from "playwright/test";
import { ObserveResult } from "../../../types/ObserveResults.js";

export class FrameworkStagehand implements FrameworkInterface {
    framework: Stagehand;
    context: BrowserContext
    page: Page

    static async InitFramework(): Promise<FrameworkStagehand> {
        const stagehand = new Stagehand({ ...StagehandConfig });
        await stagehand.init();

        if (StagehandConfig.env === "BROWSERBASE" && stagehand.browserbaseSessionID) {
            console.log(
                boxen(
                    `View this session live in your browser: \n${chalk.blue(
                        `https://browserbase.com/sessions/${stagehand.browserbaseSessionID}`,
                    )}`,
                    { title: "Browserbase", padding: 1, margin: 3 }
                )
            );
        }
        return new FrameworkStagehand(stagehand);

    }

    constructor(framework: Stagehand) {
        this.framework = framework
        this.context = framework.context
        this.page = framework.context.pages()[0]
    }
    async expect(locator: Locator): Promise<void> {
        await expect(locator).toBeEditable();
    }

    async getByTextWithInnerText(filter: string): Promise<string[]> {
        return await this.page.getByText(filter).allInnerTexts();
    }

    async getByRole(element: "alert" | "alertdialog" | "application" | "article" | "banner" | "blockquote" | "button" | "caption" | "cell" | "checkbox" | "code" | "columnheader" | "combobox" | "complementary" | "contentinfo" | "definition" | "deletion" | "dialog" | "directory" | "document" | "emphasis" | "feed" | "figure" | "form" | "generic" | "grid" | "gridcell" | "group" | "heading" | "img" | "insertion" | "link" | "list" | "listbox" | "listitem" | "log" | "main" | "marquee" | "math" | "meter" | "menu" | "menubar" | "menuitem" | "menuitemcheckbox" | "menuitemradio" | "navigation" | "none" | "note" | "option" | "paragraph" | "presentation" | "progressbar" | "radio" | "radiogroup" | "region" | "row" | "rowgroup" | "rowheader" | "scrollbar" | "search" | "searchbox" | "separator" | "slider" | "spinbutton" | "status" | "strong" | "subscript" | "superscript" | "switch" | "tab" | "table" | "tablist" | "tabpanel" | "term" | "textbox" | "time" | "timer" | "toolbar" | "tooltip" | "tree" | "treegrid" | "treeitem",
        target: string): Promise<Locator> {
        return this.page.getByRole(element, { name: target });
    }

    async locateInnerHandles(element: string): Promise<any> {
        return (await this.page.locator(element).elementHandles());
    }

    async isPresent(element: string): Promise<boolean> {
        return await this.page.locator(`text=${element}`).count() > 0;
    }

    async getInnerText(element: string): Promise<string> {
        return await this.page.innerText('body');
    }

    async locateWithInnerText(element: string): Promise<string[]> {
        return await this.page.locator('a').allInnerTexts();
    }

    async locate(element: string): Promise<Locator> {
        return this.page.locator(`text=${element}`)
    }

    getFrameworkInstance(): Stagehand {
        if (this.framework) {
            return this.framework

        }
        throw Error("Framework not initialized")
    }

    async CloseFramework(): Promise<void> {
        if (this.framework) {
            return await this.framework.close()
        }
        throw Error("Error on Close : Framework not initialized")
    }

    extract(): Promise<{ page_text?: string | undefined; }> {
        return this.page.extract();
    }

    async getUIElements(): Promise<{
        links: string[];
        buttons: string[];
        fields: string[];
        forms: string[];
        checkboxes: string[];
        selects: string[];
        staticText: string[];
    }> {

        let links = [];
        let buttons = [];
        let fields = [];
        let forms = [];
        let checkboxes = [];
        let selects = [];
        let staticText = [];

        links = await this.page.locator('a:visible').allInnerTexts();
        buttons = await this.page.locator('button:visible').allInnerTexts();
        fields = await this.page.$$eval('input', inputs =>
            inputs.map(input => input.getAttribute('name') || '(no name)')
        );//page.locator('input:visible').all().;
        forms = await this.page.locator('form:visible').allInnerTexts();
        checkboxes = await this.page.$$eval('input[type="checkbox"]', checkboxes =>
            checkboxes.map(checkbox => checkbox.getAttribute('name') || '(no name)')
        );
        //page.locator('checkbox:visible').allInnerTexts();
        selects = await this.page.locator('select:visible').allInnerTexts();
        staticText = await this.page.locator('p:visible, li:visible, span:visible').allInnerTexts();
        return { links, buttons, fields, forms, checkboxes, selects, staticText }
    }

    async act(action: string | ObserveResult): Promise<ActResult> {
        if (typeof action === 'string') {
            return await this.page.act({ action: action })
        }
        else {
            return await this.page.act(action)
        }
    }

    async waitForTimeout(ms: number): Promise<void> {
        await this.page.waitForTimeout(ms)
    }

    goto(url: string): Promise<any> {
        return this.page.goto(url);
    }

    async init(): Promise<void> {
        await this.framework.init()
        this.page = this.framework.page
        this.context = this.framework.context
    }

    async close(): Promise<void> {
        await this.framework.close()
    }

    async extractTables(): Promise<string[][][]> {
        const tablesData: string[][][] = await this.page.evaluate(() => {
            const tables = Array.from(document.querySelectorAll('table'));

            // On ne garde que les tables qui ont au moins un th
            const tablesWithHeaders = tables.filter(table => table.querySelector('th'));

            return tablesWithHeaders.map(table => {
                const rows = Array.from(table.querySelectorAll('tr'));

                return rows.map(row => {
                    const cells = Array.from(row.querySelectorAll('th, td'));
                    // On retourne le HTML complet de chaque cellule pour garder tous les attributs
                    return cells.map(cell => cell.outerHTML);
                });
            });
        });

        return tablesData;
    }

    async observe(action: string): Promise<any> {
        const result = await this.page.observe(action);
        return result;
    }
}