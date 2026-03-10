import chalk from "chalk";
import {
    test_suite as imported_test_suite,
    model_nav as imported_model_nav,
    model_tcgen as imported_model_tcgen,
    server as imported_server,
    maxRetries as imported_maxRetries,
    maxNB_RUNS as imported_maxNB_RUNS,
    framework as imported_framework,
    language as imported_language,
} from "./config.js";

let _test_suite = imported_test_suite;
let _model_nav = imported_model_nav;
let _model_tcgen = imported_model_tcgen;
let _server = imported_server;
let _maxRetries = imported_maxRetries;
let _maxNB_RUNS = imported_maxNB_RUNS;
let _framework = imported_framework;
let _language = imported_language;

const configOverrides = {
    "test_suite": { get value() { return _test_suite; }, set value(v) { _test_suite = v; }, type: String },
    "model_nav": { get value() { return _model_nav; }, set value(v) { _model_nav = v; }, type: String },
    "model_tcgen": { get value() { return _model_tcgen; }, set value(v) { _model_tcgen = v; }, type: String },
    "server": { get value() { return _server; }, set value(v) { _server = v; }, type: String },
    "maxRetries": { get value() { return _maxRetries; }, set value(v) { _maxRetries = Number(v); }, type: Number },
    "maxNB_RUNS": { get value() { return _maxNB_RUNS; }, set value(v) { _maxNB_RUNS = Number(v); }, type: Number },
    "framework": { get value() { return _framework; }, set value(v) { _framework = v; }, type: String },
    "language": { get value() { return _language; }, set value(v) { _language = v; }, type: String },
} as Record<string, { value: any; type: any }>;

function process_args(argv: string[]): Record<string, string> {
    const args = argv.slice(2);
    let parsed = {} as Record<string, string>;
    for (const arg of args) {
        const [key, ...rest] = arg.split(':');
        const value = rest.join(':');
        if (!value) continue;
        parsed[key] = value;
    }
    return parsed;
}

function check_help() {
    if (["help", "h", "-help", "-h", "--help", "--h"].includes(process.argv[2])) {
        console.log("Usage: npm start [key:value ...]");
        console.log("Example: npm start NUM_RUNS:10 model_eval:myModel");
        console.log("Available arguments:");
        for (const key of Object.keys(configOverrides)) {
            console.log(` - ${key}:${configOverrides[key].type.name}`);
        }
        return true;
    }
    return false;
}

const args = process_args(process.argv);

if (check_help()) process.exit(0);

for (const [key, value] of Object.entries(args)) {
    if (key in configOverrides) {
        console.debug(chalk.green(`🔁 Overridden ${key} from ${configOverrides[key].value} to -> ${value}`));
        configOverrides[key].value = configOverrides[key].type(value);
    } else {
        console.warn(`Unknown argument: ${key}`);
    }
}

export const test_suite = _test_suite;
export const model_nav = _model_nav;
export const model_tcgen = _model_tcgen;
export const server = _server;
export const maxRetries = _maxRetries;
export const maxNB_RUNS = _maxNB_RUNS;
export const framework = _framework;
export const language = _language;
