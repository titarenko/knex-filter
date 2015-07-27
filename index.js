var _ = require('lodash');

module.exports = {
	registerHandler: registerHandler,
	filter: filter
};

function registerHandler (op, handler, overwrite) {
	if (_.isObject(op)) {
		_.each(op, _.partialRight(registerHandler, overwrite));
		return;
	}
	if (handlers[op] && !overwrite) {
		throw new Error('Handler is already registered: ' + op + '!');
	}
	handlers[op] = handler;
}

var fieldlessCommands = ['and', 'or', 'not'];

var handlers = {
	'=': eqHandler,
	'>': _.partial(comparisonHandler, '>'),
	'<': _.partial(comparisonHandler, '<'),
	'>=': _.partial(comparisonHandler, '>='),
	'<=': _.partial(comparisonHandler, '<='),
	'in': _.partial(arrayArgHandler, 'whereIn'),
	'between': _.partial(arrayArgHandler, 'whereBetween'),
	'like': _.partial(comparisonHandler, 'like'),
	'ilike': _.partial(comparisonHandler, 'ilike'),
	'!': notHandler,
	'not': notHandler,
	'and': _.partial(logicalHandler, 'where'),
	'or': _.partial(logicalHandler, 'orWhere')
};

function eqHandler (field, arg) {
	if (arg === null) {
		this.whereNull(field);
	} else {
		this.where(field, arg);
	}
}

function comparisonHandler (op, field, arg) {
	this.where(field, op, arg);
}

function arrayArgHandler (op, field, arg) {
	if (!_.isArray(arg) || _.isEmpty(arg)) {
		return;
	}
	this[op](field, arg);
}

function notHandler (field, arg) {
	this.whereNot(filter(arg));
}

function logicalHandler (op, field, arg) {
	if (_.isArray(arg) && !_.isEmpty(arg)) {
		this.where(function () {
			_.each(arg, function (arg) {
				logicalHandler.call(this, op, null, arg);
			}, this);
		});
		return;
	}
	if (!_.isObject(arg)) {
		return;
	}
	if (op === 'where') {
		return walkLevel.call(this, arg);
	}
	this.where(function () {
		_.each(arg, function (arg, commandText) {
			this[op](filter(_.zipObject([commandText], [arg])));
		}, this);
	});
}

function parseCommand (text) {
	var tokens = text.split(' ');
	if (tokens.length === 1 && _.contains(fieldlessCommands, tokens[0])) {
		return {
			field: null,
			command: tokens[0]
		};
	}
	return {
		field: tokens[0],
		command: tokens[1] || '='
	};
}

function walkLevel (level) {
	var builder = this;
	_.each(compactObject(level), function (arg, commandText) {
		var command = parseCommand(commandText);
		handlers[command.command].call(builder, command.field, arg);
	});
}

function filter (query) {
	return function () {
		walkLevel.call(this, query);
	};
}

function compactObject (o) {
	return _.omit(o, function (v) {
		return v === undefined || (_.isArray(v) || _.isString(v)) && _.isEmpty(v);
	});
}
