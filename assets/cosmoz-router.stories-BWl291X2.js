const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./home-bPmIG3eN.js","./iframe-L69ah-NK.js","./haunted-DNx5qVBO.js","./view-1-Cgn_1A1T.js","./view-2-yW0qqK27.js","./view-3-D3EKYLV3.js"])))=>i.map(i=>d[i]);
import{c as e,d as t,i as n,l as r,n as i,o as a,s as o,t as s,u as c}from"./iframe-L69ah-NK.js";import{a as l,c as u,f as d,i as f,m as p,n as m,o as h,s as g,t as _,u as v}from"./haunted-DNx5qVBO.js";var y,b,x,S=t((()=>{y=e=>t=>{let n=document.location.origin,r=new URL(t,n).hash.replace(/^#!?/iu,``).replace(`%23`,`#`),i=new URL(r,n),a=i.pathname.match(e);return a&&{result:a,url:i}},b=e=>t=>{let n=t.match(e);return n&&{result:n,url:new URL(t,document.location.origin)}},x=(e,t)=>{for(let n of e){let e=n.rule,r=typeof e==`function`?e(t):b(e)(t);if(r)return{...n,route:n,match:r,url:t}}}})),C,w,T=t((()=>{_(),C=(e,...t)=>o(Object.assign(e,{raw:!0}),...t),w=(e,t={})=>{if(!customElements.get(e))throw Error(`Element ${e} is not defined`);if(Object.keys(t).length>0){let n=Object.keys(t).map(e=>` .${e}=`);return C([`<${e}${n[0]}`,...n.slice(1),`>`],...Object.values(t))}return C([`<${e}>`])}})),E,D,O,k=t((()=>{_(),S(),E=()=>window.location.href.replace(window.location.origin,``),D=()=>{let[e,t]=v(E);return p(()=>{let e=()=>t(E);return window.addEventListener(`popstate`,e),()=>window.removeEventListener(`popstate`,e)},[t]),e},O=e=>{let t=D();return d(()=>x(e,t),[e,t])}})),A,j=t((()=>{_(),k(),A=e=>{let t=O(e);return{route:t,result:d(()=>{if(t){let{handle:e,...n}=t;return e(n)}},[t])}}})),M,N,P=t((()=>{e(),u(),M={},N=h(class extends g{constructor(){super(...arguments),this.ot=M}render(e,t){return t()}update(e,[t,n]){if(Array.isArray(t)){if(Array.isArray(this.ot)&&this.ot.length===t.length&&t.every((e,t)=>e===this.ot[t]))return a}else if(this.ot===t)return a;return this.ot=Array.isArray(t)?Array.from(t):t,this.render(t,n)}})})),F,I,L=t((()=>{F=class{constructor(e){this.G=e}disconnect(){this.G=void 0}reconnect(e){this.G=e}deref(){return this.G}},I=class{constructor(){this.Y=void 0,this.Z=void 0}get(){return this.Y}pause(){this.Y??=new Promise(e=>this.Z=e)}resume(){this.Z?.(),this.Y=this.Z=void 0}}})),R,z,B,V,H=t((()=>{e(),s(),l(),L(),u(),R=e=>!i(e)&&typeof e.then==`function`,z=1073741823,B=class extends f{constructor(){super(...arguments),this._$Cwt=z,this._$Cbt=[],this._$CK=new F(this),this._$CX=new I}render(...e){return e.find(e=>!R(e))??a}update(e,t){let n=this._$Cbt,r=n.length;this._$Cbt=t;let i=this._$CK,o=this._$CX;this.isConnected||this.disconnected();for(let e=0;e<t.length&&!(e>this._$Cwt);e++){let a=t[e];if(!R(a))return this._$Cwt=e,a;e<r&&a===n[e]||(this._$Cwt=z,r=0,Promise.resolve(a).then(async e=>{for(;o.get();)await o.get();let t=i.deref();if(t!==void 0){let n=t._$Cbt.indexOf(a);n>-1&&n<t._$Cwt&&(t._$Cwt=n,t.setValue(e))}}))}return a}disconnected(){this._$CK.disconnect(),this._$CX.pause()}reconnected(){this._$CK.reconnect(this),this._$CX.resume()}},V=h(B)})),U,W,G=t((()=>{_(),U=(e,t,n)=>e.dispatchEvent(new CustomEvent(t,{bubbles:!1,cancelable:!1,composed:!0,...n})),W=(e,t,n)=>{p(()=>{if(!n){U(e,`route-not-found`);return}U(e,`route-loading`,{detail:t}),Promise.resolve(n).then(()=>U(e,`route-loaded`,{detail:t})).catch(n=>U(e,`route-error`,{detail:{route:t,error:n}}))},[n])}})),K,q=t((()=>{e(),P(),H(),_(),j(),G(),K=e=>{let t=e.routes,{route:r,result:i}=A(t);return W(e,r,i),N([i],()=>V(Promise.resolve(i).catch(()=>n),n))},customElements.define(`cosmoz-router`,m(K))})),J=t((()=>{S(),T(),k(),j(),q()})),Y,X,Z;t((()=>{_(),J(),c(),Y={title:`Cosmoz Router`},customElements.define(`demo-router`,m(()=>o`<cosmoz-router .routes=${[{rule:y(/^\/$/u),handle:()=>r(()=>import(`./home-bPmIG3eN.js`).then(()=>w(`demo-home`)),__vite__mapDeps([0,1,2]),import.meta.url)},{rule:y(/^\/view-1/u),handle:()=>r(()=>import(`./view-1-Cgn_1A1T.js`).then(()=>w(`view-1`)),__vite__mapDeps([3,1,2]),import.meta.url)},{rule:y(/^\/view-2/u),handle:()=>r(()=>import(`./view-2-yW0qqK27.js`).then(()=>w(`view-2`)),__vite__mapDeps([4,1,2]),import.meta.url)},{rule:y(/^\/view-3/u),handle:()=>r(()=>import(`./view-3-D3EKYLV3.js`).then(()=>w(`view-3`)),__vite__mapDeps([5,1,2]),import.meta.url)}]} />`)),X=()=>`
        <style>
            #content {
                display: flex;
                flex-direction: column;
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
            }
            #view {
                flex: 1;
                flex-basis: 0.000000001px;
                position: relative;
                display: block;
            }

            #appRouter {
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
            }
        </style>
        <div id="content">
            <h1>cosmoz-router test</h1>
            <ul>
                <li><a href="#!/" target="_self">/Home</a></li>
                <li><a href="#!/view-1" target="_self">/view-1</a></li>
                <li><a href="#!/view-2" target="_self">/view-2</a></li>
                <li><a href="#!/view-3" target="_self">/view-3</a></li>
            </ul>

            <div id="view">
                <demo-router />
            </div>
        </div>`,Z=[`Router`]}))();export{X as Router,Z as __namedExportsOrder,Y as default};