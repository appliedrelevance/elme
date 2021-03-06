"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common = require("./common");
/**
 * Class for all formating functionalities shared across scenarios.
 */
/**
 * Insert or update unselected text for Bold, Italic, Code.
 * @param {vscode.TextEditor} editor - the active editor in vs code.
 * @param {string} senderName - the name of the function that is calling this function,
 * used to provide tracibility in logging.
 * @param {string} formattedText - the name of the formatted text.
 * @param {vscode.Range} range - provide range of insert or update.
 */
function insertUnselectedText(editor, senderName, formattedText, range) {
    if (formattedText === "****" || formattedText === "**" || formattedText === "``") {
        common.insertContentToEditor(editor, senderName, formattedText, true);
        // Gets the cursor position
        const position = editor.selection.active;
        const positionCharacter = senderName === "formatBold" ? position.character + 2 : position.character + 1;
        // Makes the cursor position in between syntaxs
        common.setCursorPosition(editor, position.line, positionCharacter);
    }
    else {
        common.insertContentToEditor(editor, senderName, formattedText, true, range);
    }
}
exports.insertUnselectedText = insertUnselectedText;
//# sourceMappingURL=format-logic-manager.js.map