# NProgress V2

**NProgress, which has not been maintained for over 4 years, requires a maintained V2 with recent code.**

## Installation

Add [index.js] and [index.css] to your project.

```html
<script src="index.js"></script>
<link rel="stylesheet" href="index.css" />
```

```bash
npm install nprogress-v2
```

Also available via [unpkg] CDN:

- https://unpkg.com/nprogress-v2@1.0.0/dist/index.js
- https://unpkg.com/nprogress-v2@1.0.0/dist/index.css

## Basic usage

Simply call `start()` and `done()` to control the progress bar.

```js
NProgress.start();
NProgress.done();
```

## Advanced usage

**Percentages:** To set a progress percentage, call `.set(n)`, where _n_ is a
number between `0..1`.

```js
NProgress.set(0.0); // Sort a same as .start()
NProgress.set(0.4);
NProgress.set(1.0); // Sort a same as .done()
```

**Incrementing:** To increment the progress bar, just use `.inc()`. This
increments it with a random amount. This will never get to 100%: use it for
every image load (or similar).

```js
NProgress.inc();
```

If you want to increment by a specific value, you can pass that as a parameter:

```js
NProgress.inc(0.2); // This will get the current status value and adds 0.2 until status is 0.994
```

**Force-done:** By passing `true` to `done()`, it will show the progress bar
even if it's not being shown. (The default behavior is that _.done()_ will not
do anything if _.start()_ isn't called)

```js
NProgress.done(true);
```

**Get the status value:** To get the status value, use `.status`

## Configuration

#### `minimum`

Changes the minimum percentage used upon starting. (default: `0.08`)

```js
NProgress.configure({ minimum: 0.1 });
```

#### `maximum`

Changes the maximum percentage used upon finishing. (default: `1`)

```js
NProgress.configure({ maximum: 0.9 });
```

#### `template`

You can change the markup using `template`. To keep the progress
bar working, keep an element with `role='bar'` in there. See the [default template]
for reference.

```js
NProgress.configure({
  template: "<div class='....'>...</div>",
});
```

#### `easing` and `speed`

Adjust animation settings using _easing_ (a CSS easing string)
and _speed_ (in ms). (default: `ease` and `200`)

```js
NProgress.configure({ easing: 'ease', speed: 500 });
```

#### `trickle`

Turn off the automatic incrementing behavior by setting this to `false`. (default: `true`)

```js
NProgress.configure({ trickle: false });
```

#### `trickleSpeed`

Adjust how often to trickle/increment, in ms.

```js
NProgress.configure({ trickleSpeed: 200 });
```

#### `showSpinner`

Turn off loading spinner by setting it to false. (default: `true`)

```js
NProgress.configure({ showSpinner: false });
```

#### `barSelector`

Specify this to change the bar selector. (default: `[role="bar"]`)

```js
NProgress.configure({ barSelector: '.my-custom-bar' });
```

#### `spinnerSelector`

Specify this to change the spinner selector. (default: `[role="spinner"]`)

```js
NProgress.configure({ spinnerSelector: '.my-custom-spinner' });
```

#### `parent`

Specify this to change the parent container. (default: `body`)

```js
NProgress.configure({ parent: '#container' });
```

#### `direction`

Specify progress bar direction: ltr or rtl. (default `ltr`)

## Customization

Just edit `index.css` to your liking. Tip: you probably only want to find
and replace occurrences of `#29d`.

The included CSS file is pretty minimal... in fact, feel free to scrap it and make your own!

## Issues

If you encounter any problems, do not hesitate to [open an issue](https://github.com/Skyleen77/nprogress-v2/issues) or make a PR [here](https://github.com/Skyleen77/nprogress-v2).

## LICENSE

MIT
