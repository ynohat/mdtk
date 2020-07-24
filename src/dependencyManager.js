"use strict";

const {nativeToPosix} = require("./utils");

class DependencyManager {
    constructor() {
        this._deps = [];
    }

    get deps() {
        return this._deps;
    }

    /**
     * On POSIX systems:
     * 
     * ```
     * const mylib = depend.root("/abs/path/to/somelib", "somelib");
     * mylib("some/script.js");
     * ```
     * 
     * yields:
     * 
     * ```
     * {
     *  src: "/abs/path/to/somelib/some/script.js",
     *  dest: "somelib/some/script.js",
     *  href: "somelib/some/script.js"
     * }
     * ```
     * 
     * On Windows:
     * 
     * ```
     * const mylib = depend.root("C:\\abs\\path\\to\\somelib", "somelib");
     * mylib("some/script.js"); // note that assets should always be referenced using POSIX in markdown
     * ```
     * 
     * yields:
     * 
     * ```
     * {
     *  src: "C:\\abs\\path\\to\\somelib\\some\\script.js",
     *  dest: "somelib\\some\\script.js",
     *  href: "somelib/some/script.js"
     * }
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
            dep.dest = path.join(prefix, relPath);
            dep.href = path.posix.join(nativeToPosix(prefix), nativeToPosix(relPath));
            this._deps.push(dep);
            return dep;
        };
    }
}

module.exports = DependencyManager;
