# Change Log

## 0.2.0

- **Minor fixes and features**
- Autocomplete entity instances defined in the same file
- Autocomplete entity descriptions defined in the same file
- Add unique item enum types to autocomplete
- Autocomplete file paths in [Include] section
- Prioritize autocompleting [[[Script]]] while inside [Entities]
  - To actually use this, type a single square bracket then Tab complete
  - If you start typing anything else it will likely try to autocomplete [Scripts] instead

- Minor fixes
  - Fix XYZ being highlighted when it shouldn't
  - Stop dialog hints displaying backslashes in escaped quotes
  - Fix blank sections causing exceptions sometimes


## 0.1.0

- **Initial release**
- Syntax highlighting
- Autocomplete
- Section folding
- Breadcrumbs
- Dialog hints
- Hover docs
- Automatic hash generation.