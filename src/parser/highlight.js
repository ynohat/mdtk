"use strict";

const hljs = require("highlight.js");

module.exports = function highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
        try {
            return hljs.highlight(lang, str).value;
        } catch (__) {}
    }
    return ''; // use external default escaping
};
