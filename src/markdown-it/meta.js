"use strict";

const path = require("path");
const debug = require("debug")("mdtk/markdown-it/meta");

/**
 * Support syntax for allowing interaction with the processor
 * from within the document:
 * 
 * ```html
 * @include(a/b/c.md)
 * @setfile(path/to/current/fragment.md)
 * @css(path/to/stylesheet.css, print|screen|...)
 * ```
 */
module.exports = function meta(md, options) {
    debug("init");

    md.core.ruler.before("mdtk-handlebars", "mdtk_include", function mdtk_include(state) {
        var { search } = options || {};
        search = search || [process.cwd()];
    
        const Includer = require("./meta/includer");
        const includer = new Includer();
        state.src = includer.process({
            src: state.src,
            path: options.input === "-" ? path.join(process.cwd(), "-") : options.input,
            mimeType: "text/markdown",
            includePattern: /(?<!\\)@include\(([^)]+)\)/mg,
            search: search
        });
        return true;
    });

    md.block.ruler.before("table", "mdtk_meta_create", mdtk_meta_create);

    md.core.ruler.push("mdtk_meta_process", function mdtk_meta_process(state) {
        const MetadataProcessor = require("./meta/processor");
        const processor = new MetadataProcessor(state, options.input, options.deps);
        processor.walk();
        return true;
    });

    md.core.ruler.after("mdtk_meta_process", "mdtk_resolve", function mdtk_resolve(state) {
        var outputDir = process.cwd();
        if (options.output && options.output !== "-") {
            outputDir = path.dirname(options.output);
        }

        const Resolver = require("./meta/resolver");
        const resolver = new Resolver(outputDir, options.search, options.deps);
        resolver.walk(state);
    });
};

function mdtk_meta_create(state, startLine, endLine, silent) {
    const META_EXPR = /(?<!\\)@(([a-z][a-z_\.-]*)\((.*)\))/i;

    var marker, token,
        pos = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine];

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

    marker = state.src.substring(pos, max);

    if (!META_EXPR.test(marker)) {
        return false;
    }

    if (silent) { return true; }

    state.line = startLine + 1;

    var match = marker.match(META_EXPR);

    token = state.push('mdtk-meta', '', 0);
    token.attrSet("handler", match[2]);
    token.attrSet("args", match[3].split(",").map(s => s.trim()));
    token.map = [startLine, state.line];
    token.markup = marker;
    token.hidden = true;

    return true;
}
