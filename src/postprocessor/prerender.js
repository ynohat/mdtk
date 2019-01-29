"use strict";

module.exports = async function (mdtk, tokens) {
    for (let i = 0, len = tokens.length; i < len; i++) {
        let token = tokens[i];
        if (token.prerender) {
            await token.prerender();
        }

        if (Array.isArray(token.children)) {
            for (let j = 0, clen = token.children.length; j < clen; j++) {
                let child = token.children[j];
                if (child.prerender) {
                    await child.prerender();
                }
            }
        }
    }
    return tokens;
};