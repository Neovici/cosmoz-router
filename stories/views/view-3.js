import { html, component, useState, useEffect } from '@pionjs/pion';

customElements.define(
	'view-3',
	component(() => {
		const [count, setCount] = useState(0);
		useEffect(() => {
			console.log('I\'ve been activated !');
		}, []);

		return html`
			<h2>Welcome to the test view 3</h2>
			<div>count = <span>${count}</span>.</div>
			<ul>
				${Array(count)
					.fill(1)
					.map((_, item) => html`<li>${item}</li>`)}
			</ul>
			<button @click=${() => setCount((i) => i + 1)}>increase count</button>
		`;
	})
);
