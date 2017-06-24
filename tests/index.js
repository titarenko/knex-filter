var should = require('should');
var knex = require('knex')({ dialect: 'pg' });
var filter = require('../').filter;

describe('knex-filter', function () {

	describe('filter', function () {
		it('should build empty query', function () {
			knex('tab')
				.where(filter({}))
				.toSQL()
				.sql
				.should.eql('select * from "tab"');
		});
		it('should build simple query', function () {
			knex('mytab')
				.where(filter({ a: 'b', 'c >': 12, 'd in': [1, 2, 3], e: null }))
				.toSQL()
				.sql
				.should.eql('select * from "mytab" where ("a" = ? and "c" > ? and "d" in (?, ?, ?) and "e" is null)');
		});
		it('should build query with "not"', function () {
			knex('mytab')
				.where(filter({ not: { a: null } }))
				.toSQL()
				.sql
				.should.eql('select * from "mytab" where (not ("a" is null))');
		});
		it('should build query with "!"', function () {
			knex('mytab')
				.where(filter({ '!': { a: null } }))
				.toSQL()
				.sql
				.should.eql('select * from "mytab" where (not ("a" is null))');
		});
		it('should build query with "and"', function () {
			knex('mytab')
				.where(filter({ and: { a: null, b: 12 } }))
				.toSQL()
				.sql
				.should.eql('select * from "mytab" where ("a" is null and "b" = ?)');
		});
		it('should build query with "or"', function () {
			knex('mytab')
				.where(filter({ or: { a: null, b: 12 } }))
				.toSQL()
				.sql
				.should.eql('select * from "mytab" where ((("a" is null) or ("b" = ?)))');
		});
		it('should build query with "and" and "or', function () {
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
				.toSQL()
				.sql
				.should.eql('select * from "mytab" where ("a" = ? and "c" > ? and "d" in (?, ?, ?) and "e" is null and not ("f" is null) and (("k" = ?) or ("m" like ?)))');
		});
	});

});
