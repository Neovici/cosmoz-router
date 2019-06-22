cosmoz-page-router
==================

[![Build Status](https://travis-ci.com/Neovici/cosmoz-page-router.svg?branch=master)](https://travis-ci.org/Neovici/cosmoz-page-router)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/Neovici/cosmoz-page-router)

## &lt;cosmoz-page-router&gt;

**cosmoz-page-router** is a Polymer component to handle client side URL routing
and view loading / management.

It support ad-hoc routing so no routes need to be defined - any accessed route
will try to be loaded.

It supports named views/templates so templates and the corresponding JavaScript
code can be bundled/vulcanized.

## Credits

cosmoz-page-router is based on Erik Ringsmuth's app-router component (https://github.com/erikringsmuth/app-router), licensed under the MIT License.

Major differences with app-router are:
- requires Polymer 1.0, whereas app-router works with Polymer, X-Tag, and natively.
- focus on Polymer 1.0 `dom-bind` template views
- support for _adhoc routing_, i.e. creating a route dynamically when a path is requested
- experimental support for persisted templates

## Usage

Example:

<!---
```
<custom-element-demo>
	<template>
		<script src="../../webcomponentsjs/webcomponents-lite.js"></script>
		<link rel="import" href="../cosmoz-page-router.html">
		<next-code-block></next-code-block>
	</template>
</custom-element-demo>
```
-->
```html
<cosmoz-page-router id="appRouter" manual-init mode="hash" url-prefix="views">
	<cosmoz-page-route path="/" import="demo/views/home.html" template-id="home"></cosmoz-page-route>
	<cosmoz-page-route path="/view1" import="demo/views/view1.html" template-id="view1"></cosmoz-page-route>
	<cosmoz-page-route path="/view2" import="demo/views/view2.html" template-id="view2"></cosmoz-page-route>
	<!-- <cosmoz-page-route path="/view3" import="demo/views/view3.html" template-id="view3"></cosmoz-page-route> -->
	<cosmoz-page-route path="/scroll-view" import="demo/views/scroll-view.html" template-id="scroll-view"></cosmoz-page-route>
</cosmoz-page-router>
```

### Install

`bower install --save cosmoz-page-router`

### Add the cosmoz-page-router import
```html
<link rel="import" href="bower_components/cosmoz-page-router/cosmoz-page-router.html" />
```

## Documentation

See http://neovici.github.io/cosmoz-page-router