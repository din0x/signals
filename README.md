# `signals`

This library defines basic signals: `state`, `derived` and `effect`. Which you
can use to improve state management in small JS apps.

## Features

* Automatic dependency detection.
* Lazy evaluation.

## Example

```js
import { state, derived, effect } from './src/lib.js';

const counter = state(0);
const doubled = derived(() => 2 * counter.get());

effect(() => {
    document.getElementById('counter').innerHTML = doubled.get();
});

window.increment = () => {
    counter.update(value => value + 1);
};
```
