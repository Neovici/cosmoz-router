# Coding guidelines

We follow the [Polymer](https://www.polymer-project.org) guidelines as well as [JSLint](http://jslint.com/) as best possible, but with some exceptions.

Most importantly, we skip the check for `$` properties since Polymer populates `this.$` and we also skip the check for `_variable` since that's the way Polymer wants to do private properties and methods. Finally we allow the use of `this`.

In addition to this we also choose to indent with tabs.

## JSLint

To lint the JavaScript, you will need to install [node-jslint](https://github.com/reid/node-jslint), download our [jslint edition](https://raw.githubusercontent.com/Neovici/JSLint/all-patches/jslint.js) and save it as `jslint-cosmoz.js` in the node-jslint lib folder.

* Linux: `/usr/local/lib/node_modules/jslint/lib`
* Windows: `%APPDATA%\npm\node_modules\jslint\lib`

## Sublime Text 3

The easiest way to conform to the guidelines is to run Sublime Text 3 and install the following packages:

* SublimeLinter
* SublimeLinter-contrib-jslint
* TrailingSpaces

### Settings

* SublimeLinter: `"show_errors_on_save": true`
* TrailingSpaces: ` "trailing_spaces_trim_on_save": true`

# Contributing code

Just follow the [standard fork and pull request workflow](https://guides.github.com/activities/forking/).