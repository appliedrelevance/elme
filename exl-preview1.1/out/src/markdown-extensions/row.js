"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rowOptions = {
    marker: ":",
    validate(params) {
        return params.trim().match(/row:::/g);
    },
    render(tokens, idx) {
        if (tokens[idx].info.trim().match(/row:::/g)) {
            // opening tag
            return "<div class='row'>";
        }
        else {
            return "";
        }
    },
};
exports.rowEndOptions = {
    marker: ":",
    validate(params) {
        return params.trim().match(/row-end:::/g);
    },
    render(tokens, idx) {
        if (tokens[idx].info.trim().match(/row-end:::/g)) {
            // closing tag
            return "</div>";
        }
        else {
            return "";
        }
    },
};
//# sourceMappingURL=row.js.map