cosmoz-page-router
==================

[![Build Status](https://github.com/Neovici/cosmoz-page-router/workflows/Github%20CI/badge.svg)](https://github.com/Neovici/cosmoz-page-router/actions?workflow=Github+CI)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/Neovici/cosmoz-page-router)
[![Depfu](https://badges.depfu.com/badges/c887733c2e1b6c70285860279a80fa03/overview.svg)](https://depfu.com/github/Neovici/cosmoz-page-router?project_id=9639)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Maintainability](https://api.codeclimate.com/v1/badges/56671dc0a46898d2f539/maintainability)](https://codeclimate.com/github/Neovici/cosmoz-page-router/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/56671dc0a46898d2f539/test_coverage)](https://codeclimate.com/github/Neovici/cosmoz-page-router/test_coverage)

## &lt;cosmoz-page-router&gt;

**cosmoz-page-router** is a haunted component to handle client side URL routing
and view loading / management.

By default **cosmoz-page-router** listens to `popstate` event
, reads hash bang ('#!/some/path') into a URL and matches it against the pathname.

## Getting started

### Installing

Using npm:
```bash
npm install --save @neovici/cosmoz-page-router
```

### Importing

The **cosmoz-page-router** element can be imported using:
```javascript
import '@neovici/cosmoz-page-router/cosmoz-page-router';
```

## Usage

### Routes
Routes are defined as an Array of Objects:
``` javascript
import { html } from 'lit-html';
import { creteElement, fromSearch, navigate } from '@neovici/cosmoz-page-router/lib/use-routes';

const routes = [
	{
		name: 'home', // optional (can be used to identity the route),
		rule: /^\/$/iu/, // a Regexp used to matched the route,
		handle: ({
			url, // the current url ( that matched the route)
			match, // the result of matching url.pathname against the rule,
		}) => html`<home />`
	},
	{
		name: 'some-page',
		rule: /^\/some\-page$/iu,
		handle: ({ url })=>import('page.js')
			.then(()=> createElement('some-element', fromSearch(url.search)))
	},
	{
		name: 'redirect',
		rule: /^\/some\-redirect$/iu,
		handle: ()=> navigate('#!/', null, {
			replace: true, // true to use replaceState,false to use pushState,
			notify: true //true to dispatch a `popstate` event
		})
	}
];
```
and passed to cosmoz-page-router:

``` javascript
html`<cosmoz-page-router .routes=${routes} />`;
```


## Documentation

See http://neovici.github.io/cosmoz-page-router (outdated)

TODO
