"use strict";

const debug = require("debug")("mdtk/markdown-it/postprocessor/transform");

module.exports = function (mdtk, tokens) {
    debug("start");
    const transformer = new Transformer(mdtk, tokens);
    for (let i = 0, len = tokens.length; i < len; i++) {
        let token = tokens[i];
        transformer.transform(token, i);
    }
    return tokens;
};

class Transformer {
    constructor(mdtk, tokens) {
        this.mdtk = mdtk;
        this.tokens = tokens;
        this.handlers = {};
        this.registerHandler("mdtk-meta", this.atrulemMeta);
        this.registerHandler("mdtk-css", this.atruleCss);
        this.registerHandler("mdtk-js", this.atruleJs);
        this.registerHandler("mdtk-section", this.atruleSection);
    }

    registerHandler(tokenType, handler) {
        debug("registerHandler", tokenType, handler);
        this.handlers[tokenType] = handler.bind(this);
    }

    // @deprecated
    get deps() {
        return this.mdtk.dependencyManager;
    }

    transform(token, idx) {
        debug(token, ...arguments);
        const handler = this.handlers[token.type];
        if (handler) {
            handler(token, idx, ...token.args);
        }
    }

    atrulemMeta(token, idx, name, content) {
        debug(token.type, ...arguments);
        token.type = "meta";
        token.tag = "meta";
        token.nesting = 0;
        token.attrs = [];
        token.attrSet("name", name);
        token.attrSet("content", content);
        token.hidden = false;
    }

    atruleCss(token, idx, href, media) {
        debug(token.type, ...arguments);
        token.type = "css";
        token.tag = "link";
        token.nesting = 0;
        token.attrs = [];
        token.attrSet("rel", "stylesheet");
        token.attrSet("href", href);
        if (media) {
            token.attrSet("media", media);
        }
        token.hidden = false;
    }

    atruleJs(token, idx, src) {
        debug(token.type, ...arguments);
        token.type = "script_open";
        token.tag = "script";
        token.nesting = 1;
        token.attrs = [];
        token.attrSet("src", src);
        token.hidden = false;
        var closing = new this.state.Token("script_close", "script", -1);
        this.tokens.splice(idx, 1, token, closing);
    }

    atruleSection(token, idx, k, v) {
        debug(token.type, ...arguments);
        var sectionOpenToken = null;
        for (let j = idx-1; j>0; j--) {
            let t = this.tokens[j];
            if (t.tag === "section" && t.nesting === 1) {
                sectionOpenToken = t;
                break;
            }
        }
        if (sectionOpenToken) {
            sectionOpenToken.attrSet(k, v);
        }
    }
}