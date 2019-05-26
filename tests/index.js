var test = require('tape');
var knex = require('knex')({ dialect: 'pg' });
var filter = require('../').filter;

test('should build empty query', function (t) {
	t.plan(1)
	var actual = knex('tab')
		.where(filter({}))
		.toSQL()
		.sql;
	var expected = 'select * from "tab"';
	t.equal(actual, expected)
});

test('should build simple query', function (t) {
	t.plan(1)
	var actual = knex('mytab')
		.where(filter({ a: 'b', 'c >': 12, 'd in': [1, 2, 3], e: null }))
		.toSQL()
		.sql;
	var expected = 'select * from "mytab" where ("a" = ? and "c" > ? and "d" in (?, ?, ?) and "e" is null)';
	t.equal(actual, expected)
});

test('should build query with "not"', function (t) {
	t.plan(1)
	var actual = knex('mytab')
		.where(filter({ not: { a: null } }))
		.toSQL()
		.sql;
	var expected = 'select * from "mytab" where (not ("a" is null))';
	t.equal(actual, expected)
});

test('should build query with "!"', function (t) {
	t.plan(1)
	var actual = knex('mytab')
		.where(filter({ '!': { a: null } }))
		.toSQL()
		.sql;
	var expected = 'select * from "mytab" where (not ("a" is null))';
	t.equal(actual, expected)
});

test('should build query with "and"', function (t) {
	t.plan(1)
	var actual = knex('mytab')
		.where(filter({ and: { a: null, b: 12 } }))
		.toSQL()
		.sql;
	var expected = 'select * from "mytab" where ("a" is null and "b" = ?)';
	t.equal(actual, expected)
});

test('should build query with "or"', function (t) {
	t.plan(1)
	var actual = knex('mytab')
		.where(filter({ or: { a: null, b: 12 } }))
		.toSQL()
		.sql;
	var expected = 'select * from "mytab" where ((("a" is null) or ("b" = ?)))';
	t.equal(actual, expected)
});

test('should build query with "and" and "or"', function (t) {
	t.plan(1)
	var actual = knex('mytab')
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
		.toSQL()
		.sql
	var expected = 'select * from "mytab" where ("a" = ? and "c" > ? and "d" in (?, ?, ?) and "e" is null and not ("f" is null) and (("k" = ?) or ("m" like ?)))';
	t.equal(actual, expected)
});
