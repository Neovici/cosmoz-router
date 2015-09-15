# cosmoz-page-router

cosmoz-page-router is a Polymer component to handle client side URL routing and view loading / management.

It support ad-hoc routing so no routes need to be defined - any accessed route will try to be loaded.

It supports named views/templates so templates and the corresponding JavaScript code can be bundled/vulcanized.

## Credits

cosmoz-page-router is based on Erik Ringsmuth's app-router component (https://github.com/erikringsmuth/app-router), licensed under the MIT License.

Major differences with app-router are:
- requires Polymer 1.0, whereas app-router works with Polymer, X-Tag, and natively.
- focus on Polymer 1.0 `dom-bind` template views
- support for _adhoc routing_, i.e. creating a route dynamically when a path is requested
- experimental support for persisted templates

## Usage

### Install

`bower install --save cosmoz-page-router`

### Add the cosmoz-page-router import
```html
<link rel="import" href="bower_components/cosmoz-page-router/cosmoz-page-router.html" />
```

## Docs

See http://neovici.github.io/cosmoz-page-router