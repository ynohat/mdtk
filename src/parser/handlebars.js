"use strict";

const Handlebars = require("handlebars");
const helpers = require("handlebars-helpers")({
    handlebars: Handlebars
});
const debug = require("debug")("mdtk/parser/handlebars");

/**
 */
module.exports = function handlebars(md, options) {
    debug("init");

    Handlebars.registerHelper("json", JSON.stringify);

    md.core.ruler.before("normalize", "mdtk-handlebars", function mdtk_handlebars(state) {
        state.src = Handlebars.compile(state.src).call(null, options && options.vars || {});
    });
};
