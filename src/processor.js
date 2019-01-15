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
        linkify: true,
        typographer: true,
        highlight: function(str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(lang, str).value;
                } catch (__) {}
            }
            return ''; // use external default escaping
        }
    });

    parser.use(require("markdown-it-attrs"));

    if (options.plantuml) {
        parser.use(require("markdown-it-plantuml"));
    }
    if (options.vega) {
        parser.use(require("./markdown-it/vega"));
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

    parser.render = async (md, env) => {
        env = env || {};
        var tokens = parser.parse.call(parser, md, env);
        await Promise.all(tokens.map(token => token.promise));
        var html = parser.renderer.render(tokens, parser.options, env);
        if (options.pretty) {
            html = require("html").prettyPrint(html) + "\n";
        }
        return html;
    };

    return parser;
}

module.exports = processor;
