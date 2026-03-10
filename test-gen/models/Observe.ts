import { parseElements } from "../utils/extractor.js";
import { getTablesFromUIWithFusion } from "../utils/observeTable.js"
import { FrameworkInterface } from '../Framework/FrameworkInterface.js'

export class Obs {
    links: string[] = [];
    buttons: string[] = [];
    forms: string[] = [];
    checkboxes: string[] = [];
    selects: string[] = [];
    fields: string[] = [];
    statictText: string[] = [];
    tables: Array<Array<string>>;
    framework?: FrameworkInterface;

    constructor(
        links: string[] = [],
        buttons: string[] = [],
        forms: string[] = [],
        fields: string[] = [],
        checkboxes: string[] = [],
        selects: string[] = [],
        statictText: string[] = [],
        tables: Array<Array<string>> = [],
        framework?: FrameworkInterface
    ) {
        this.links = links;
        this.buttons = buttons;
        this.forms = forms;
        this.checkboxes = checkboxes;
        this.fields = fields;
        this.selects = selects;
        this.statictText = statictText;
        this.tables = tables;
        this.framework = framework;
    }

    equals(other: Obs): boolean {
        if (!(other instanceof Obs)) return false;
        return (
            new Set(this.links).size === new Set(other.links).size &&
            new Set(this.buttons).size === new Set(other.buttons).size &&
            new Set(this.fields).size === new Set(other.fields).size &&
            new Set(this.forms).size === new Set(other.forms).size &&
            new Set(this.checkboxes).size === new Set(other.checkboxes).size &&
            new Set(this.statictText).size === new Set(other.statictText).size
        );
    }

    async getUIElements(framework: FrameworkInterface): Promise<void> {

        const ui = await framework.getUIElements()

        this.links = ui.links;
        this.buttons = ui.buttons;
        this.fields = ui.fields;
        this.forms = ui.forms;
        this.checkboxes = ui.checkboxes;
        this.selects = ui.selects;
        this.statictText = ui.staticText;

        //Add ui element extracted from page.extract ?
        const cpage = await framework.extract()
        //const cpage = await page.extract();
        const results = parseElements(cpage.page_text);
        let result = "{\n";
        for (var k = 0; k < results.length; k++) {
            const desc: string = results[k].description ?? "(no description)";
            const type: string = results[k].type ?? "";
            if (type === "link") this.links.push(desc);
            if (type === "button") this.buttons.push(desc);
            if (type === "form") this.forms.push(desc);
            if (type === "field") this.fields.push(desc);
            if (type === "checkbox") this.checkboxes.push(desc);
            if (type === "select") this.selects.push(desc);
            if (type === "staticText") this.statictText.push(desc);
        }

        //Ajoute les tableaux présents sur la page

        console.debug("Obtention des tableaux")
        //this.tables = await getTablesFromUI(page);
        this.tables = await getTablesFromUIWithFusion(framework); //TODO: passer framework en param
        if (this.tables.length != 0) console.debug("Tableaux trouvés et chargés: ", this.tables)
        else console.debug("Pas de tableaux sur la page")
    }

    static async getUIElementsByText(filter: string, framework: FrameworkInterface): Promise<string[]> {
        return await framework.getByTextWithInnerText(filter)
    }

    static eleToJson(linkList: string[], eleType: string): string {
        let result = "";
        for (var k = 0; k < linkList.length; k++) {
            result += "{\"id\": , \"description\": " + linkList[k] + ", \"type\": " + eleType + "}\n";
        }
        return result;

        //const result = linkList.map(link => ({ type: eleType, text: link }));
        //return JSON.stringify(result, null, 2);
    }
}