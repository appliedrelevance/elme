# ExL Authoring Pack

The ExL Authoring Pack provides a series of extensions to help docs.adobe.com authors work better and more efficiently. You can read more about all of the ExL Authoring Pack features here in the [overview guide](https://docs.adobe.com/en-us/contribute/how-to-write-docs-auth-pack). The ExL Authoring Pack provides the following extensions to help author content for docs.adobe.com:

* [ExL Markdown](https://marketplace.visualstudio.com/items?itemName=docsadobe.docs-markdown), which provides Markdown authoring assistance, including support for inserting custom Markdown syntax specific to docs.adobe.com. The rest of this readme provides details on the ExL Markdown extension.
* [ExL Preview](https://marketplace.visualstudio.com/items?itemName=docsadobe.docs-preview), which uses the docs.adobe.com CSS for more accurate Markdown preview, including custom Markdown.
* [ExL Linting](https://marketplace.visualstudio.com/items?itemName=docsadobe.docs-linting), which provides markdown linting specific to docs.adobe.com.
* [markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint), a popular linter by David Anson.
* [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker), a fully offline spell checker by Street Side Software.
* [LinkCheckMD](https://marketplace.visualstudio.com/items?itemName=blackmist.LinkCheckMD), which generates a report on the links in the document, including broken links.

## How to use the ExL Markdown extension

To access the ExL Markdown Authoring menu, type <kbd>ALT + M</kbd>. You can click or use up/down arrows to select the function you want, or type to start filtering, then hit <kbd>ENTER</kbd> when the function you want is highlighted in the menu.

![docs markdown quick pick](https://raw.githubusercontent.com/microsoft/vscode-docs-authoring/master/docs-authoring-pack/images/docs-markdown-quick-pick.png)

You can also access the ExL commands from the VS Code command palette by hitting <kbd>F1</kbd> and typing to filter. All the ExL commands begin with "ExL":

![docs markdown command palette](https://raw.githubusercontent.com/Microsoft/vscode-docs-authoring/master/media/image/docs-command-palette.png)

### Prerequisites and assumptions

To accurately insert relative links, images, and other embedded content with ExL Markdown, you must have your VS Code workspace scoped to the root of your cloned OPS repo. Some syntax supported by the extension, such as alerts and snippets, are custom Markdown for ExL, and will not render correctly unless published via ExL.

For more information about the ExL Markdown commands, see the [ExL Markdown readme](https://marketplace.visualstudio.com/items?itemName=docsadobe.docs-markdown).

## How to use ExL Images extension

To access the ExL Images menu, right click on a folder or individual image file. Select **Compress all images in folder** or **Compress image** from the context menu.

![docs image context menu](https://raw.githubusercontent.com/microsoft/vscode-docs-authoring/master/docs-authoring-pack/images/right-click-image-compression.png)

For more information about the ExL Images extension, see the [ExL Images readme](https://marketplace.visualstudio.com/items?itemName=docsadobe.docs-images).

## How to use ExL Preview extension

You can open ExL Preview by opening a markdown document and clicking on the preview button. One opens the preview in your current window, and the other opens the markdown preview to the side. Alternatively you can hit <kbd>Alt + M</kbd> and select `Preview` or you can hit <kbd>F1</kbd> and select `ExL: Preview` to open up the markdown preview panel.

![docs preview buttons](https://raw.githubusercontent.com/microsoft/vscode-docs-authoring/master/docs-authoring-pack/images/docs-preview-button.png)

For more information about the ExL Preview commands, see the [ExL Preview readme](https://marketplace.visualstudio.com/items?itemName=docsadobe.docs-preview).

## How to use ExL Linting extension

ExL Authoring Pack also supports comes with custom linting rules to aid in catching errors many run into when contributing to docs. This should automatically work with ExL Authoring Pack, and you will see the output in the "Problems" pane.

![docs preview buttons](https://raw.githubusercontent.com/microsoft/vscode-docs-authoring/master/docs-authoring-pack/images/docs-linting-problem.png)

For more information about the ExL Linting commands, see the [ExL Linting readme](https://marketplace.visualstudio.com/items?itemName=docsadobe.docs-linting).

## ExL Markdown keyboard shortcuts and toolbar

### How to assign keyboard shortcuts

Default keyboard shortcuts are available for some commands, as noted in the table above. You can override them, or add shortcuts for other commands, using the VS Code keyboard shortcut mappings.

1. Type <kbd>CTRL+K</kbd> then <kbd>CTRL+S</kbd> to open the Keyboard Shortcuts list.
1. Search for the command, such as `formatBold`, for which you want to create a custom keybinding.
1. Click the plus that appears near the command name when you mouse over the line.
1. After a new input box is visible, type the keyboard shortcut you want to bind to that particular command. For example, to use the common shortcut for bold, type <kbd>CTRL+B</kbd>.
1. It's a good idea to insert a `when` clause into your keybinding, so it won't be available in files other than Markdown. To do this, open keybindings.json and insert the following line below the command name (be sure to add a comma between lines):
   
    `"when": "editorTextFocus && editorLangId == 'markdown'"`

    Your completed custom keybinding should look like this in keybindings.json:

    ```json
    // Place your key bindings in this file to overwrite the defaults
    [
        {
            "key": "ctrl+b",
            "command": "formatBold",
            "when": "editorTextFocus && editorLangId == 'markdown'"
        }
    ]
    ```

1. Save keybindings.json.

See [Keybindings](https://code.visualstudio.com/docs/getstarted/keybindings) in the VS Code docs for more information.

### How to show the markdown toolbar

Users of the pre-release version of the extension will notice that the authoring toolbar no longer appears at the bottom of the VS Code window when the ExL Markdown extension is installed. This is because the toolbar took up a lot of space on the VS Code status bar, and did not follow best practices for extension UX, so it is deprecated in the new extension. However, you can optionally show the toolbar by updating your VS Code settings.json file as follows:

1. In VS Code, go to **File** > **Preferences** > **Settings** (<kbd>CTRL+,</kbd>).
1. Select User Settings to change the settings for all VS Code workspaces, or  Workspace Settings to change them for just the current workspace.
1. In the **Default Settings** pane on the left, find ExL Markdown Extension Configuration, and select the pencil icon next to the desired setting, and select `true`. VS Code will automatically add the value to the settings.json file and you will be prompted to reload the window for the changes to take effect.
1. Now you will see the toolbar at the bottom of your VS Code window:

   ![toolbar](https://raw.githubusercontent.com/Microsoft/vscode-docs-authoring/master/media/image/legacy-toolbar.png)

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit [https://cla.microsoft.com](https://cla.microsoft.com).

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## License

[MIT](LICENSE)
