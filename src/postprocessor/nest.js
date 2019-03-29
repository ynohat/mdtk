"use strict";

const Token = require("markdown-it/lib/token");

function nest(mdtk, tokens) {
    var tree = new Tree();

    tree.push("root");
    tokens.forEach(function(token, idx) {
        if (token.type === "mdtk-hr") {
            const nesting = token.nestingLevel;
            while (tree.depth < nesting) {
                tree.nest(`level${tree.depth}`, token.src, token.map[1]);
            }
            while (tree.depth >= nesting) {
                tree.pop();
            }
            tree.push(`level${tree.depth}`, token.src, token.map[1])
        } else {
            tree.append(idx);
        }
    });

    return flatten(tree.root, tokens);
}

module.exports = nest;

/**
 * Rebuild the token list based on the tree.
 *
 * @param {*} branch 
 * @param {*} tokens 
 */
function flatten(branch, tokens) {
    let result = [];
    var openTag, closeTag;
    // don't create a root section
    if (branch.depth > 0) {
        openTag = new Token("section_open", "section", 1);
        openTag.attrSet("data-src-path", branch.src);
        openTag.attrSet("data-src-line", branch.line);
        openTag.src = branch.src;
        result.push(openTag);
    }
    branch.children.forEach(child => {
        if (typeof child === "object") {
            result.push(...flatten(child, tokens));
        } else {
            result.push(tokens[child]);
        }
    });
    if (branch.depth > 0) {
        closeTag = new Token("section_close", "section", -1);
        result.push(closeTag);
    }
    return result;
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

    push(name, src, line) {
        let branch = { name: name, src: src, line: line, children: [], depth: this.depth };
        if (this.depth) {
            this.top.children.push(branch);
        }
        this.stack.push(branch);
    }

    pop() {
        return this.stack.pop();
    }

    // (LX: [1, 2, 3]) => (LX: [LY: [1, 2, 3]])
    nest(name, src, line) {
        let children = this.getChildren();
        this.clearChildren();
        this.push(name, src, line);
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
