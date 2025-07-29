import { c as component, u as useState, a as useEffect } from './cosmoz-router.stories-bPdQ5AuG.js';
import { x } from './directive-helpers-C5sW89lv.js';

customElements.define(
  "view-1",
  component(() => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      console.log("I've been activated !");
    }, []);
    return x`
			<h2>Welcome to the test view 1</h2>
			<div>count = <span>${count}</span>.</div>
			<ul>
				${Array(count).fill(1).map((_, item) => x`<li>${item}</li>`)}
			</ul>
			<button @click=${() => setCount((i) => i + 1)}>increase count</button>
		`;
  })
);
