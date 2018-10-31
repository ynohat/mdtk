const path = require("path");
const {parseAny} = require("../src/utils");

module.exports = {
    config: {
        group: "General",
        global: true,
        config: true,
        description: "Path to a JSON, YAML or HCL config file",
        configParser: f => {
            var config = parseAny(f);
            var dir = path.dirname(f);
            if (config.input && config.input !== "-") {
                config.input = path.resolve(dir, config.input);
            }
            if (config.output && config.output !== "-") {
                config.output = path.resolve(dir, config.output);
            }
            if (Array.isArray(config.include)) {
                config.include = config.include.map(p => path.resolve(dir, p));
            }
            if (Array.isArray(config.varfiles)) {
                config.varfiles = config.varfiles.map(p => path.resolve(dir, p));
            }
            return config;
        }
    },
    include: {
        group: "General",
        global: true,
        default: [process.cwd()],
        type: "array",
        normalize: true,
        coerce: paths => {
            return paths.map(p => path.resolve(p))
        },
        description: "Specify markdown include directories"
    },
    varfiles: {
        group: "Template",
        global: true,
        default: [],
        type: "array",
        coerce: paths => {
            return paths.map(p => path.resolve(p))
        },
        description: "Specify a JSON, YAML or HCL (including .tfvars) file with variable definitions."
    },
    vars: {
        group: "Template",
        global: true,
        type: "array",
        description: "Specify a variable for handlebars interpolation"
    },
    html: {
        group: "Syntax",
        global: true,
        default: true,
        type: "boolean",
        description: "Enable arbitrary HTML tags in processed markdown"
    },
    nest: {
        group: "Syntax",
        global: true,
        default: true,
        type: "boolean",
        description: "Enable automatic nesting based on extended hr syntax"
    },
    highlight: {
        group: "Syntax",
        global: true,
        default: true,
        type: "boolean",
        description: "Enable highlightjs on code fences"
    },
    plantuml: {
        group: "Syntax",
        global: true,
        default: true,
        type: "boolean",
        description: "Enable plantuml blocks (@startuml...@enduml)"
    },
    pretty: {
        group: "Output",
        global: true,
        default: true,
        type: "boolean",
        description: "Output pretty HTML"
    }
};
