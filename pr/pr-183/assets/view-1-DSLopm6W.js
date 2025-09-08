import{c as s,u as i,a as u}from"./cosmoz-router.stories-7ZSVoWlD.js";import{x as o}from"./iframe-Bkvchdsj.js";customElements.define("view-1",s(()=>{const[t,n]=i(0);return u(()=>{console.log("I've been activated !")},[]),o`
			<h2>Welcome to the test view 1</h2>
			<div>count = <span>${t}</span>.</div>
			<ul>
				${Array(t).fill(1).map((e,c)=>o`<li>${c}</li>`)}
			</ul>
			<button @click=${()=>n(e=>e+1)}>increase count</button>
		`}));
