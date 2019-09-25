import { PolymerElement, html } from '@polymer/polymer/polymer-element';

class View2 extends PolymerElement {
	static get template() {
		return html`
			<h2>Welcome to the test view 2</h2>
			<div>
			count = <span>{{ count }}</span>.
			</div>
			<ul>
			<template is="dom-repeat" items="{{items}}">
				<li>{{item}}</li>
			</template>
			</ul>

			<button on-click="handleClick">increase count</button>
		`;
	}

	static get is() {
		return 'view-2';
	}

	connectedCallback() {
		super.connectedCallback();
		console.log('I\'ve been activated !');
		this.count = 0;
	}

	handleClick() {
		this.count += 1;
		const newItems = [];
		for (let i = 0; i < this.count; i += 1) {
			newItems.push(i);
		}
		this.items = newItems;
	}
}

customElements.define(View2.is, View2);
