import { c as component, u as useState, a as useEffect } from './cosmoz-router.stories-JutyZm3X.js';
import { x } from './directive-helpers-DdoUbUQq.js';

customElements.define(
  "view-3",
  component(() => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      console.log("I've been activated !");
    }, []);
    return x`
			<h2>Welcome to the test view 3</h2>
			<div>count = <span>${count}</span>.</div>
			<ul>
				${Array(count).fill(1).map((_, item) => x`<li>${item}</li>`)}
			</ul>
			<button @click=${() => setCount((i) => i + 1)}>increase count</button>
		`;
  })
);
