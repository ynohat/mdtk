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
    md.core.ruler.push("mdtk_section_nest", mdtk_nest);
};

function mdtk_nest(state) {
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
        tokens.push(new state.Token(tree.name, "section", 1));
        tree.children.forEach(child => {
            if (typeof child === "object") {
                tokens.push(...flatten(child));
            } else {
                tokens.push(state.tokens[child]);
            }
        });
        tokens.push(new state.Token(tree.name, "section", -1));
        return tokens;
    }
    state.tokens = flatten(tree.root);
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
        let branch = {name: name, children: []};
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
