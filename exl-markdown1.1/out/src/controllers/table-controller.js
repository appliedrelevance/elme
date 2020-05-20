"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const extension_1 = require("../extension");
const common_1 = require("../helper/common");
const markdown_table_1 = require("../helper/markdown-table");
const utility_1 = require("../helper/utility");
const telemetryCommand = "insertTable";
let commandOption;
function insertTableCommand() {
    return [
        { command: consolidateTable.name, callback: consolidateTable },
        { command: distributeTable.name, callback: distributeTable },
        { command: insertTable.name, callback: insertTable },
    ];
}
exports.insertTableCommand = insertTableCommand;
function consolidateTable() {
    return __awaiter(this, void 0, void 0, function* () {
        yield reformatTable(markdown_table_1.FormatOptions.Consolidate);
    });
}
exports.consolidateTable = consolidateTable;
function distributeTable() {
    return __awaiter(this, void 0, void 0, function* () {
        yield reformatTable(markdown_table_1.FormatOptions.Distribute);
    });
}
exports.distributeTable = distributeTable;
function reformatTable(formatOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            common_1.noActiveEditorMessage();
            return;
        }
        const selection = editor.selection;
        if (!selection) {
            common_1.postWarning("You must select a markdown table first.");
            return;
        }
        const table = markdown_table_1.MarkdownTable.parse(selection, editor.document);
        if (table) {
            yield table.reformat(editor, formatOptions);
        }
    });
}
function insertTable() {
    let logTableMessage;
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    if (!common_1.isValidEditor(editor, false, insertTable.name)) {
        return;
    }
    if (!common_1.isMarkdownFileCheck(editor, false)) {
        return;
    }
    const tableInput = vscode.window.showInputBox({ prompt: "Input the number of columns and rows as C:R" });
    // gets the users input on number of columns and rows
    tableInput.then((val) => {
        if (!val) {
            return;
        }
        else {
            const size = val.split(":");
            /// check valid value and exceed 4*4
            if (utility_1.validateTableRowAndColumnCount(size.length, size[0], size[1])) {
                const col = Number.parseInt(size[0]);
                const row = Number.parseInt(size[1]);
                const str = utility_1.tableBuilder(col, row);
                common_1.insertContentToEditor(editor, insertTable.name, str);
                logTableMessage = col + ":" + row;
            }
            else {
                extension_1.output.appendLine("Table insert failed.");
            }
            commandOption = logTableMessage;
            common_1.sendTelemetryData(telemetryCommand, commandOption);
        }
    });
}
exports.insertTable = insertTable;
//# sourceMappingURL=table-controller.js.map