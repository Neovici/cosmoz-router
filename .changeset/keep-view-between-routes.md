---
'@neovici/cosmoz-router': minor
---

Keep the current view on screen while the next route loads, instead of blanking the router. Add a `reuse` option to `load()` and `createElement()`: when the URL changes but the route renders the same element, the element is updated with the new `params` instead of being replaced.
