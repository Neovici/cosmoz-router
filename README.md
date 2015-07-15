# cosmoz-page-router

cosmoz-page-router is a Polymer component to handle client side URL routing and view loading / management.

It support ad-hoc routing so no routes need to be defined - any accessed route will try to be loaded.

It supports named views/templates so templates and the corresponding JavaScript code can be bundled/vulcanized.

## Usage

### Install

`bower install --save cosmoz-page-router`

### Add the cosmoz-page-router import
```html
<link rel="import" href="bower_components/cosmoz-page-router/cosmoz-page-router.html" />
```

### Use the component

Make sure that the cosmoz-page-router takes up all the space where you want your views to go.

```html
<cosmoz-page-router class="fit">
  <cosmoz-page-route path="/" template-id="start" import="views/start.html"></cosmoz-page-route>
</cosmoz-page-router>
```

### Create views

A view for the above `cosmoz-page-route` would look like the following:

```html
<template id="start" is="dom-bind">
	<h2>Welcome to the start page</h2>
	<div>{{ boundValue }}</div>
</template>
<script type="text/javascript">
	Cosmoz.TemplateView['start'] = {
		properties: {
        	boundValue: {
            	type: String,
                value: 'bound'
            }
        },
        ready: function () {
        	console.log('template loaded!');
        }
	};
</script>
```

`Cosmoz.TemplateView` is an object that will link the template with ID `start` to this Polymer object named `start`.

The object itself will be mixed in like any other custom element / template.

The template has `is="dom-bind"` to hand over the stamping, listeners, bindings and other to Polymer once inserted.

For ad-hoc routing, `url-prefix` + `url` + `file-suffix` will be used to find the template file.
The template id will be the url path with slashes (/) replaced with dashes (-), `users/list/all` -> `users-list-all`.

### Attributes / properties

#### file-suffix / fileSuffix

What to suffix any ad-hoc route URL filenames with.

##### Default value: `.html`

##### Example

```html
<cosmoz-page-router file-suffix=".tpl"></cosmoz-page-router>
```

Accessing URL `#!/start` will load `/start.tpl`

#### mode

What kind of client side URLs to use.

##### Default value: `auto`

##### Possible values: `auto`, `pushstate`, `hash`, `hashbang`

#### no-ad-hoc / noAdHoc

Whether to disable ad-hoc routing.

##### Default value: `false`

#### url-prefix / urlPrefix

What to prefix any ad-hoc route URLs with.

##### Default value: *(not set)*

##### Example

```html
<cosmoz-page-router url-prefix="views"></cosmoz-page-router>
```

Accessing URL `#!/start` will load `views/start.html`


### Events

#### `state-change`

Fires when the URL changes and cosmoz-page-router is about to do work.
If a listener calls `event.preventDefault()` on this, the routing action is cancelled.

Useful to subscribe to if re-routing / redirects are going to be made.

#### `route-loading`

Fires when ad-hoc routing initiates, to allow the host application / component to display a loading message, if necessary.

#### `import-error`

If the HTML import fails (404 file not found or similar).
A good place to show an error message to the user.

#### `template-not-found`

If the HTML import succeeded but no template with the correct ID could be located in the import, this is fired.

#### `template-created`

Fired when the template node has been imported and mixed in with its template object.
Could be used to inject common template behaviors or properties.

#### `template-ready`

Fired when model with `params` is injected into the template instance.

#### `attached`

Will be fired by Polymer similar to custom elements.

**DO NOT OVERRIDE / USE** - this will prevent template auto-binding to complete.

#### `ready`

Will be fired by Polymer similar to custom elements.

A good time to do any setup if needed for the view.

#### `template-activate`

Will be fired for newly imported templates when the `dom-change` event fires.

Will otherwise be fired when activated for persisted views.