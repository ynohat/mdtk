"use strict";

const peg = require("pegjs");
const debug = require("debug")("mdtk/parser/atrule");

module.exports = function (md, options) {
    debug("init");
    md.block.ruler.before("table", "mdtk-at-rule", mdtk_atrule_parse);
};

const parser = peg.generate(String.raw `
    start "start"
        = at_rule:at_rule .* { return at_rule; }

    at_rule "at_rule"
        = "@" name:keyword "(" ws* args:arglist? ws* ")"
        {
            var loc = location();
            var rule = {};
            rule.name = name;
            rule.args = args || [];
            rule.endOffset = loc.end.offset;
            rule.endLine = loc.end.line;
            return rule;
        }

    keyword "keyword"
        = kw:([a-z] [a-zA-Z_-]*)
        {
            return kw[0] + kw[1].join("");
        }

    arglist "arglist"
        = head:arg tail:arglist_tail*
        {
            return [head].concat(...tail);
        }

    arglist_tail "arglist_tail"
        = "," tail:arglist
        {
            return tail;
        }

    arg "arg"
        = ws* "\"" val:quoted_arg_val* "\"" ws* { return val.join(""); } /
            val:arg_val+ { return val.join("").trim(); } 

    arg_val "arg_val"
        = "\\" char:. { return char; } /
        char:[^,)] { return char; }

    quoted_arg_val "quoted_arg_val"
        = "\\" char:. { return char; } /
            char:[^"] { return char; }

    ws "ws"
        = [ \t\n]
`);

function mdtk_atrule_parse(state, startLine, endLine, silent) {
    var src, token, rule,
        pos = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[endLine];

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

    src = state.src.substring(pos, max);

    try {
        rule = parser.parse(src);
        debug(rule);
    } catch (e) {
        return false;
    }

    if (silent) { return true; }

    state.line = startLine + rule.endLine;

    token = state.push(`mdtk-${rule.name}`, `mdtk-${rule.name}`, 0);
    token.args = rule.args;
    token.map = [startLine, state.line];
    token.content = state.getLines(startLine, state.line, rule.endOffset, true);
    token.hidden = true;
    debug(token);

    return true;
};
