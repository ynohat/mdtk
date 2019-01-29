"use strict";

const debug = require("debug")("mdtk/parser/containers");

/**
 * Markdown-it extension that defines semantics for nestable div containers.
 * 
 * @param {*} md 
 * @param {*} options
 */
module.exports = function nest(md, options) {
    debug("init");

    md.block.ruler.disable("hr");
    md.block.ruler.before("fence", "mdtk_containers", mdtk_containers);
};

function mdtk_containers(state, startLine, endLine, silent) {
    var marker, len, params, nextLine, mem, token, markup,
        haveEndMarker = false,
        pos = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine];

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

    if (pos + 3 > max) { return false; }

    var marker = state.src.charCodeAt(pos);

    if (marker === 0x2b /* + */ || marker === 0x2d /* - */) {
        let cls = "";
        let params = state.src.substring(pos + 1, max).split(/\s+/).shift();
        let nesting = 1;
        if (marker === 0x2d) {
            nesting = -1;
        }
        if (!params.length) {
            return false;
        }
        if (params === "notes") {
            let token = state.push("aside", "aside", nesting);
            token.attrJoin("class", "notes");
        }
        else {
            let token = state.push("div", "div", nesting);
            if (nesting === 1) {
                params.split(".")
                    .filter(cls => !!cls).forEach(cls => {
                        token.attrJoin("class", cls);
                    });
            }
        }
        state.line++;
        return true;
    }
}
