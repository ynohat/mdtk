"use strict";

const Handlebars = require("handlebars");
const debug = require("debug")("mdtk/markdown-it/handlebars");

/**
 */
module.exports = function handlebars(md, options) {
    debug("init");

    Handlebars.registerHelper("json", JSON.stringify);
    Handlebars.registerHelper("resolve", function (relPath) {
        debug("resolve", relPath);
        const path = require("path");
        var {resolve} = require("../utils");
        var absPath = resolve(relPath, ...options.include);
        return require("path").relative(path.dirname(options.output), absPath);
    });

    md.core.ruler.before("normalize", "mdtk-handlebars", function mdtk_handlebars(state) {
        state.src = Handlebars.compile(state.src).call(null, options && options.vars || {});
    });
};
