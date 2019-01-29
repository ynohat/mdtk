"use strict";

const debug = require("debug")("mdtk/markdown-it/postprocess");

module.exports = async function postprocess(mdtk, tokens) {
    debug("start");

    if (mdtk.options.nest) {
        tokens = await require("./nest")(mdtk, tokens);
    }

    tokens = await require("./transform")(mdtk, tokens);

    tokens = await require("./resolve")(mdtk, tokens);

    tokens = await require("./prerender")(mdtk, tokens);

    debug("done");

    return tokens;
};
