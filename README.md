cosmoz-router
==================

[![Build Status](https://github.com/Neovici/cosmoz-router/workflows/Github%20CI/badge.svg)](https://github.com/Neovici/cosmoz-router/actions?workflow=Github+CI)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## &lt;cosmoz-router&gt;

**cosmoz-router** is a haunted component to handle client side URL routing
and view loading / management.

By default **cosmoz-router** listens to `popstate` event
, gets current location href and matches it against the routes defined.

## Getting started

### Installing

Using npm:
```bash
npm install --save @neovici/cosmoz-router
```

### Importing

The **cosmoz-router** element can be imported using:
```javascript
import '@neovici/cosmoz-router/cosmoz-page-router';
```

## Usage

### Routes
Routes are defined as an Array of Objects:
``` javascript
import { html } from 'lit-html';
import { creteElement, navigate } from '@neovici/cosmoz-router/lib/use-routes';

const routes = [
	{
		name: 'home', // optional (can be used to identity the route),
		rule: /^\/$/iu/, // a Regexp used to matched the route,
		handle: ({
			url, // the current url string ( that matched the route)
			match, // the result of matching route against the rule,
		}) => html`<home />`
	},
	{
		name: 'some-page',
		rule: (url) => url.startsWith('/some-page'), // function called with current url string
		handle: ({ url })=>import('page.js')
			.then(()=> createElement('some-element', Object.fromEntries(url.searchParams)))
	},
	{
		name: 'redirect',
		rule: /^\/some\-redirect$/iu,
		handle: ()=> navigate('#!/', null, {
			replace: true, // true to use replaceState,false to use pushState,
			notify: true // true to dispatch a `popstate` event
		})
	}
];
```
and passed to cosmoz-router:

``` javascript
html`<cosmoz-router .routes=${routes} />`;
```


## Documentation

See http://neovici.github.io/cosmoz-router (outdated)

TODO
