"use strict";

const debug = require("debug")("mdtk/utils");

/**
 * Reads all bytes from the specified path as a String.
 * If path is "-", read from stdin.
 *
 * @param {String} path         a file path, or "-"
 * @param {String} encoding     a file encoding, defaults to "utf-8"
 * @returns {String}            the file contents as a String
 */
exports.slurp = async function slurp(path, encoding) {
    debug("slurp", path);
    const fs = require("fs");
    return new Promise((resolve, reject) => {
        var stream = null,
            data = "";
        if (path === "-") {
            stream = process.stdin;
        } else {
            stream = fs.createReadStream(path);
        }
        stream.setEncoding(encoding || "utf8");
        var data = "";
        stream.on("data", chunk => data += chunk);
        stream.on("end", () => resolve(data));
        stream.on("error", error => reject(error));
    });
};

/**
 * Searches for `rel`, relative to each path in `search` and
 * returns the first absolut path if it is found.
 *
 * If `rel` is absolute, it is returned immediately.
 *
 * @param {String}      rel     A relative path
 * @param {Array}       search  Any number of directory paths
 * @returns {String}            The first absolute path found
 */
exports.resolve = function resolve(rel, ...search) {
    const path = require("path");
    const fs = require("fs");
    if (path.isAbsolute(rel)) {
        return p;
    }
    for (let i = 0; i < search.length; i++) {
        let abs = path.resolve(search[i], rel);
        if (fs.existsSync(abs)) {
            return abs;
        }
    }
    return null;
};

/**
 * Parse a variety of configuration file formats into an Object.
 * 
 * Supports:
 * - JSON
 * - YAML
 * - HCL
 *
 * The parser is selected based on the file extension:
 * 
 * - .json : JSON
 * - .yaml, .yml : YAML
 * - .hcl, .tfvars : HCL
 *
 * @param {String}      f
 * @returns {Object}        
 */
exports.parseAny = function parseAny(f) {
    const path = require("path");

    var parse = null;
    var extname = path.extname(f);
    switch (extname) {
        case ".hcl":
        case ".tfvars":
            parse = require("hcl-to-json");
            break;
        case ".json":
            parse = JSON.parse;
            break;
        case ".yaml":
        case ".yml":
            parse = require("node-yaml").parse;
            break;
        default:
            throw new Error(`${f} has an unsupported extension. Expected one of .hcl, .tfvars, .json, .yaml, .yml`);
    }
    var bytes = require("fs").readFileSync(f, "utf8");
    return parse(bytes);
};