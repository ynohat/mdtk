// Process block-level vega and vega-lite visualizations
// Kudos to markdown-it-startuml that served as the template
//
'use strict';

const debug = require("debug")("mdtk/markdown-it/vega");

module.exports = function vega(md, options) {

    debug("add");

    md.block.ruler.before(
        'fence',
        'vega_lite_vis',
        vegaLikePlugin(
            md,
            {
                openMarker: "@startvegalite",
                closeMarker: "@endvegalite",
                className: "mdtk-vega-lite",
                render: renderVegaLite
            }
        ),
        { alt: ['paragraph', 'reference', 'blockquote', 'list', 'vega_lite_vis', 'vega_vis']}
    );

    md.block.ruler.after(
        'vega_lite_vis',
        'vega_vis',
        vegaLikePlugin(
            md,
            {
                openMarker: "@startvega",
                closeMarker: "@endvega",
                className: "mdtk-vega",
                render: renderVega
            }
        ),
        { alt: ['paragraph', 'reference', 'blockquote', 'list', 'vega_lite_vis', 'vega_vis']}
    );

    // md.renderer.rules.vega_vis = render;
};

// FIXME
// Because the vega/vega-lite spec can reference external data,
// we need to be able to resolve it so that it is added to the
// output assets.
// For all other tokens until Vega, the `meta/resolver` owned the
// logic, which made sense because it was handling standard markdown
// or HTML features.
// Here it feels like it makes more sense to keep the spec parsing
// logic local to the vega module, so the vega block parser simply
// adds a resolve function to the token, which gets called at the
// very end by meta/resolver.
// This is quite hacky, we certainly need a better approach.
function resolve(token, resolver) {
    if (token.spec) {
        var signals = {};
        function walk(spec) {
            Object.keys(spec)
                .forEach(k => {
                    let v = spec[k];
                    if (k === "signals") {
                        v.forEach(signal => {
                            signals[signal.name] = signal;
                        });
                    } else if (k === "url") {
                        if (typeof v === "object") {
                            if (v.signal && signals[v.signal]) {
                                let signal = signals[v.signal];
                                if (signal.value) {
                                    spec.url = signal.value;
                                }
                            }
                        }
                        spec.url = resolver.normalize(token.file, spec.url);
                    } else if (v && typeof v === "object") {
                        walk(v);
                    }
                });
        }
        walk(token.spec);
    }

    // Now that we've normalized all the data urls, we can
    // start the actual render process.
    // We store the promise on the token directly, this gets
    // picked up between parse and render in ../processor
    token.promise = token.render(token.spec)
        .then(svg => {
            token.content = svg;
        });
}

async function renderVega(spec) {
    debug("vega spec %O", spec);
    const vega = require("vega");
    const view = new vega.View(vega.parse(spec));
    return view.toSVG();
}

async function renderVegaLite(spec) {
    debug("vega-lite spec %O", spec);
    const vegaLite = require("vega-lite");
    return renderVega(vegaLite.compile(spec).spec);
}


function vegaLikePlugin(md, options) {
    var {
        openMarker,
        closeMarker,
        render,
        className
    } = options;

    var openChar = openMarker.charCodeAt(0);
    var closeChar = closeMarker.charCodeAt(0);

    return function(state, startLine, endLine, silent) {
        var nextLine, markup, params, token, i,
            autoClosed = false,
            start = state.bMarks[startLine] + state.tShift[startLine],
            max = state.eMarks[startLine];

        // Check out the first character quickly,
        // this should filter out most of non-uml blocks
        //
        if (openChar !== state.src.charCodeAt(start)) { return false; }

        // Check out the rest of the marker string
        //
        for (i = 0; i < openMarker.length; ++i) {
            if (openMarker[i] !== state.src[start + i]) { return false; }
        }

        markup = state.src.slice(start, start + i);
        params = state.src.slice(start + i, max);

        // Since start is found, we can report success here in validation mode
        //
        if (silent) { return true; }

        // Search for the end of the block
        //
        nextLine = startLine;

        for (;;) {
            nextLine++;
            if (nextLine >= endLine) {
                // unclosed block should be autoclosed by end of document.
                // also block seems to be autoclosed by end of parent
                break;
            }

            start = state.bMarks[nextLine] + state.tShift[nextLine];
            max = state.eMarks[nextLine];

            if (start < max && state.sCount[nextLine] < state.blkIndent) {
                // non-empty line with negative indent should stop the list:
                // - ```
                //  test
                break;
            }

            if (closeChar !== state.src.charCodeAt(start)) {
                // didn't find the closing fence
                continue;
            }

            if (state.sCount[nextLine] > state.sCount[startLine]) {
                // closing fence should not be indented with respect of opening fence
                continue;
            }

            var closeMarkerMatched = true;
            for (i = 0; i < closeMarker.length; ++i) {
                if (closeMarker[i] !== state.src[start + i]) {
                    closeMarkerMatched = false;
                    break;
                }
            }

            if (!closeMarkerMatched) {
                continue;
            }

            // make sure tail has spaces only
            if (state.skipSpaces(start + i) < max) {
                continue;
            }

            // found!
            autoClosed = true;
            break;
        }

        var contents = state.src
            .split('\n')
            .slice(startLine + 1, nextLine)
            .join('\n');

        token = state.push('html_block', '', 0);
        token.attrSet("class", className);
        token.block = true;
        token.spec = JSON.parse(contents);
        token.info = params;
        token.map = [startLine, nextLine];
        token.markup = markup;

        token.render = render;
        token.resolve = resolve;

        state.line = nextLine + (autoClosed ? 1 : 0);

        return true;
    }
};