# knex-filter

Declarative filtering for `knex.js`.

## Installation

```bash
npm i knex-filter --save
```

## Usage

```js
var filter = require('knex-filter').filter;

knex('mytab')
	.where(filter({
		a: 'b',
		'c >': 12,
		'd in': [1, 2, 3],
		e: null,
		not: { f: null },
		or: {
			k: 1,
			'm like': '%Bob%'
		}
	}))
	.then(console.log);
```

## Motivation

Imagine you have page with filterable table, user changes state of your filter controls and presses "apply": you need to pass that filter to backend to obtain filtered set from it. I'm sure you had such case. Was it tedious to walk trough query string and imperatively build your query using `knex.js`? Forget it, you can now provide filter object from your frontend to your backend and apply it with no effort!

## License

MIT
