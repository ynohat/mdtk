"use strict";

const debug = require("debug")("mdtk");
const path = require("path");
const DependencyManager = require("./dependencyManager");
const Packager = require("./packager");
const { slurp } = require("./utils");
const { fstat } = require("fs");

class MDTK {
    constructor(options, dependencyManager = null) {
        debug("constructor", options);
        options = Object.assign({}, {
            input: "-",
            output: "-",
            include: ["."],
            nest: true,
            containers: true,
            vega: true,
            plantuml: true,
            pretty: true,
            vars: {}
        }, options);

        this.options = options;
        if (this.options.input === "-") {
            this.options.include.unshift(process.cwd());
        } else {
            this.options.input = path.resolve(this.options.input);
            let inputDir = path.dirname(this.options.input);
            this.options.include.unshift(inputDir);
        }

        this.options.include = this.options.include.map(p => require("path").resolve(p));

        this.dependencyManager = dependencyManager || new DependencyManager();
        this.packager = new Packager(this);

        this.parser = require("./parser")(this);
        this.renderer = this.parser.renderer;
    }

    get dependencies() {
        return this.dependencyManager.deps;
    }

    resolve(relPath) {
        let { resolve } = require("./utils");
        return resolve(relPath, ...this.options.include);
    }

    async tokenize() {
        debug("tokenize", this.options.input);
        let tokens = await tokenizeFragment.call(this);
        debug("tokenize/postprocess", this.options.input);
        tokens = await require("./postprocessor")(this, tokens);
        return tokens;
    }

    async render(tokens) {
        debug("render", this.options.input);
        await Promise.all(tokens.map(token => token.promise));
        var html = this.renderer.render(tokens, this.parser.options, {});
        if (this.options.pretty) {
            debug("render/prettifyHtml", this.options.input);
            html = require("html").prettyPrint(html) + "\n";
        }
        return html;
    }

    async package(html) {
        debug("package", this.options.input);
        await this.packager.write(html);
    }

    getPackagers() {
        return this.packager.list();
    }
}

module.exports = MDTK;

function child(fragPath) {
    let options = JSON.parse(JSON.stringify(this.options));
    options.input = fragPath;
    return new MDTK(options, this.dependencyManager);
}

async function tokenizeFragment() {
    let src = await slurp(this.options.input);
    let tokens = this.parser.parse(src, {
        src: this.options.input
    });
    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        if (token.type === "mdtk-include") {
            try {
                let fragPath = this.resolve(token.args[0]);
                debug("creating child tokenizer", fragPath, "included by", this.options.input);
                let fragMDTK = child.call(this, fragPath);
                let fragTokens = await tokenizeFragment.call(fragMDTK);
                tokens.splice(i, 1, ...fragTokens);
            } catch (error) {
                debug(error);
                throw new Error(`failed to include ${token.args[0]} from ${this.options.input}:${token.map[0]+1}`);
            }
        } else if (token.type === "mdtk-code") {
            try {
                let codePath = this.resolve(token.args[0]);
                let codeSrc = require("fs").readFileSync(codePath, "utf8");
                let lang = token.args[1];
                token.type = "fence";
                token.content = codeSrc;
                token.info = lang;
            } catch (error) {
                debug(error);
                throw new Error(`failed to include @code ${token.args[0]} from ${this.options.input}:${token.map[0]+1}`);
            }
        }
    }
    return tokens;
}

if (require.main === module) {
    (async function () {
        var mdtk = new MDTK({
            input: "./example/presentation.md",
            vars: {
                frag: "presentation.md",
                presenter: {
                    name: "Anthony",
                    company: "Akamai"
                }
            }
        });
        var tokens = await mdtk.tokenize();
        tokens.forEach(token => {
            console.log(token.type, token.tag, token.attrs, JSON.stringify(token.content || token.markup));
        });

        console.log("");
        console.log(await mdtk.render(tokens));
    })()
}
