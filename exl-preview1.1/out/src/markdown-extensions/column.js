"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extension_1 = require("../extension");
exports.columnOptions = {
    marker: ":",
    validate(params) {
        return params.trim().match(/column(\s+span="([1-9]+)?")?:::/g);
    },
    render(tokens, idx) {
        const RE = /column((\s+)span="([1-9]+)?")?:::/g;
        const start = RE.exec(tokens[idx].info.trim());
        // const start = tokens[idx].info.trim().match(RE);
        if (start) {
            if (start[3]) {
                return `<div class='column span${start[3]}'>`;
            }
            else {
                // opening tag
                return "<div class='column'>";
            }
        }
        else {
            return "";
        }
    },
};
exports.columnEndOptions = {
    marker: ":",
    validate(params) {
        return params.trim().match(/column-end:::/g);
    },
    render(tokens, idx) {
        const RE = /column-end:::/g;
        const end = RE.exec(tokens[idx].info.trim());
        if (end) {
            // closing tag
            return "</div>";
        }
        else {
            return "";
        }
    },
};
// export function column_end(md, options) {
//     const COLUMN_END_RE = /(:::column-end:::)/g;
//     const COLUMN_END_WITH_TEXT_RE = /[ ]{5}[^]+?:::column-end:::/g;
//     const removeCodeblockSpaces = (src: string) => {
//         let captureGroup;
//         let matches = src.match(COLUMN_END_WITH_TEXT_RE);
//         matches.map((element) => {
//             let position = src.indexOf(element);
//             const output = element.replace(COLUMN_END_RE, "\r\n:::column-end:::");
//             src = src.slice(0, position) + output + src.slice(position + element.length, src.length);
//         });
//         //     while ((captureGroup = COLUMN_END_RE.exec(src))) {
//         //     src = src.slice(0, captureGroup.index) + "\r\n:::column-end:::" + src.slice(captureGroup.index + captureGroup[0].length, src.length);
//         // }
//         return src;
//     };
//     const customCodeBlock = (state) => {
//         try {
//             state.src = removeCodeblockSpaces(state.src);
//         } catch (error) {
//             output.appendLine(error);
//         }
//     };
//     md.core.ruler.before("normalize", "custom_codeblock", customCodeBlock);
// }
function column_end(md, options) {
    const COLUMN_RE = /(?!:::column(\s+span="([1-9]+)?")?:::[\s\S])[ ]{5}[^]+?:::column-end:::/g;
    const CODEBLOCK_RE = /[ ]{5}/g;
    const COLUMN_END_RE = /(:::column-end:::)/g;
    const removeCodeblockSpaces = (src) => {
        // let captureGroup;
        let matches = src.match(COLUMN_RE);
        if (matches) {
            matches.map((element) => {
                let position = src.indexOf(element);
                let output = element.replace(CODEBLOCK_RE, "");
                output = output.replace(COLUMN_END_RE, "\r\n:::column-end:::");
                src = src.slice(0, position) + output + src.slice(position + element.length, src.length);
            });
        }
        // while ((captureGroup = COLUMN_RE.exec(src))) {
        //   const output = captureGroup[0].replace(CODEBLOCK_RE, "");
        //   src = src.slice(0, captureGroup.index) + output + src.slice(captureGroup.index + captureGroup[0].length, src.length);
        // }
        return src;
    };
    const customCodeBlock = (state) => {
        try {
            state.src = removeCodeblockSpaces(state.src);
        }
        catch (error) {
            extension_1.output.appendLine(error);
        }
    };
    md.core.ruler.before("normalize", "custom_codeblock", customCodeBlock);
}
exports.column_end = column_end;
//# sourceMappingURL=column.js.map