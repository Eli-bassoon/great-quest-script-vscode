# Great Quest Script

Language support for Great Quest Script (`.gqs`) files, used by [FrogLord](https://github.com/Kneesnap/FrogLord) to modify *Frogger: The Great Quest*.

## Features

[Features.webm](https://github.com/user-attachments/assets/f1b94c1e-6878-4af2-9fcf-2ca2739ad52a)

* Syntax highlighting
* Autocomplete
* Folding sections and sticky headers so you can remember where you are
* Breadcrumbs for quick navigation
* Dialog hints: When using `OnDialog` and `ShowDialog`, see what the actual dialog is without having to scroll up to the dialog section. No more need to write comments on each line describing the dialog.
* Hover to see documentation
* Automatic generation of sequence hashes

## Installation

This extension is available on the [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=eli-bassoon.great-quest-script).

## Extension Settings

* `greatQuestScript.inlineDialog`: Toggles whether to show dialog inline.
* `greatQuestScript.goToNextLineInSectionHeaders`: Whether to move the cursor to the next line when autocompleting section headers.
* `greatQuestScript.addSpaceAfterAutocomplete`: Whether to add a space after accepting certain autocompleted suggestions.
* `greatQuestScript.autogenerateHash`: Whether to automatically generate a random hash when autocompleting a sequence section header. This has no effect if `goToNextlineInSectionHeaders` is turned off.

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md)
