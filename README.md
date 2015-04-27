# InstantPjax

Not for noob.

## Compatibility

Use `json2.js` for JSON.parse with IE 6~8

See: [https://github.com/douglascrockford/JSON-js](https://github.com/douglascrockford/JSON-js) for details.

```html
<!--[if lte IE 8]>
	<script type="application/javascript" src="https://raw.githubusercontent.com/douglascrockford/JSON-js/master/json2.js"></script>
<![endif]-->
```

## Tests
   
Tests (in the `tests` folder) are PHP-generated HTML pages with which to check how InstantClick behaves on different browsers. That’s what I use before releasing a new version to make sure there are no obvious regressions.

To access the suite of tests, run `php -S 127.0.0.1:8000` from the project’s root directory (**not** from the `tests` folder) and head to [http://127.0.0.1:8000/tests/](http://127.0.0.1:8000/tests/).
