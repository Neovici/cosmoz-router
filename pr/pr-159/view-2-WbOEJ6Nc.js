import { c as component, u as useState, a as useEffect } from './cosmoz-router.stories-hUaHBjqv.js';
import { x } from './directive-helpers-B3SPnMX6.js';

customElements.define(
  "view-2",
  component(() => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      console.log("I've been activated !");
    }, []);
    return x`
			<h2>Welcome to the test view 2</h2>
			<div>count = <span>${count}</span>.</div>
			<ul>
				${Array(count).fill(1).map((_, item) => x`<li>${item}</li>`)}
			</ul>
			<button @click=${() => setCount((i) => i + 1)}>increase count</button>
		`;
  })
);
