"use strict";

const debug = require("debug")("mdtk/markdown-it/nest");

const NESTING = {
    // standard HR notation
    "---": 2,
    "***": 2,
    "___": 2,
    // extensions
    "===": 3,
    "|||": 4
}

/**
 * Defines simple nesting semantics using variations on the hr rule.
 *
 * --- : main section separator
 * === : subsection separator
 * 
 * @param {*} md 
 * @param {*} options
 */
module.exports = function nest(md, options) {
    debug("init");

    md.block.ruler.disable("hr");
    md.block.ruler.before("fence", "mdtk_nest_explicit", mdtk_nest_explicit);
    md.core.ruler.push("mdtk_nest_hr", mdtk_nest_hr);
};

function mdtk_nest_hr(state) {
    var tree = new Tree();

    tree.push("section.l1");
    state.tokens.forEach(function(token, idx) {
        if (token.type === "mdtk-hr") {
            const nesting = NESTING[token.markup];
            while (tree.depth < nesting) {
                tree.nest(`level${tree.depth}`);
            }
            while (tree.depth >= nesting) {
                tree.pop();
            }
            tree.push(`level${tree.depth}`)
        } else {
            tree.append(idx);
        }
    });

    function flatten(tree) {
        let tokens = [];
        // HACK :
        //  revealjs requires the top-level container to be anything but a section,
        //  because Reveal.isVerticalSlide tests the parent of the current slide's
        //  nodeName. If it is section, then we are in vertical slide context.
        //  If the top-level container is a section, then isVerticalSlide always
        //  returns true, and some tests (including Reveal.isLastSlide) return a
        //  wrong value. This results in an infinite loop when using Decktape.
        //  More info: https://github.com/astefanutti/decktape/issues/137
        let nodeName = (tree.depth === 0) ? "div" : "section";
        tokens.push(new state.Token(tree.name, nodeName, 1));
        tree.children.forEach(child => {
            if (typeof child === "object") {
                tokens.push(...flatten(child));
            } else {
                tokens.push(state.tokens[child]);
            }
        });
        tokens.push(new state.Token(tree.name, nodeName, -1));
        return tokens;
    }
    state.tokens = flatten(tree.root);
}


function mdtk_nest_explicit(state, startLine, endLine, silent) {
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
        let token = state.push("div", "div", nesting);
        if (nesting === 1) {
            params.split(".")
                .filter(cls => !!cls).forEach(cls => {
                    token.attrJoin("class", cls);
                });
        }
        state.line++;
        return true;
    }
}


/**
 * Tree representing the nesting. Each node has a name and children, each of
 * which can be a branch or a leaf. Leaves are integers and refer to a token
 * index in the current state.
 */
class Tree {
    constructor() {
        this.stack = [];
    }

    get root() {
        return this.stack[0];
    }

    get top() {
        return this.stack[this.stack.length - 1];
    }

    get depth() {
        return this.stack.length;
    }

    push(name) {
        let branch = { name: name, children: [], depth: this.depth };
        if (this.depth) {
            this.top.children.push(branch);
        }
        this.stack.push(branch);
    }

    pop() {
        return this.stack.pop();
    }

    // (LX: [1, 2, 3]) => (LX: [LY: [1, 2, 3]])
    nest(name) {
        let children = this.getChildren();
        this.clearChildren();
        this.push(name);
        this.append(...children);
        return this;
    }

    getChildren() {
        return this.top.children;
    }

    clearChildren() {
        this.top.children = [];
        return this;
    }

    append(...children) {
        children.forEach(child => this.top.children.push(child));
        return this;
    }
}