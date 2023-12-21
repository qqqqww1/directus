import type { AbstractQueryFieldNodeNestedSingleMany } from '@directus/data';
import { randomAlpha, randomIdentifier, randomInteger, randomUUID } from '@directus/random';
import { expect, test } from 'vitest';
import type { ConverterResult } from '../../index.js';
import { getNestedMany, type NestedManyResult } from './create-nested-manys.js';

test('getNestedMany with a single identifier', () => {
	const columnIndexToName = (columnIndex: number) => `c${columnIndex}`;

	const tableIndex = randomInteger(0, 100);
	const keyColumn = randomIdentifier();
	const keyColumnIndex = 1;
	const keyColumnValue = randomUUID();

	const externalStore = randomIdentifier();
	const externalTable = randomIdentifier();
	const externalTableIndex = 0;
	const externalForeignKeyColumn = randomIdentifier();
	const externalForeignKeyColumnIndex = 0;
	const externalForeignKeyColumnAlias = randomIdentifier();

	const field: AbstractQueryFieldNodeNestedSingleMany = {
		type: 'nested-single-many',
		fields: [
			{
				type: 'primitive',
				field: externalForeignKeyColumn,
				alias: externalForeignKeyColumnAlias,
			},
		],
		nesting: {
			type: 'relational-many',
			local: {
				fields: [keyColumn],
			},
			foreign: {
				store: externalStore,
				collection: externalTable,
				fields: [externalForeignKeyColumn],
			},
		},
		alias: randomIdentifier(),
		modifiers: {},
	};

	const expectedResult: NestedManyResult = {
		subQuery: expect.any(Function),
		select: [
			{
				type: 'primitive',
				tableIndex,
				column: keyColumn,
				columnIndex: keyColumnIndex,
			},
		],
	};

	const rootRow = { [columnIndexToName(keyColumnIndex)]: keyColumnValue };

	const expectedGeneratedQuery: ConverterResult = {
		rootQuery: {
			clauses: {
				select: [
					{
						type: 'primitive',
						tableIndex: externalTableIndex,
						column: externalForeignKeyColumn,
						columnIndex: externalForeignKeyColumnIndex,
					},
				],
				from: {
					table: externalTable,
					tableIndex: externalTableIndex,
				},
				joins: [],
				where: {
					type: 'condition',
					condition: {
						type: 'condition-string',
						operation: 'eq',
						target: {
							type: 'primitive',
							tableIndex: externalTableIndex,
							column: externalForeignKeyColumn,
						},
						compareTo: {
							type: 'value',
							parameterIndex: 0,
						},
					},
					negate: false,
				},
			},
			parameters: [keyColumnValue],
		},
		subQueries: [],
		aliasMapping: [{ type: 'root', alias: externalForeignKeyColumnAlias, columnIndex: externalForeignKeyColumnIndex }],
	};

	const result = getNestedMany(field, tableIndex);

	expect(result).toStrictEqual(expectedResult);
	expect(result.subQuery(rootRow, columnIndexToName)).toStrictEqual(expectedGeneratedQuery);
});

test('getNestedMany with a multiple identifiers (a composite key)', () => {
	const columnIndexToName = (columnIndex: number) => `c${columnIndex}`;

	const tableIndex = randomInteger(0, 100);
	const keyColumn1 = randomIdentifier();
	const keyColumn1Index = 1;
	const keyColumn1Value = randomUUID();
	const keyColumn2 = randomIdentifier();
	const keyColumn2Index = 2;
	const keyColumn2Value = randomUUID();

	const externalStore = randomIdentifier();
	const externalTable = randomIdentifier();
	const externalTableIndex = 0;
	const externalColumn = randomIdentifier();
	const externalColumnIndex = 0;
	const externalColumnAlias = randomIdentifier();
	const externalForeignKeyColumn1 = randomIdentifier();
	const externalForeignKeyColumn2 = randomIdentifier();

	const field: AbstractQueryFieldNodeNestedSingleMany = {
		type: 'nested-single-many',
		fields: [
			{
				type: 'primitive',
				field: externalColumn,
				alias: externalColumnAlias,
			},
		],
		nesting: {
			type: 'relational-many',
			local: {
				fields: [keyColumn1, keyColumn2],
			},
			foreign: {
				store: externalStore,
				collection: externalTable,
				fields: [externalForeignKeyColumn1, externalForeignKeyColumn2],
			},
		},
		modifiers: {},
		alias: randomIdentifier(),
	};

	const expectedResult: NestedManyResult = {
		subQuery: expect.any(Function),
		select: [
			{
				type: 'primitive',
				tableIndex,
				column: keyColumn1,
				columnIndex: keyColumn1Index,
			},
			{
				type: 'primitive',
				tableIndex,
				column: keyColumn2,
				columnIndex: keyColumn2Index,
			},
		],
	};

	const rootRow = {
		[columnIndexToName(keyColumn1Index)]: keyColumn1Value,
		[columnIndexToName(keyColumn2Index)]: keyColumn2Value,
	};

	const expectedGeneratedQuery: ConverterResult = {
		rootQuery: {
			clauses: {
				select: [
					{
						type: 'primitive',
						tableIndex: externalTableIndex,
						column: externalColumn,
						columnIndex: externalColumnIndex,
					},
				],
				from: {
					table: externalTable,
					tableIndex: externalTableIndex,
				},
				joins: [],
				where: {
					type: 'logical',
					operator: 'and',
					negate: false,
					childNodes: [
						{
							type: 'condition',
							condition: {
								type: 'condition-string',
								operation: 'eq',
								target: {
									type: 'primitive',
									tableIndex: externalTableIndex,
									column: externalForeignKeyColumn1,
								},
								compareTo: {
									type: 'value',
									parameterIndex: 0,
								},
							},
							negate: false,
						},
						{
							type: 'condition',
							condition: {
								type: 'condition-string',
								operation: 'eq',
								target: {
									type: 'primitive',
									tableIndex: externalTableIndex,
									column: externalForeignKeyColumn2,
								},
								compareTo: {
									type: 'value',
									parameterIndex: 1,
								},
							},
							negate: false,
						},
					],
				},
			},
			parameters: [keyColumn1Value, keyColumn2Value],
		},
		subQueries: [],
		aliasMapping: [{ type: 'root', alias: externalColumnAlias, columnIndex: externalColumnIndex }],
	};

	const result = getNestedMany(field, tableIndex);

	expect(result).toStrictEqual(expectedResult);
	expect(result.subQuery(rootRow, columnIndexToName)).toStrictEqual(expectedGeneratedQuery);
});

test('getNestedMany with modifiers', () => {
	const columnIndexToName = (columnIndex: number) => `c${columnIndex}`;

	const tableIndex = randomInteger(0, 100);
	const keyColumn = randomIdentifier();
	const keyColumnIndex = 1;
	const keyColumnValue = randomUUID();

	const externalStore = randomIdentifier();
	const externalTable = randomIdentifier();
	const externalTableIndex = 0;
	const externalForeignKeyColumn = randomIdentifier();
	const externalForeignKeyColumnIndex = 0;
	const externalForeignKeyColumnAlias = randomIdentifier();
	const externalForeignKeyColumnValue = randomUUID();

	const limit = randomInteger(1, 100);

	const field: AbstractQueryFieldNodeNestedSingleMany = {
		type: 'nested-single-many',
		fields: [
			{
				type: 'primitive',
				field: externalForeignKeyColumn,
				alias: externalForeignKeyColumnAlias,
			},
		],
		nesting: {
			type: 'relational-many',
			local: {
				fields: [keyColumn],
			},
			foreign: {
				store: externalStore,
				collection: externalTable,
				fields: [externalForeignKeyColumn],
			},
		},
		modifiers: {
			filter: {
				type: 'condition',
				condition: {
					type: 'condition-string',
					operation: 'starts_with',
					target: {
						type: 'primitive',
						field: externalForeignKeyColumn,
					},
					compareTo: externalForeignKeyColumnValue,
				},
			},
			limit: {
				type: 'limit',
				value: limit,
			},
			sort: [
				{
					type: 'sort',
					direction: 'ascending',
					target: {
						type: 'primitive',
						field: externalForeignKeyColumn,
					},
				},
			],
		},
		alias: randomIdentifier(),
	};

	const expectedResult: NestedManyResult = {
		subQuery: expect.any(Function),
		select: [
			{
				type: 'primitive',
				tableIndex,
				column: keyColumn,
				columnIndex: keyColumnIndex,
			},
		],
	};

	const rootRow = {
		[columnIndexToName(keyColumnIndex)]: keyColumnValue,
		[columnIndexToName(externalForeignKeyColumnIndex)]: externalForeignKeyColumnValue,
	};

	const expectedGeneratedQuery: ConverterResult = {
		rootQuery: {
			clauses: {
				select: [
					{
						type: 'primitive',
						tableIndex: externalTableIndex,
						column: externalForeignKeyColumn,
						columnIndex: externalForeignKeyColumnIndex,
					},
				],
				from: {
					table: externalTable,
					tableIndex: externalTableIndex,
				},
				joins: [],
				where: {
					type: 'logical',
					operator: 'and',
					negate: false,
					childNodes: [
						{
							type: 'condition',
							condition: {
								type: 'condition-string',
								operation: 'starts_with',
								target: {
									type: 'primitive',
									tableIndex: externalTableIndex,
									column: externalForeignKeyColumn,
								},
								compareTo: {
									type: 'value',
									parameterIndex: 0,
								},
							},
							negate: false,
						},
						{
							type: 'condition',
							condition: {
								type: 'condition-string',
								operation: 'eq',
								target: {
									type: 'primitive',
									tableIndex: externalTableIndex,
									column: externalForeignKeyColumn,
								},
								compareTo: {
									type: 'value',
									parameterIndex: 2,
								},
							},
							negate: false,
						},
					],
				},
				limit: {
					type: 'value',
					parameterIndex: 1,
				},
				order: [
					{
						type: 'order',
						orderBy: {
							type: 'primitive',
							tableIndex: externalTableIndex,
							column: externalForeignKeyColumn,
						},
						direction: 'ASC',
					},
				],
			},

			parameters: [externalForeignKeyColumnValue, limit, keyColumnValue],
		},
		subQueries: [],
		aliasMapping: [{ type: 'root', alias: externalForeignKeyColumnAlias, columnIndex: externalForeignKeyColumnIndex }],
	};

	const result = getNestedMany(field, tableIndex);

	expect(result).toStrictEqual(expectedResult);
	expect(result.subQuery(rootRow, columnIndexToName)).toStrictEqual(expectedGeneratedQuery);
});

test('getNestedMany with nested modifiers', () => {
	const columnIndexToName = (columnIndex: number) => `c${columnIndex}`;

	const tableIndex = randomInteger(0, 100);
	const keyColumn = randomIdentifier();
	const keyColumnIndex = 1;
	const keyColumnValue = randomUUID();

	const externalStore = randomIdentifier();
	const externalTable = randomIdentifier();
	const externalTableIndex = 0;
	const externalColumn = randomIdentifier();
	const externalColumnIndex = 0;
	const externalColumnAlias = randomIdentifier();
	const externalForeignKeyColumn = randomIdentifier();
	const externalNestedForeignKeyColumn = randomIdentifier();

	const nestedStore = randomIdentifier();
	const nestedTable = randomIdentifier();
	const nestedTableIndex = 1;
	const nestedColumn = randomIdentifier();
	const nestedColumnValue = randomAlpha(10);
	const nestedKeyColumn = randomIdentifier();

	const limit = randomInteger(1, 100);

	const field: AbstractQueryFieldNodeNestedSingleMany = {
		type: 'nested-single-many',
		fields: [
			{
				type: 'primitive',
				field: externalColumn,
				alias: externalColumnAlias,
			},
		],
		alias: randomIdentifier(),
		nesting: {
			type: 'relational-many',
			local: {
				fields: [keyColumn],
			},
			foreign: {
				store: externalStore,
				collection: externalTable,
				fields: [externalForeignKeyColumn],
			},
		},
		modifiers: {
			filter: {
				type: 'condition',
				condition: {
					type: 'condition-string',
					operation: 'starts_with',
					target: {
						type: 'nested-one-target',
						field: {
							type: 'primitive',
							field: nestedColumn,
						},
						nesting: {
							type: 'relational-many',
							local: {
								fields: [externalNestedForeignKeyColumn],
							},
							foreign: {
								store: nestedStore,
								collection: nestedTable,
								fields: [nestedKeyColumn],
							},
						},
					},
					compareTo: nestedColumnValue,
				},
			},
			limit: {
				type: 'limit',
				value: limit,
			},
		},
	};

	const expectedResult: NestedManyResult = {
		subQuery: expect.any(Function),
		select: [
			{
				type: 'primitive',
				tableIndex,
				column: keyColumn,
				columnIndex: keyColumnIndex,
			},
		],
	};

	const expectedGeneratedQuery: ConverterResult = {
		rootQuery: {
			clauses: {
				select: [
					{
						type: 'primitive',
						tableIndex: externalTableIndex,
						column: externalColumn,
						columnIndex: externalColumnIndex,
					},
				],
				from: {
					table: externalTable,
					tableIndex: externalTableIndex,
				},
				joins: [
					{
						type: 'join',
						table: nestedTable,
						tableIndex: nestedTableIndex,
						on: {
							type: 'condition',
							condition: {
								type: 'condition-field',
								compareTo: {
									type: 'primitive',
									tableIndex: nestedTableIndex,
									column: nestedKeyColumn,
								},
								operation: 'eq',
								target: {
									type: 'primitive',
									tableIndex: externalTableIndex,
									column: externalNestedForeignKeyColumn,
								},
							},
							negate: false,
						},
					},
				],
				where: {
					type: 'logical',
					operator: 'and',
					negate: false,
					childNodes: [
						{
							type: 'condition',
							condition: {
								type: 'condition-string',
								operation: 'starts_with',
								target: {
									type: 'primitive',
									tableIndex: nestedTableIndex,
									column: nestedColumn,
								},
								compareTo: {
									type: 'value',
									parameterIndex: 0,
								},
							},
							negate: false,
						},
						{
							type: 'condition',
							condition: {
								type: 'condition-string',
								operation: 'eq',
								target: {
									type: 'primitive',
									tableIndex: externalTableIndex,
									column: externalForeignKeyColumn,
								},
								compareTo: {
									type: 'value',
									parameterIndex: 2,
								},
							},
							negate: false,
						},
					],
				},
				limit: {
					type: 'value',
					parameterIndex: 1,
				},
			},
			parameters: [nestedColumnValue, limit, keyColumnValue],
		},
		subQueries: [],
		aliasMapping: [
			{
				type: 'root',
				alias: externalColumnAlias,
				columnIndex: externalColumnIndex,
			},
		],
	};

	const rootResultRow = { [columnIndexToName(keyColumnIndex)]: keyColumnValue };

	const result = getNestedMany(field, tableIndex);

	expect(result).toStrictEqual(expectedResult);
	expect(result.subQuery(rootResultRow, columnIndexToName)).toStrictEqual(expectedGeneratedQuery);
});
