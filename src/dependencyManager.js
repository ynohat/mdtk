"use strict";

class DependencyManager {
    constructor() {
        this._deps = [];
    }

    get deps() {
        return this._deps;
    }

    /**
     * ```
     * const mylib = depend.root("/abs/path/to/somelib", "somelib");
     * mylib("some/script.js"); // somelib/some/script.js
     * ```
     * 
     * @param {*} path 
     * @param {*} prefix 
     */
    root(dir, prefix) {
        const path = require("path");
        return relPath => {
            var dep = {};
            dep.src = path.join(dir, relPath);
            dep.ref = path.join(prefix, relPath);
            this._deps.push(dep);
            return dep.ref;
        };
    }
}

module.exports = DependencyManager;