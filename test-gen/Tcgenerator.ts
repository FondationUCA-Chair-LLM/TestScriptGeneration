import { PromptTemplate } from "@langchain/core/prompts";
import { Ollama } from "@langchain/ollama";
import { prompt_tcfix, prompt_tcgen } from "./config/prompts.js";
import { ObserveResult } from "./types/ObserveResults.js";

export class Tcgenerator {
    constructor(
        private model: string,
        private server: string,
        private framework: string,
        private language: string,
    ) { }

    async generateTestCase(
        actions: string[],
        UIactions: ObserveResult[][],
        verdicts: number[],
        pageContent: string
    ): Promise<{ output: string, prompt: string }> {

        // Step 1: prepare LLM call
        const prompt = PromptTemplate.fromTemplate(prompt_tcgen);
        const llm = new Ollama({
            model: this.model,
            temperature: 0,
            maxRetries: 5,
            baseUrl: this.server,
        });

        const chain = prompt.pipe(llm);

        // Step 2: invoke LLM
        const rawOutput = await chain.invoke({
            tc_steps: actions,
            xpath: UIactions,
            framework: this.framework,
            language: this.language,
            browser: "Firefox",
            page: pageContent,
            expected: verdicts,
        });

        // Supposons que prompt_tcgen est ton template avec {tc_steps}, {xpath}, etc.
        let filledPrompt = prompt_tcgen
            .replace('{tc_steps}', JSON.stringify(actions))
            .replace('{xpath}', JSON.stringify(UIactions))
            .replace('{framework}', this.framework)
            .replace('{language}', this.language)
            .replace('{page}', pageContent)
            .replace('{expected}', JSON.stringify(verdicts));
        return { output: rawOutput, prompt: filledPrompt };
    }

    async fixTestCase(prompt: string, test: string, step: string, details: string) {
        const promptTemplate = PromptTemplate.fromTemplate(prompt_tcfix);
        const llm = new Ollama({
            model: this.model,
            temperature: 0,
            maxRetries: 5,
            baseUrl: this.server,
        });

        const chain = promptTemplate.pipe(llm);

        const rawOutput = await chain.invoke({
            previous_prompt: prompt,
            previous_test: test,
            failed_step: step,
            error_details: details,
        });

        return rawOutput;

    }
}


