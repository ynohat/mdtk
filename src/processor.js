"use strict";

const debug = require("debug")("mdtk");
const hljs = require("highlight.js");

const DEFAULTS = {
    config: null,
    html: true,
    nest: true,
    plantuml: true,
    pretty: true,
    include: [process.cwd()],
    varfiles: [],
    vars: {}
};

function processor(options, deps) {
    // Assign and override default options
    options = Object.assign({}, DEFAULTS, options);

    // Initialize the Markdown parser
    const parser = require("markdown-it")({
        html: true,
        highlight: function(str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(lang, str).value;
                } catch (__) {}
            }
            return ''; // use external default escaping
        }
    });

    parser.use(require("markdown-it-div"));
    parser.use(require("markdown-it-attrs"));
    if (options.plantuml) {
        parser.use(require("markdown-it-plantuml"));
    }

    parser.use(require("./markdown-it/handlebars"), {
        vars: options.vars,
        output: options.output,
        include: options.include
    });

    parser.use(require("./markdown-it/hr"));
    if (options.nest) {
        parser.use(require("./markdown-it/nest"));
    }

    parser.use(require("./markdown-it/meta"), {
        search: options.include,
        input: options.input,
        output: options.output,
        deps: deps
    });

    if (options.pretty) {
        let _render = parser.render;
        parser.render = (...args) => {
            var html = _render.call(parser, ...args);
            return require("html").prettyPrint(html) + "\n";
        }
    }

    return parser;
}

module.exports = processor;
