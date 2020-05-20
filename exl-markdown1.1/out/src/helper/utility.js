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
const vscode_1 = require("vscode");
const common = require("./common");
const highlight_langs_1 = require("./highlight-langs");
const log = require("./log");
/**
 * Checks the user input for table creation.
 * Format - C:R.
 * Columns and Rows cannot be 0 or negative.
 * 4 Columns maximum.
 * @param {number} size - the number of array size after split user input with ':'
 * @param {string} colStr - the string of requested columns
 * @param {string} rowStr - the string of requested rows
 */
function validateTableRowAndColumnCount(size, colStr, rowStr) {
    const tableTextRegex = /^-?\d*$/;
    const col = tableTextRegex.test(colStr) ? Number.parseInt(colStr) : undefined;
    const row = tableTextRegex.test(rowStr) ? Number.parseInt(rowStr) : undefined;
    log.debug("Trying to create a table of: " + col + " columns and " + row + " rows.");
    if (col === undefined || row === undefined) {
        return undefined;
    }
    if (size !== 2 || isNaN(col) || isNaN(row)) {
        const errorMsg = "Please input the number of columns and rows as C:R e.g. 3:4";
        common.postWarning(errorMsg);
        return false;
    }
    else if (col <= 0 || row <= 0) {
        const errorMsg = "The number of rows or columns can't be zero or negative.";
        common.postWarning(errorMsg);
        return false;
    }
    else if (col > 4) {
        const errorMsg = "You can only insert up to four columns via Docs Markdown.";
        common.postWarning(errorMsg);
        return false;
    }
    else if (row > 50) {
        const errorMsg = "You can only insert up to 50 rows via Docs Markdown.";
        common.postWarning(errorMsg);
        return false;
    }
    else {
        return true;
    }
}
exports.validateTableRowAndColumnCount = validateTableRowAndColumnCount;
/**
 * Creates a string that represents a MarkDown table
 * @param {number} col - the number of columns in the table
 * @param {number} row - the number of rows in the table
 */
function tableBuilder(col, row) {
    let str = "\n";
    /// create header
    // DCR update: 893410 [Add leading pipe]
    // tslint:disable-next-line:no-shadowed-variable
    for (let c = 1; c <= col; c++) {
        str += "|" + "Column" + c + "  |";
        // tslint:disable-next-line:no-shadowed-variable
        for (c = 2; c <= col; c++) {
            str += "Column" + c + "  |";
        }
        str += "\n";
    }
    // DCR update: 893410 [Add leading pipe]
    // tslint:disable-next-line:no-shadowed-variable
    for (let c = 1; c <= col; c++) {
        str += "|" + "---------" + "|";
        // tslint:disable-next-line:no-shadowed-variable
        for (c = 2; c <= col; c++) {
            str += "---------" + "|";
        }
        str += "\n";
    }
    /// create each row
    for (let r = 1; r <= row; r++) {
        str += "|" + "Row" + r + "     |";
        for (let c = 2; c <= col; c++) {
            str += "         |";
        }
        str += "\n";
    }
    log.debug("Table created: \r\n" + str);
    return str;
}
exports.tableBuilder = tableBuilder;
/**
 * Finds the files, then lets user pick from match list, if more than 1 match.
 * @param {string} searchTerm - the keyword to search directories for
 * @param {string} fullPath - optional, the folder to start the search under.
 */
function search(editor, selection, folderPath, fullPath, crossReference) {
    return __awaiter(this, void 0, void 0, function* () {
        const dir = require("node-dir");
        const path = require("path");
        let language = "";
        let possibleLanguage = null;
        let selected;
        let activeFilePath;
        let snippetLink = "";
        if (!crossReference) {
            const searchTerm = yield vscode_1.window.showInputBox({ prompt: "Enter snippet search terms." });
            if (!searchTerm) {
                return;
            }
            if (fullPath == null) {
                fullPath = folderPath;
            }
            // searches for all files at the given directory path.
            const files = yield dir.promiseFiles(fullPath);
            const fileOptions = [];
            for (const file in files) {
                if (files.hasOwnProperty(file)) {
                    const baseName = (path.parse(files[file]).base);
                    const fileName = files[file];
                    if (fileName.includes(searchTerm)) {
                        fileOptions.push({ label: baseName, description: fileName });
                    }
                }
            }
            // select from all files found that match search term.
            selected = yield vscode_1.window.showQuickPick(fileOptions);
            activeFilePath = (path.parse(editor.document.fileName).dir);
            if (!selected) {
                return;
            }
            const target = path.parse(selected.description);
            const relativePath = path.relative(activeFilePath, target.dir);
            possibleLanguage = inferLanguageFromFileExtension(target.ext);
            // change path separator syntax for commonmark
            snippetLink = path.join(relativePath, target.base).replace(/\\/g, "/");
        }
        else {
            const inputRepoPath = yield vscode_1.window.showInputBox({ prompt: "Enter file path for Cross-Reference GitHub Repo" });
            if (inputRepoPath) {
                possibleLanguage = inferLanguageFromFileExtension(path.extname(inputRepoPath));
                snippetLink = `~/${crossReference}/${inputRepoPath}`;
            }
        }
        if (!!possibleLanguage) {
            language = possibleLanguage.aliases[0];
        }
        if (!language) {
            const supportedLanguages = highlight_langs_1.getLanguageIdentifierQuickPickItems();
            const options = {
                placeHolder: "Select a programming language (required)",
            };
            const qpSelection = yield vscode_1.window.showQuickPick(supportedLanguages, options);
            if (!qpSelection) {
                common.postWarning("No code language selected. Abandoning command.");
                return;
            }
            else {
                const selectedLang = highlight_langs_1.languages.find((lang) => lang.language === qpSelection.label);
                language = selectedLang ? selectedLang.aliases[0] : null;
            }
        }
        if (!language) {
            common.postWarning("Unable to determine language. Abandoning command.");
            return;
        }
        const selectionRange = new vscode_1.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
        const selectorOptions = [];
        selectorOptions.push({ label: "Id", description: "Select code by id tag (for example: <Snippet1>)" });
        selectorOptions.push({ label: "Range", description: "Select code by line range (for example: 1-15,18,20)" });
        selectorOptions.push({ label: "None", description: "Select entire file" });
        const choice = yield vscode_1.window.showQuickPick(selectorOptions);
        if (choice) {
            let snippet;
            switch (choice.label.toLowerCase()) {
                case "id":
                    const id = yield vscode_1.window.showInputBox({ prompt: "Enter id to select" });
                    if (id) {
                        snippet = snippetBuilder(language, snippetLink, id, undefined);
                        common.insertContentToEditor(editor, search.name, snippet, true, selectionRange);
                    }
                    break;
                case "range":
                    const range = yield vscode_1.window.showInputBox({ prompt: "Enter line selection range" });
                    if (range) {
                        snippet = snippetBuilder(language, snippetLink, undefined, range);
                        common.insertContentToEditor(editor, search.name, snippet, true, selectionRange);
                    }
                    break;
                default:
                    snippet = snippetBuilder(language, snippetLink);
                    common.insertContentToEditor(editor, search.name, snippet, true, selectionRange);
                    break;
            }
        }
    });
}
exports.search = search;
function inferLanguageFromFileExtension(fileExtension) {
    const matches = highlight_langs_1.languages.filter((lang) => {
        return lang.extensions
            ? lang.extensions.some((ext) => ext === fileExtension)
            : false;
    });
    if (matches && matches.length) {
        return matches[0];
    }
    return null;
}
exports.inferLanguageFromFileExtension = inferLanguageFromFileExtension;
function internalLinkBuilder(isArt, pathSelection, selectedText = "", languageId) {
    const os = require("os");
    let link = "";
    let startBrace = "";
    if (isArt) {
        startBrace = "![";
    }
    else {
        startBrace = "[";
    }
    // replace the selected text with the properly formatted link
    if (pathSelection === "") {
        link = `${startBrace}${selectedText}]()`;
    }
    else {
        link = `${startBrace}${selectedText}](${pathSelection})`;
    }
    const langId = languageId || "markdown";
    const isYaml = langId === "yaml" && !isArt;
    if (isYaml) {
        link = pathSelection;
    }
    // The relative path comparison creates an additional level that is not needed and breaks linking.
    // The path module adds an additional level so we'll need to handle this in our code.
    // Update slashes bug 944097.
    if (os.type() === "Windows_NT") {
        link = link.replace(/\\/g, "/");
    }
    if (isArt) {
        // Art links need backslashes to preview and publish correctly.
        link = link.replace(/\\/g, "/");
    }
    return link;
}
exports.internalLinkBuilder = internalLinkBuilder;
function externalLinkBuilder(link, title = "") {
    if (title === "") {
        title = link;
    }
    const externalLink = `[${title}](${link})`;
    return externalLink;
}
exports.externalLinkBuilder = externalLinkBuilder;
function videoLinkBuilder(link) {
    const videoLink = `> [!VIDEO ${link}]`;
    return videoLink;
}
exports.videoLinkBuilder = videoLinkBuilder;
function includeBuilder(link, title) {
    // Include link syntax for reference: [!INCLUDE[sampleinclude](./includes/sampleinclude.md)]
    const include = `[!INCLUDE [${title}](${link})]`;
    return include;
}
exports.includeBuilder = includeBuilder;
function snippetBuilder(language, relativePath, id, range) {
    if (id) {
        return `:::code language="${language}" source="${relativePath}" id=${id}":::`;
    }
    else if (range) {
        return `:::code language="${language}" source="${relativePath}" range="${range}":::`;
    }
    else {
        return `:::code language="${language}" source="${relativePath}":::`;
    }
}
exports.snippetBuilder = snippetBuilder;
/**
 * Strip out BOM from a string if presented, to prevent exception from JSON.parse function.
 * In Javascript, \uFEFF represents the Byte Order Mark (BOM).
 * @param originalText - the original string of text
 */
function stripBOMFromString(originalText) {
    if (originalText === undefined) {
        return undefined;
    }
    return originalText.replace(/^\uFEFF/, "");
}
exports.stripBOMFromString = stripBOMFromString;
/**
 * Create child process.
 */
function createChildProcess(path, args, options) {
    const spawn = require("child-process-promise").spawn;
    const promise = spawn(path, args, options);
    const childProcess = promise.childProcess;
    return childProcess;
}
exports.createChildProcess = createChildProcess;
const expressionToReplacementMap = [
    { expression: /\u201c/gm /* double left quote               “ */, replacement: '"' },
    { expression: /\u201d/gm /* double right quote              ” */, replacement: '"' },
    { expression: /\u2018/gm /* single left quote               ‘ */, replacement: "'" },
    { expression: /\u2019/gm /* single right quote              ’ */, replacement: "'" },
    { expression: /\u00A9/gm /* copyright character             © */, replacement: "&copy;" },
    { expression: /\u2122/gm /* trademark character             ™ */, replacement: "&trade;" },
    { expression: /\u00AE/gm /* registered trademark character  ® */, replacement: "&reg;" },
    { expression: /\u20AC/gm /* euro character                  € */, replacement: "&euro;" },
    { expression: /\u2022/gm /* bullet character                • */, replacement: "*" },
    // Superscript
    { expression: /\u2070/gm /* 0 superscript character         ⁰ */, replacement: "<sup>0</sup>" },
    { expression: /\u00B9/gm /* 1 superscript character         ⁴ */, replacement: "<sup>1</sup>" },
    { expression: /\u00B2/gm /* 2 superscript character         ⁴ */, replacement: "<sup>2</sup>" },
    { expression: /\u00B3/gm /* 3 superscript character         ⁴ */, replacement: "<sup>3</sup>" },
    { expression: /\u2074/gm /* 4 superscript character         ⁴ */, replacement: "<sup>4</sup>" },
    { expression: /\u2075/gm /* 5 superscript character         ⁵ */, replacement: "<sup>5</sup>" },
    { expression: /\u2076/gm /* 6 superscript character         ⁶ */, replacement: "<sup>6</sup>" },
    { expression: /\u2077/gm /* 7 superscript character         ⁷ */, replacement: "<sup>7</sup>" },
    { expression: /\u2078/gm /* 8 superscript character         ⁸ */, replacement: "<sup>8</sup>" },
    { expression: /\u2079/gm /* 9 superscript character         ⁹ */, replacement: "<sup>9</sup>" },
    // Subscript
    { expression: /\u2080/gm /* 0 subscript character           ₀ */, replacement: "<sub>0</sub>" },
    { expression: /\u2081/gm /* 1 subscript character           ₁ */, replacement: "<sub>1</sub>" },
    { expression: /\u2082/gm /* 2 subscript character           ₂ */, replacement: "<sub>2</sub>" },
    { expression: /\u2083/gm /* 3 subscript character           ₃ */, replacement: "<sub>3</sub>" },
    { expression: /\u2084/gm /* 4 subscript character           ₄ */, replacement: "<sub>4</sub>" },
    { expression: /\u2085/gm /* 5 subscript character           ₅ */, replacement: "<sub>5</sub>" },
    { expression: /\u2086/gm /* 6 subscript character           ₆ */, replacement: "<sub>6</sub>" },
    { expression: /\u2087/gm /* 7 subscript character           ₇ */, replacement: "<sub>7</sub>" },
    { expression: /\u2088/gm /* 8 subscript character           ₈ */, replacement: "<sub>8</sub>" },
    { expression: /\u2089/gm /* 9 subscript character           ₉ */, replacement: "<sub>9</sub>" },
];
const tabExpression = /\t/gm;
/**
 * Finds and replaces target expressions. For example, smart quotes (`“, ”, ‘, and ’` such as those found in Word documents) with standard quotes.
 * @param event the event fired when a text document is changed.
 */
function findAndReplaceTargetExpressions(event) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!vscode_1.workspace.getConfiguration("markdown").replaceSmartQuotes) {
            return;
        }
        if (!!event && event.document) {
            const editor = vscode_1.window.activeTextEditor;
            if (editor && common.isMarkdownFileCheckWithoutNotification(editor)) {
                const document = event.document;
                const content = document.getText();
                if (!!content) {
                    const replacements = [];
                    if (vscode_1.workspace.getConfiguration("editor").insertSpaces) {
                        const tabSize = vscode_1.workspace.getConfiguration("editor").tabSize || 4;
                        if (!expressionToReplacementMap.some((pair) => pair.expression === tabExpression)) {
                            expressionToReplacementMap.push({
                                expression: tabExpression,
                                replacement: "".padEnd(tabSize, " "),
                            });
                        }
                    }
                    expressionToReplacementMap.forEach((expressionToReplacement) => {
                        const targetReplacements = findReplacements(document, content, expressionToReplacement.replacement, expressionToReplacement.expression);
                        if (targetReplacements && targetReplacements.length) {
                            for (let index = 0; index < targetReplacements.length; index++) {
                                const replacement = targetReplacements[index];
                                replacements.push(replacement);
                            }
                        }
                    });
                    yield applyReplacements(replacements, editor);
                }
            }
        }
        return event;
    });
}
exports.findAndReplaceTargetExpressions = findAndReplaceTargetExpressions;
function findReplacements(document, content, value, expression) {
    if (!expression) {
        return undefined;
    }
    const results = common.matchAll(expression, content);
    if (!results || !results.length) {
        return undefined;
    }
    const replacements = [];
    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result !== null && result.length) {
            const match = result[0];
            if (match) {
                const index = result.index !== undefined ? result.index : -1;
                if (index === -1) {
                    continue;
                }
                const startPosition = document.positionAt(index);
                const endPosition = document.positionAt(index + match.length);
                const selection = new vscode_1.Selection(startPosition, endPosition);
                replacements.push({ selection, value });
            }
        }
    }
    return replacements;
}
exports.findReplacements = findReplacements;
function findReplacement(document, content, value, expression) {
    const result = expression ? expression.exec(content) : null;
    if (result !== null && result.length) {
        const match = result[0];
        if (match) {
            const index = result.index;
            const startPosition = document.positionAt(index);
            const endPosition = document.positionAt(index + match.length);
            const selection = new vscode_1.Selection(startPosition, endPosition);
            return { selection, value };
        }
    }
    return undefined;
}
exports.findReplacement = findReplacement;
function applyReplacements(replacements, editor) {
    return __awaiter(this, void 0, void 0, function* () {
        if (replacements) {
            yield editor.edit((builder) => {
                replacements.forEach((replacement) => builder.replace(replacement.selection, replacement.value));
            });
        }
    });
}
exports.applyReplacements = applyReplacements;
//# sourceMappingURL=utility.js.map