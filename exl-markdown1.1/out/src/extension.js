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
/* The module 'vscode' contains the VS Code extensibility API
 The LoadToolbar function will populate items in the toolbar, but only when the extension loads the first time.
 The common file provides functions that are useful across all commands.
 Logging, Error Handling, VS Code window updates, etc.
*/
const vscode_1 = require("vscode");
const alert_controller_1 = require("./controllers/alert-controller");
const bold_controller_1 = require("./controllers/bold-controller");
const cleanup_controller_1 = require("./controllers/cleanup/cleanup-controller");
const code_controller_1 = require("./controllers/code-controller");
const image_controller_1 = require("./controllers/image-controller");
const include_controller_1 = require("./controllers/include-controller");
const italic_controller_1 = require("./controllers/italic-controller");
const list_controller_1 = require("./controllers/list-controller");
const master_redirect_controller_1 = require("./controllers/master-redirect-controller");
const media_controller_1 = require("./controllers/media-controller");
const metadata_controller_1 = require("./controllers/metadata-controller");
const no_loc_controller_1 = require("./controllers/no-loc-controller");
const preview_controller_1 = require("./controllers/preview-controller");
const quick_pick_menu_controller_1 = require("./controllers/quick-pick-menu-controller");
const row_columns_controller_1 = require("./controllers/row-columns-controller");
const snippet_controller_1 = require("./controllers/snippet-controller");
const sort_controller_1 = require("./controllers/sort-controller");
const table_controller_1 = require("./controllers/table-controller");
const xref_controller_1 = require("./controllers/xref-controller");
const yaml_controller_1 = require("./controllers/yaml-controller");
const common_1 = require("./helper/common");
const highlight_langs_1 = require("./helper/highlight-langs");
const telemetry_1 = require("./helper/telemetry");
const ui_1 = require("./helper/ui");
const utility_1 = require("./helper/utility");
const yaml_metadata_1 = require("./helper/yaml-metadata");
exports.output = vscode_1.window.createOutputChannel("docs-markdown");
/**
 * Provides the commands to the extension. This method is called when extension is activated.
 * Extension is activated the very first time the command is executed.
 * preview commands -
 * formatting commands -
 *
 * param {vscode.ExtensionContext} the context the extension runs in, provided by vscode on activation of the extension.
 */
function activate(context) {
    exports.extensionPath = context.extensionPath;
    context.subscriptions.push(new telemetry_1.Reporter(context));
    const { msTimeValue } = common_1.generateTimestamp();
    exports.output.appendLine(`[${msTimeValue}] - Activating docs markdown extension.`);
    // Places "Docs Markdown Authoring" into the Toolbar
    new ui_1.UiHelper().LoadToolbar();
    // check for docs extensions
    installedExtensionsCheck();
    // Creates an array of commands from each command file.
    const AuthoringCommands = [];
    alert_controller_1.insertAlertCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    include_controller_1.insertIncludeCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    media_controller_1.insertLinksAndMediaCommands().forEach((cmd) => AuthoringCommands.push(cmd));
    list_controller_1.insertListsCommands().forEach((cmd) => AuthoringCommands.push(cmd));
    snippet_controller_1.insertSnippetCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    table_controller_1.insertTableCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    bold_controller_1.boldFormattingCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    code_controller_1.codeFormattingCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    italic_controller_1.italicFormattingCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    quick_pick_menu_controller_1.quickPickMenuCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    preview_controller_1.previewTopicCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    master_redirect_controller_1.getMasterRedirectionCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    cleanup_controller_1.applyCleanupCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    xref_controller_1.applyXrefCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    yaml_controller_1.yamlCommands().forEach((cmd) => AuthoringCommands.push(cmd));
    no_loc_controller_1.noLocTextCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    row_columns_controller_1.insertRowsAndColumnsCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    image_controller_1.insertImageCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    metadata_controller_1.insertMetadataCommands().forEach((cmd) => AuthoringCommands.push(cmd));
    sort_controller_1.insertSortSelectionCommands().forEach((cmd) => AuthoringCommands.push(cmd));
    highlight_langs_1.insertLanguageCommands().forEach((cmd) => AuthoringCommands.push(cmd));
    // Autocomplete
    context.subscriptions.push(setupAutoComplete());
    vscode_1.languages.registerDocumentLinkProvider({ language: "markdown" }, {
        provideDocumentLinks(document, token) {
            const IMAGE_SOURCE_RE = /source="(.*?)"/gm;
            const text = document.getText();
            const results = [];
            for (const match of common_1.matchAll(IMAGE_SOURCE_RE, text)) {
                const matchLink = common_1.extractDocumentLink(document, match[1], match.index);
                if (matchLink) {
                    results.push(matchLink);
                }
            }
            return results;
        },
    });
    vscode_1.languages.registerCompletionItemProvider("markdown", highlight_langs_1.markdownCompletionItemsProvider, "`");
    vscode_1.languages.registerCodeActionsProvider("markdown", highlight_langs_1.markdownCodeActionProvider);
    // When the document changes, find and replace target expressions (for example, smart quotes).
    vscode_1.workspace.onDidChangeTextDocument(utility_1.findAndReplaceTargetExpressions);
    // Telemetry
    context.subscriptions.push(new telemetry_1.Reporter(context));
    // Attempts the registration of commands with VS Code and then add them to the extension context.
    try {
        vscode_1.commands.registerCommand("cleanupFile", (uri) => __awaiter(this, void 0, void 0, function* () {
            yield cleanup_controller_1.applyCleanupFile(uri);
        }));
        vscode_1.commands.registerCommand("cleanupInFolder", (uri) => __awaiter(this, void 0, void 0, function* () {
            yield cleanup_controller_1.applyCleanupFolder(uri);
        }));
        AuthoringCommands.map((cmd) => {
            const commandName = cmd.command;
            const command = vscode_1.commands.registerCommand(commandName, cmd.callback);
            context.subscriptions.push(command);
        });
    }
    catch (error) {
        exports.output.appendLine(`[${msTimeValue}] - Error registering commands with vscode extension context: + ${error}`);
    }
    exports.output.appendLine(`[${msTimeValue}] - Registered commands with vscode extension context.`);
    // if the user changes markdown.showToolbar in settings.json, display message telling them to reload.
    vscode_1.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("markdown.showToolbar")) {
            vscode_1.window.showInformationMessage("Your updated configuration has been recorded, but you must reload to see its effects.", "Reload")
                .then((res) => {
                if (res === "Reload") {
                    vscode_1.commands.executeCommand("workbench.action.reloadWindow");
                }
            });
        }
    });
}
exports.activate = activate;
function installedExtensionsCheck() {
    const { msTimeValue } = common_1.generateTimestamp();
    // create a list to house docs extension names, loop through
    const docsExtensions = [
        "docsmsft.docs-article-templates",
        "docsmsft.docs-preview",
    ];
    docsExtensions.forEach((extensionName) => {
        const friendlyName = extensionName.split(".").reverse()[0];
        const inactiveMessage = `[${msTimeValue}] - The ${friendlyName} extension is not installed.`;
        common_1.checkExtension(extensionName, inactiveMessage);
    });
}
exports.installedExtensionsCheck = installedExtensionsCheck;
function setupAutoComplete() {
    let completionItemsMarkdownYamlHeader = [];
    completionItemsMarkdownYamlHeader = completionItemsMarkdownYamlHeader.concat(no_loc_controller_1.noLocCompletionItemsMarkdownYamlHeader());
    let completionItemsMarkdown = [];
    completionItemsMarkdown = completionItemsMarkdown.concat(no_loc_controller_1.noLocCompletionItemsMarkdown());
    let completionItemsYaml = [];
    completionItemsYaml = completionItemsYaml.concat(no_loc_controller_1.noLocCompletionItemsYaml());
    return vscode_1.languages.registerCompletionItemProvider("*", {
        provideCompletionItems(document) {
            const editor = vscode_1.window.activeTextEditor;
            if (!editor) {
                common_1.noActiveEditorMessage();
                return;
            }
            if (document.languageId === "markdown") {
                if (yaml_metadata_1.isCursorInsideYamlHeader(editor)) {
                    return completionItemsMarkdownYamlHeader;
                }
                else {
                    return completionItemsMarkdown;
                }
            }
            else {
                return completionItemsYaml;
            }
        },
    });
}
// this method is called when your extension is deactivated
function deactivate() {
    exports.output.appendLine("Deactivating extension.");
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map