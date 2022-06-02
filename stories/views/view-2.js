import { html, component, useState, useEffect } from 'haunted';

customElements.define(
	'view-2',
	component(() => {
		const [count, setCount] = useState(0);
		useEffect(() => {
			console.log('I\'ve been activated !');
		}, []);

		return html`
			<h2>Welcome to the test view 2</h2>
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
