"use strict";

const debug = require("debug")("mdtk/parser/srcmap");

module.exports = function srcmap(md) {
    debug("init");

    md.core.ruler.push("mdtk-srcmap", function (state) {
        state.tokens.forEach(token => {
            token.src = state.env.src;
            if (token.nesting >= 0) { // not for closing tags
                token.attrSet("data-src-path", token.src);
                if (Array.isArray(token.map)) {
                    token.attrSet("data-src-line", token.map[0] + 1);
                }
            }
            if (Array.isArray(token.children)) {
                token.children.forEach(token => {
                    token.src = state.env.src;
                });
            }
        });
    });
};
