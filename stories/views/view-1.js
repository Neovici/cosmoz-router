import { html, component, useState, useEffect } from 'haunted';

customElements.define(
	'view-1',
	component(() => {
		const [count, setCount] = useState(0);
		useEffect(() => {
			console.log('I\'ve been activated !');
		}, []);

		return html`
			<h2>Welcome to the test view 1</h2>
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
