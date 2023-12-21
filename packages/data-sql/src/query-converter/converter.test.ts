import type { AbstractQuery } from '@directus/data';
import { randomAlpha, randomIdentifier, randomInteger } from '@directus/random';
import { expect, test } from 'vitest';
import type { AbstractSqlQuery } from '../types/index.js';
import { convertQuery } from './converter.js';

test('Convert simple query', () => {
	const store = randomIdentifier();
	const table = randomIdentifier();
	const tableIndex = 0;
	const column1 = randomIdentifier();
	const column1Index = 0;
	const column2 = randomIdentifier();
	const column2Index = 1;

	const query: AbstractQuery = {
		store,
		collection: table,
		fields: [
			{
				type: 'primitive',
				field: column1,
				alias: randomIdentifier(),
			},
			{
				type: 'primitive',
				field: column2,
				alias: randomIdentifier(),
			},
		],
		modifiers: {},
	};

	const expectedResult: AbstractSqlQuery = {
		clauses: {
			select: [
				{
					type: 'primitive',
					tableIndex,
					column: column1,
					columnIndex: column1Index,
				},
				{
					type: 'primitive',
					tableIndex,
					column: column2,
					columnIndex: column2Index,
				},
			],
			from: {
				table,
				tableIndex,
			},
			joins: [],
		},
		parameters: [],
	};

	const result = convertQuery(query);

	expect(result.rootQuery).toStrictEqual(expectedResult);
});

test('Convert a query with a function as field select', () => {
	const store = randomIdentifier();
	const table = randomIdentifier();
	const tableIndex = 0;
	const column1 = randomIdentifier();
	const column1Index = 0;
	const column2 = randomIdentifier();
	const column2Index = 1;
	const column3 = randomIdentifier();
	const column3Index = 2;

	const query: AbstractQuery = {
		store,
		collection: table,
		fields: [
			{
				type: 'primitive',
				field: column1,
				alias: randomIdentifier(),
			},
			{
				type: 'primitive',
				field: column2,
				alias: randomIdentifier(),
			},
			{
				type: 'fn',
				fn: {
					type: 'arrayFn',
					fn: 'count',
				},
				field: column3,
				alias: randomIdentifier(),
			},
		],
		modifiers: {},
	};

	const expectedResult: AbstractSqlQuery = {
		clauses: {
			select: [
				{
					type: 'primitive',
					tableIndex,
					column: column1,
					columnIndex: column1Index,
				},
				{
					type: 'primitive',
					tableIndex,
					column: column2,
					columnIndex: column2Index,
				},
				{
					type: 'fn',
					fn: {
						type: 'arrayFn',
						fn: 'count',
					},
					tableIndex,
					column: column3,
					columnIndex: column3Index,
				},
			],
			from: {
				table,
				tableIndex,
			},
			joins: [],
		},
		parameters: [],
	};

	const result = convertQuery(query);

	expect(result.rootQuery).toStrictEqual(expectedResult);
});

test('Convert query with filter', () => {
	const store = randomIdentifier();
	const table = randomIdentifier();
	const tableIndex = 0;
	const column1 = randomIdentifier();
	const column1Index = 0;
	const column2 = randomIdentifier();
	const column2Index = 1;
	const column3 = randomIdentifier();
	const column3Value = randomInteger(1, 100);

	const query: AbstractQuery = {
		store,
		collection: table,
		fields: [
			{
				type: 'primitive',
				field: column1,
				alias: randomIdentifier(),
			},
			{
				type: 'primitive',
				field: column2,
				alias: randomIdentifier(),
			},
		],
		modifiers: {
			filter: {
				type: 'condition',
				condition: {
					type: 'condition-number',
					target: {
						type: 'primitive',
						field: column3,
					},
					operation: 'gt',
					compareTo: column3Value,
				},
			},
		},
	};

	const expectedResult: AbstractSqlQuery = {
		clauses: {
			select: [
				{
					type: 'primitive',
					tableIndex,
					column: column1,
					columnIndex: column1Index,
				},
				{
					type: 'primitive',
					tableIndex,
					column: column2,
					columnIndex: column2Index,
				},
			],
			from: {
				table,
				tableIndex,
			},
			joins: [],
			where: {
				type: 'condition',
				negate: false,
				condition: {
					type: 'condition-number',
					target: {
						type: 'primitive',
						tableIndex,
						column: column3,
					},
					operation: 'gt',
					compareTo: {
						type: 'value',
						parameterIndex: 0,
					},
				},
			},
		},
		parameters: [column3Value],
	};

	const result = convertQuery(query);

	expect(result.rootQuery).toStrictEqual(expectedResult);
});

test('Convert query with a limit', () => {
	const store = randomIdentifier();
	const table = randomIdentifier();
	const tableIndex = 0;
	const column1 = randomIdentifier();
	const column1Index = 0;
	const column2 = randomIdentifier();
	const column2Index = 1;

	const limit = randomInteger(1, 100);

	const query: AbstractQuery = {
		store,
		collection: table,
		fields: [
			{
				type: 'primitive',
				field: column1,
				alias: randomIdentifier(),
			},
			{
				type: 'primitive',
				field: column2,
				alias: randomIdentifier(),
			},
		],
		modifiers: {
			limit: {
				type: 'limit',
				value: limit,
			},
		},
	};

	const expectedResult: AbstractSqlQuery = {
		clauses: {
			select: [
				{
					type: 'primitive',
					tableIndex,
					column: column1,
					columnIndex: column1Index,
				},
				{
					type: 'primitive',
					tableIndex,
					column: column2,
					columnIndex: column2Index,
				},
			],
			from: {
				table,
				tableIndex,
			},
			joins: [],
			limit: {
				type: 'value',
				parameterIndex: 0,
			},
		},
		parameters: [limit],
	};

	const result = convertQuery(query);

	expect(result.rootQuery).toStrictEqual(expectedResult);
});

test('Convert query with offset', () => {
	const store = randomIdentifier();
	const table = randomIdentifier();
	const tableIndex = 0;
	const column1 = randomIdentifier();
	const column1Index = 0;
	const column2 = randomIdentifier();
	const column2Index = 1;

	const offset = randomInteger(1, 100);

	const query: AbstractQuery = {
		store,
		collection: table,
		fields: [
			{
				type: 'primitive',
				field: column1,
				alias: randomIdentifier(),
			},
			{
				type: 'primitive',
				field: column2,
				alias: randomIdentifier(),
			},
		],
		modifiers: {
			offset: {
				type: 'offset',
				value: offset,
			},
		},
	};

	const expectedResult: AbstractSqlQuery = {
		clauses: {
			select: [
				{
					type: 'primitive',
					tableIndex,
					column: column1,
					columnIndex: column1Index,
				},
				{
					type: 'primitive',
					tableIndex,
					column: column2,
					columnIndex: column2Index,
				},
			],
			from: {
				table,
				tableIndex,
			},
			joins: [],
			offset: {
				type: 'value',
				parameterIndex: 0,
			},
		},
		parameters: [offset],
	};

	const result = convertQuery(query);

	expect(result.rootQuery).toStrictEqual(expectedResult);
});

test('Convert query with a sort', () => {
	const store = randomIdentifier();
	const table = randomIdentifier();
	const tableIndex = 0;
	const column1 = randomIdentifier();
	const column1Index = 0;
	const column2 = randomIdentifier();
	const column2Index = 1;
	const column3 = randomIdentifier();

	const query: AbstractQuery = {
		store,
		collection: table,
		fields: [
			{
				type: 'primitive',
				field: column1,
				alias: randomIdentifier(),
			},
			{
				type: 'primitive',
				field: column2,
				alias: randomIdentifier(),
			},
		],
		modifiers: {
			sort: [
				{
					type: 'sort',
					direction: 'ascending',
					target: {
						type: 'primitive',
						field: column3,
					},
				},
			],
		},
	};

	const expectedResult: AbstractSqlQuery = {
		clauses: {
			select: [
				{
					type: 'primitive',
					tableIndex,
					column: column1,
					columnIndex: column1Index,
				},
				{
					type: 'primitive',
					tableIndex,
					column: column2,
					columnIndex: column2Index,
				},
			],
			from: {
				table,
				tableIndex,
			},
			joins: [],
			order: [
				{
					type: 'order',
					orderBy: {
						type: 'primitive',
						tableIndex,
						column: column3,
					},
					direction: 'ASC',
				},
			],
		},
		parameters: [],
	};

	const result = convertQuery(query);

	expect(result.rootQuery).toStrictEqual(expectedResult);
});

test('Convert a query with all possible modifiers', () => {
	const store = randomIdentifier();
	const table = randomIdentifier();
	const tableIndex = 0;
	const column1 = randomIdentifier();
	const column1Index = 0;
	const column2 = randomIdentifier();
	const column2Index = 1;
	const column3 = randomIdentifier();

	const limit = randomInteger(1, 100);
	const offset = randomInteger(1, 100);

	const query: AbstractQuery = {
		store: store,
		collection: table,
		fields: [
			{
				type: 'primitive',
				field: column1,
				alias: randomIdentifier(),
			},
			{
				type: 'primitive',
				field: column2,
				alias: randomIdentifier(),
			},
		],
		modifiers: {
			limit: {
				type: 'limit',
				value: limit,
			},
			offset: {
				type: 'offset',
				value: offset,
			},
			sort: [
				{
					type: 'sort',
					direction: 'ascending',
					target: {
						type: 'primitive',
						field: column3,
					},
				},
			],
		},
	};

	const expectedResult: AbstractSqlQuery = {
		clauses: {
			select: [
				{
					type: 'primitive',
					tableIndex,
					column: column1,
					columnIndex: column1Index,
				},
				{
					type: 'primitive',
					tableIndex,
					column: column2,
					columnIndex: column2Index,
				},
			],
			from: {
				table,
				tableIndex,
			},
			joins: [],
			limit: {
				type: 'value',
				parameterIndex: 0,
			},
			offset: {
				type: 'value',
				parameterIndex: 1,
			},
			order: [
				{
					type: 'order',
					orderBy: {
						type: 'primitive',
						tableIndex,
						column: column3,
					},
					direction: 'ASC',
				},
			],
		},
		parameters: [limit, offset],
	};

	const result = convertQuery(query);

	expect(result.rootQuery).toStrictEqual(expectedResult);
});

test('Convert a query with a relational target string filter', () => {
	const store = randomIdentifier();
	const table = randomIdentifier();
	const tableIndex = 0;
	const column1 = randomIdentifier();
	const column1Index = 0;
	const column2 = randomIdentifier();
	const column2Index = 1;
	const keyColumn = randomIdentifier();

	const externalTable = randomIdentifier();
	const externalTableIndex = 1;
	const externalColumn = randomIdentifier();
	const externalColumnValue = randomAlpha(10);
	const externalKeyColumn = randomIdentifier();

	const query: AbstractQuery = {
		store,
		collection: table,
		fields: [
			{
				type: 'primitive',
				field: column1,
				alias: randomIdentifier(),
			},
			{
				type: 'primitive',
				field: column2,
				alias: randomIdentifier(),
			},
		],
		modifiers: {
			filter: {
				type: 'condition',
				condition: {
					type: 'condition-string',
					target: {
						type: 'nested-one-target',
						field: {
							type: 'primitive',
							field: externalColumn,
						},
						nesting: {
							type: 'relational-many',
							local: {
								fields: [keyColumn],
							},
							foreign: {
								store,
								fields: [externalKeyColumn],
								collection: externalTable,
							},
						},
					},
					operation: 'starts_with',
					compareTo: externalColumnValue,
				},
			},
		},
	};

	const expectedResult: AbstractSqlQuery = {
		clauses: {
			select: [
				{
					type: 'primitive',
					tableIndex,
					column: column1,
					columnIndex: column1Index,
				},
				{
					type: 'primitive',
					tableIndex,
					column: column2,
					columnIndex: column2Index,
				},
			],
			from: {
				table,
				tableIndex,
			},
			joins: [
				{
					type: 'join',
					table: externalTable,
					tableIndex: externalTableIndex,
					on: {
						type: 'condition',
						condition: {
							type: 'condition-field',
							target: {
								type: 'primitive',
								tableIndex,
								column: keyColumn,
							},
							operation: 'eq',
							compareTo: {
								type: 'primitive',
								tableIndex: externalTableIndex,
								column: externalKeyColumn,
							},
						},
						negate: false,
					},
				},
			],
			where: {
				type: 'condition',
				negate: false,
				condition: {
					type: 'condition-string',
					target: {
						type: 'primitive',
						tableIndex: externalTableIndex,
						column: externalColumn,
					},
					operation: 'starts_with',
					compareTo: {
						type: 'value',
						parameterIndex: 0,
					},
				},
			},
		},
		parameters: [externalColumnValue],
	};

	const result = convertQuery(query);

	expect(result.rootQuery).toStrictEqual(expectedResult);
});

test('Convert a query with a nested field and filtering on another nested field', () => {
	const store = randomIdentifier();
	const table = randomIdentifier();
	const tableIndex = 0;
	const column = randomIdentifier();
	const columnIndex = 0;
	const keyColumn = randomIdentifier();

	const externalTable = randomIdentifier();
	const externalTableIndex1 = 1;
	const externalTableIndex2 = 2;
	const externalColumn1 = randomIdentifier();
	const externalColumn1Index = 1;
	const externalColumn2 = randomIdentifier();
	const externalColumn2Value = randomAlpha(10);
	const externalKeyColumn = randomIdentifier();

	const query: AbstractQuery = {
		store,
		collection: table,
		fields: [
			{
				type: 'primitive',
				field: column,
				alias: randomIdentifier(),
			},
			{
				type: 'nested-single-one',
				fields: [
					{
						type: 'primitive',
						field: externalColumn1,
						alias: randomIdentifier(),
					},
				],
				alias: randomIdentifier(),
				nesting: {
					type: 'relational-many',
					local: {
						fields: [keyColumn],
					},
					foreign: {
						store,
						fields: [externalKeyColumn],
						collection: externalTable,
					},
				},
			},
		],
		modifiers: {
			filter: {
				type: 'condition',
				condition: {
					type: 'condition-string',
					target: {
						type: 'nested-one-target',
						field: {
							type: 'primitive',
							field: externalColumn2,
						},
						nesting: {
							type: 'relational-many',
							local: {
								fields: [keyColumn],
							},
							foreign: {
								store,
								fields: [externalKeyColumn],
								collection: externalTable,
							},
						},
					},
					operation: 'starts_with',
					compareTo: externalColumn2Value,
				},
			},
		},
	};

	const expectedResult: AbstractSqlQuery = {
		clauses: {
			select: [
				{
					type: 'primitive',
					tableIndex,
					column: column,
					columnIndex: columnIndex,
				},
				{
					type: 'primitive',
					tableIndex: externalTableIndex1,
					column: externalColumn1,
					columnIndex: externalColumn1Index,
				},
			],
			from: {
				table,
				tableIndex,
			},
			joins: [
				{
					type: 'join',
					table: externalTable,
					tableIndex: externalTableIndex1,
					on: {
						type: 'condition',
						condition: {
							type: 'condition-field',
							target: {
								type: 'primitive',
								tableIndex,
								column: keyColumn,
							},
							operation: 'eq',
							compareTo: {
								type: 'primitive',
								tableIndex: externalTableIndex1,
								column: externalKeyColumn,
							},
						},
						negate: false,
					},
				},
				{
					type: 'join',
					table: externalTable,
					tableIndex: externalTableIndex2,
					on: {
						type: 'condition',
						condition: {
							type: 'condition-field',
							target: {
								type: 'primitive',
								tableIndex,
								column: keyColumn,
							},
							operation: 'eq',
							compareTo: {
								type: 'primitive',
								tableIndex: externalTableIndex2,
								column: externalKeyColumn,
							},
						},
						negate: false,
					},
				},
			],
			where: {
				type: 'condition',
				negate: false,
				condition: {
					type: 'condition-string',
					target: {
						type: 'primitive',
						tableIndex: externalTableIndex2,
						column: externalColumn2,
					},
					operation: 'starts_with',
					compareTo: {
						type: 'value',
						parameterIndex: 0,
					},
				},
			},
		},
		parameters: [externalColumn2Value],
	};

	const result = convertQuery(query);

	expect(result.rootQuery).toStrictEqual(expectedResult);
});
