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
const axios_1 = require("axios");
const fs_1 = require("fs");
const js_base64_1 = require("js-base64");
const path_1 = require("path");
const vscode_1 = require("vscode");
const extension_1 = require("../extension");
// async fs does not have import module available
const fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);
exports.CODE_RE = /\[!code-(.+?)\s*\[\s*.+?\s*]\(\s*(.+?)\s*\)\s*]/i;
const ROOTPATH_RE = /.*~/gmi;
function codeSnippets(md, options) {
    const replaceCodeSnippetWithContents = (src, rootdir) => {
        let captureGroup;
        while ((captureGroup = exports.CODE_RE.exec(src))) {
            const repoRoot = vscode_1.workspace.workspaceFolders[0].uri.fsPath;
            let filePath = path_1.resolve(rootdir, captureGroup[2].trim());
            if (filePath.includes("~")) {
                filePath = filePath.replace(ROOTPATH_RE, repoRoot);
            }
            let mdSrc = fs_1.readFileSync(filePath, "utf8");
            mdSrc = `\`\`\`${captureGroup[1].trim()}\r\n${mdSrc}\r\n\`\`\``;
            src = src.slice(0, captureGroup.index) + mdSrc + src.slice(captureGroup.index + captureGroup[0].length, src.length);
        }
        return src;
    };
    const importCodeSnippet = (state) => {
        try {
            state.src = replaceCodeSnippetWithContents(state.src, options.root);
        }
        catch (error) {
            extension_1.output.appendLine(error);
        }
    };
    md.core.ruler.before("normalize", "codesnippet", importCodeSnippet);
}
exports.codeSnippets = codeSnippets;
const dict = [
    { actionscript: [".as"] },
    { arduino: [".ino"] },
    { assembly: ["nasm", ".asm"] },
    { batchfile: [".bat", ".cmd"] },
    { cpp: ["c", "c++", "objective-c", "obj-c", "objc", "objectivec", ".c", ".cpp", ".h", ".hpp", ".cc"] },
    { csharp: ["cs", ".cs"] },
    { cuda: [".cu", ".cuh"] },
    { d: ["dlang", ".d"] },
    { erlang: [".erl"] },
    { fsharp: ["fs", ".fs", ".fsi", ".fsx"] },
    { go: ["golang", ".go"] },
    { haskell: [".hs"] },
    { html: [".html", ".jsp", ".asp", ".aspx", ".ascx"] },
    { cshtml: [".cshtml", "aspx-cs", "aspx-csharp"] },
    { vbhtml: [".vbhtml", "aspx-vb"] },
    { java: [".java"] },
    { javascript: ["js", "node", ".js"] },
    { lisp: [".lisp", ".lsp"] },
    { lua: [".lua"] },
    { matlab: [".matlab"] },
    { pascal: [".pas"] },
    { perl: [".pl"] },
    { php: [".php"] },
    { powershell: ["posh", ".ps1"] },
    { processing: [".pde"] },
    { python: [".py"] },
    { r: [".r"] },
    { ruby: ["ru", ".ru", ".ruby"] },
    { rust: [".rs"] },
    { scala: [".scala"] },
    { shell: ["sh", "bash", ".sh", ".bash"] },
    { smalltalk: [".st"] },
    { sql: [".sql"] },
    { swift: [".swift"] },
    { typescript: ["ts", ".ts"] },
    { xaml: [".xaml"] },
    { xml: ["xsl", "xslt", "xsd", "wsdl", ".xml", ".csdl", ".edmx", ".xsl", ".xslt", ".xsd", ".wsdl"] },
    { vb: ["vbnet", "vbscript", ".vb", ".bas", ".vbs", ".vba"] }
];
let codeSnippetContent = "";
const fileMap = new Map();
const TRIPLE_COLON_CODE_RE = /:::(\s+)?code\s+(source|range|id|highlight|language|interactive)=".*?"(\s+)?((source|range|id|highlight|language|interactive)=".*?"(\s+))?((source|range|id|highlight|language|interactive)=".*?"\s+)?((source|range|id|highlight|language|interactive)=".*?"\s+)?((source|range|id|highlight|language|interactive)=".*?"(\s+)?)?:::/g;
const SOURCE_RE = /source="(.*?)"/i;
const LANGUAGE_RE = /language="(.*?)"/i;
const RANGE_RE = /range="(.*?)"/i;
const ID_RE = /id="(.*?)"/i;
function tripleColonCodeSnippets(md, options) {
    const replaceTripleColonCodeSnippetWithContents = (src, rootdir) => __awaiter(this, void 0, void 0, function* () {
        const matches = src.match(TRIPLE_COLON_CODE_RE);
        if (matches) {
            for (const match of matches) {
                let file;
                let shouldUpdate = false;
                let output = "";
                const lineArr = [];
                const position = src.indexOf(match);
                const source = match.match(SOURCE_RE);
                const path = source[1].trim();
                if (path) {
                    file = fileMap.get(path);
                    if (!file) {
                        shouldUpdate = true;
                        const repoRoot = vscode_1.workspace.workspaceFolders[0].uri.fsPath;
                        if (path.includes("~")) {
                            // get openpublishing.json at root
                            const openPublishingRepos = yield getOpenPublishingFile(repoRoot);
                            if (openPublishingRepos) {
                                const apiUrl = buildRepoPath(openPublishingRepos, path);
                                try {
                                    yield axios_1.default.get(apiUrl)
                                        .then((response) => {
                                        if (response) {
                                            if (response.status === 403) {
                                                extension_1.output.appendLine("Github Rate Limit has been reached. 60 calls per hour are allowed.");
                                            }
                                            else if (response.status === 404) {
                                                extension_1.output.appendLine("Resource not Found.");
                                            }
                                            else if (response.status === 200) {
                                                file = js_base64_1.Base64.decode(response.data.content);
                                                fileMap.set(path, file);
                                            }
                                        }
                                    });
                                }
                                catch (error) {
                                    extension_1.output.appendLine(error);
                                }
                            }
                        }
                        else {
                            file = yield readFile(path_1.resolve(rootdir, path), "utf8");
                            fileMap.set(path, file);
                        }
                    }
                }
                if (file) {
                    const data = file.split("\n");
                    const language = getLanguage(match, path);
                    const range = match.match(RANGE_RE);
                    const idMatch = match.match(ID_RE);
                    if (idMatch) {
                        output = idToOutput(idMatch, lineArr, data, language);
                    }
                    else if (range) {
                        output = rangeToOutput(lineArr, data, range);
                    }
                    else {
                        output = file;
                    }
                    output = `\`\`\`${language}\r\n${output}\r\n\`\`\``;
                    src = src.slice(0, position) + output + src.slice(position + match.length, src.length);
                    codeSnippetContent = src;
                    if (shouldUpdate) {
                        updateEditorToRefreshChanges();
                    }
                }
            }
        }
        else {
            codeSnippetContent = src;
        }
    });
    const importTripleColonCodeSnippets = (state) => {
        try {
            replaceTripleColonCodeSnippetWithContents(state.src, options.root);
            state.src = codeSnippetContent;
        }
        catch (error) {
            extension_1.output.appendLine(error);
        }
    };
    md.core.ruler.before("normalize", "codesnippet", importTripleColonCodeSnippets);
}
exports.tripleColonCodeSnippets = tripleColonCodeSnippets;
function updateEditorToRefreshChanges() {
    const editor = vscode_1.window.activeTextEditor;
    const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
    const position = new vscode_1.Position(editor.document.lineCount - 1, lastLine.range.end.character);
    editor.edit((update) => {
        update.insert(position, " ");
    }).then(() => {
        editor.edit((update) => {
            const range = editor.document.getWordRangeAtPosition(position, /[ ]+/g);
            update.delete(range);
        });
    });
}
function getLanguage(match, path) {
    let language = checkLanguageMatch(match);
    if (!language) {
        language = inferLanguage(path);
    }
    return language;
}
function buildRepoPath(repos, path) {
    let position = 0;
    let repoPath = "";
    const parts = path.split("/");
    repos.map((repo) => {
        if (parts) {
            parts.map((part, index) => {
                if (repo.path_to_root === part) {
                    position = index;
                    repoPath = repo.url;
                    return;
                }
            });
        }
    });
    const fullPath = [];
    repoPath = repoPath.replace("https://github.com/", "https://api.github.com/repos/");
    fullPath.push(repoPath);
    fullPath.push("contents");
    for (let index = position + 1; index < parts.length; index++) {
        fullPath.push(parts[index]);
    }
    return encodeURI(fullPath.join("/"));
}
function getOpenPublishingFile(repoRoot) {
    return __awaiter(this, void 0, void 0, function* () {
        const openPublishingFilePath = path_1.resolve(repoRoot, ".openpublishing.publish.config.json");
        const openPublishingFile = yield readFile(openPublishingFilePath, "utf8");
        // filePath = filePath.replace(ROOTPATH_RE, repoRoot);
        const openPublishingJson = JSON.parse(openPublishingFile);
        return openPublishingJson.dependent_repositories;
    });
}
function checkLanguageMatch(match) {
    const languageMatch = LANGUAGE_RE.exec(match);
    let language = "";
    if (languageMatch) {
        language = languageMatch[1].trim();
    }
    return language;
}
function inferLanguage(filePath) {
    const dict = [
        { actionscript: [".as"] },
        { arduino: [".ino"] },
        { assembly: ["nasm", ".asm"] },
        { batchfile: [".bat", ".cmd"] },
        { cpp: ["c", "c++", "objective-c", "obj-c", "objc", "objectivec", ".c", ".cpp", ".h", ".hpp", ".cc"] },
        { csharp: ["cs", ".cs"] },
        { cuda: [".cu", ".cuh"] },
        { d: ["dlang", ".d"] },
        { erlang: [".erl"] },
        { fsharp: ["fs", ".fs", ".fsi", ".fsx"] },
        { go: ["golang", ".go"] },
        { haskell: [".hs"] },
        { html: [".html", ".jsp", ".asp", ".aspx", ".ascx"] },
        { cshtml: [".cshtml", "aspx-cs", "aspx-csharp"] },
        { vbhtml: [".vbhtml", "aspx-vb"] },
        { java: [".java"] },
        { javascript: ["js", "node", ".js"] },
        { lisp: [".lisp", ".lsp"] },
        { lua: [".lua"] },
        { matlab: [".matlab"] },
        { pascal: [".pas"] },
        { perl: [".pl"] },
        { php: [".php"] },
        { powershell: ["posh", ".ps1"] },
        { processing: [".pde"] },
        { python: [".py"] },
        { r: [".r"] },
        { ruby: ["ru", ".ru", ".ruby"] },
        { rust: [".rs"] },
        { scala: [".scala"] },
        { shell: ["sh", "bash", ".sh", ".bash"] },
        { smalltalk: [".st"] },
        { sql: [".sql"] },
        { swift: [".swift"] },
        { typescript: ["ts", ".ts"] },
        { xaml: [".xaml"] },
        { xml: ["xsl", "xslt", "xsd", "wsdl", ".xml", ".csdl", ".edmx", ".xsl", ".xslt", ".xsd", ".wsdl"] },
        { vb: ["vbnet", "vbscript", ".vb", ".bas", ".vbs", ".vba"] }
    ];
    const target = path_1.parse(filePath);
    const ext = target.ext;
    let language = "";
    for (const key in dict) {
        if (dict.hasOwnProperty(key)) {
            const element = dict[key];
            for (const extension in element) {
                if (element.hasOwnProperty(extension)) {
                    const val = element[extension];
                    for (const x in val) {
                        if (val[x] === ext) {
                            language = extension;
                            break;
                        }
                    }
                }
            }
        }
    }
    if (!language) {
        language = ext.substr(1);
    }
    return language;
}
function rangeToOutput(lineArr, data, range) {
    const rangeArr = [];
    const rangeList = range[1].split(",");
    rangeList.forEach((element) => {
        if (element.indexOf("-") > 0) {
            const rangeThru = element.split("-");
            const startRange = parseInt(rangeThru[0], 10);
            const endRange = parseInt(rangeThru.pop(), 10);
            for (let index = startRange; index <= endRange; index++) {
                rangeArr.push(index);
            }
        }
        else {
            rangeArr.push(parseInt(element, 10));
        }
    });
    rangeArr.sort();
    data.map((line, index) => {
        rangeArr.filter((x) => {
            if (x === index + 1) {
                lineArr.push(line);
            }
        });
    });
    lineArr = dedent(lineArr);
    return lineArr.join("\n");
}
function idToOutput(idMatch, lineArr, data, language) {
    const id = idMatch[1].trim();
    let startLine = 0;
    let endLine = 0;
    const START_RE = new RegExp(`((<|#region)\s*${id}(>|(\s*>)))`, "i");
    const END_RE = new RegExp(`(</|#endregion)\s*${id}(\s*>)`, "i");
    // logic for id.
    for (let index = 0; index < data.length; index++) {
        if (START_RE.exec(data[index])) {
            startLine = index;
        }
        if (END_RE.exec(data[index])) {
            endLine = index;
            break;
        }
        if (index + 1 === data.length) {
            endLine = data.length;
            break;
        }
    }
    data.map((x, index) => {
        if (index > startLine && index < endLine) {
            lineArr.push(x);
        }
    });
    lineArr = dedent(lineArr);
    return lineArr.join("\n");
}
function dedent(lineArr) {
    let indent = 0;
    let firstIteration = true;
    for (const key in lineArr) {
        if (lineArr.hasOwnProperty(key)) {
            let index = 0;
            const line = lineArr[key].split("");
            for (const val in line) {
                if (line.hasOwnProperty(val)) {
                    const character = line[val];
                    if (firstIteration) {
                        if (!/\s/.test(character)) {
                            lineArr[key] = lineArr[key].substring(indent);
                            break;
                        }
                        else {
                            indent++;
                        }
                    }
                    else {
                        // check if all spaces
                        const allSpaces = lineArr[key].substring(0, indent);
                        if (allSpaces.match(/^ *$/) !== null) {
                            lineArr[key] = lineArr[key].substring(indent);
                            break;
                        }
                        else {
                            if (!/\s/.test(character)) {
                                lineArr[key] = lineArr[key].substring(index);
                                break;
                            }
                        }
                    }
                    index++;
                }
            }
            firstIteration = false;
        }
    }
    return lineArr;
}
//# sourceMappingURL=codesnippet.js.map