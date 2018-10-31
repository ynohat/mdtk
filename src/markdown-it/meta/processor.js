"use strict";

const debug = require("debug")("mdtk/markdown-it/meta/processor");

class MetadataProcessor {
    constructor(state, input, deps) {
        this.state = state;
        this.file = input;
        this.deps = deps;
    }

    walk() {
        this.state.tokens.forEach((token, idx) => {
            this.process(token, idx);
            if (Array.isArray(token.children)) {
                token.children.forEach((token, idx) => this.process(token, idx));
            }
        });
    }

    process(token, idx) {
        token.file = this.file;

        if (token.type === "mdtk-meta") {
            let handler = token.attrGet("handler");
            let args = token.attrGet("args");
            if (this[handler] && this[handler].call) {
                this[handler](token, idx, ...args)
            }
        }
    }

    setfile(token, idx, v) {
        debug("setfile", v);
        this.file = v;
    }

    meta(token, idx, name, content) {
        debug("meta", name, content);
        token.type = "meta";
        token.tag = "meta";
        token.nesting = 0;
        token.attrs = [];
        token.attrSet("name", name);
        token.attrSet("content", content);
        token.hidden = false;
    }

    css(token, idx, href, media) {
        debug("css", href, media);
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

    js(token, idx, src) {
        debug("js", src);
        token.type = "script_open";
        token.tag = "script";
        token.nesting = 1;
        token.attrs = [];
        token.attrSet("src", src);
        token.hidden = false;
        var closing = new this.state.Token("script_close", "script", -1);
        this.state.tokens.splice(idx, 1, token, closing);
    }

    section(token, idx, k, v) {
        debug("section", k, v);
        var sectionOpenToken = null;
        for (let j = idx-1; j>0; j--) {
            let t = this.state.tokens[j];
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

module.exports = MetadataProcessor;