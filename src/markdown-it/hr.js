"use strict";

const debug = require("debug")("mdtk/markdown-it/hr");

/**
 * Extend default markdown hr syntax to support nesting.
 *
 * These extensions provide little value unless used with the
 * nest plugin.
 *
 * ---, ***, ___ : default hr
 * ===, ||| : extended hr
 * 
 * @param {*} md 
 * @param {*} options
 */
module.exports = function hr(md, options) {
    debug("init");

    md.block.ruler.disable("hr");
    md.block.ruler.before("table", "mdtk_hr", mdtk_hr);
};

function mdtk_hr(state, startLine, endLine, silent) {
    var marker, cnt, ch, token,
        pos = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine];

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

    marker = state.src.charCodeAt(pos++);

    // Check hr marker
    if (marker !== 0x2A /* * */ &&
        marker !== 0x2D /* - */ &&
        marker !== 0x3D /* = */ &&
        marker !== 0x5F /* _ */ &&
        marker !== 0x7c /* | */ ) {
        return false;
    }

    // markers can be mixed with spaces, but there should be at least 3 of them

    cnt = 1;
    while (pos < max) {
        ch = state.src.charCodeAt(pos++);
        if (ch === marker) { cnt++; }
    }

    if (cnt < 3) { return false; }

    if (silent) { return true; }

    state.line = startLine + 1;

    token = state.push('mdtk-hr', 'hr', 0);
    token.map = [startLine, state.line];
    token.markup = Array(cnt + 1).join(String.fromCharCode(marker));

    switch (marker) {
        case 0x2A:
            token.attrJoin("class", "stars");
            break;
        case 0x2D:
            token.attrJoin("class", "hyphens");
            break;
        case 0x3D:
            token.attrJoin("class", "equals");
            break;
        case 0x5F:
            token.attrJoin("class", "underscores");
            break;
        case 0x7c:
            token.attrJoin("class", "pipes");
            break;
    }

    return true;

}

function isSpace(code) {
    switch (code) {
        case 0x09:
        case 0x20:
            return true;
    }
    return false;
}