"use strict";

const fs = require("fs");
const path = require("path");
const debug = require("debug")("mdtk/markdown-it/meta/includer");
const mime = require("mime-types");
const {resolve} = require("../../utils");

class Includer {
    constructor() {
        this.includeStack = new Stack();
    }

    process(input) {
        debug("process %s (%s)", input.path, input.mimeType);

        this.includeStack.push(input.path);

        input.transformed = input.src.replace(input.includePattern, (match, relPath) => {
            relPath = relPath.trim();
            let absPath = resolve(
                relPath,
                path.dirname(this.includeStack.top),
                ...input.search
            );
            debug("resolved [%s] -> [%s]", relPath, absPath);
            if (!absPath) {
                return match;
            }
            return this.process({
                src: fs.readFileSync(absPath, "utf8"),
                path: absPath,
                mimeType: mime.lookup(absPath),
                includePattern: input.includePattern,
                search: input.search
            });
        });

        this.includeStack.pop();

        return this.wrap(input);
    }

    wrap(input) {
        var wrapped = "";
        wrapped += `\n@setfile(${input.path})\n`;
        wrapped += `\n${input.transformed}\n`;
        if (this.includeStack.length) {
            wrapped += `\n@setfile(${this.includeStack.top})\n`;
        }
        return wrapped;
    }
}

module.exports = Includer;

class Stack extends Array {
    get top() {
        return this[this.length-1];
    }
}