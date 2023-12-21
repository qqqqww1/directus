import type { AbstractQueryModifiers } from '@directus/data';
import { randomIdentifier, randomInteger } from '@directus/random';
import { expect, test } from 'vitest';
import { createIndexGenerators } from '../../utils/create-index-generators.js';
import { convertModifiers, type ModifierConversionResult } from './modifiers.js';

test('Convert primitive filter', () => {
	const tableIndex = randomInteger(0, 100);
	const column = randomIdentifier();
	const columnValue = randomInteger(1, 100);

	const modifiers: AbstractQueryModifiers = {
		filter: {
			type: 'condition',

			condition: {
				type: 'condition-number',

				operation: 'eq',
				target: {
					type: 'primitive',
					field: column,
				},
				compareTo: columnValue,
			},
		},
	};

	const expectedResult: ModifierConversionResult = {
		clauses: {
			where: {
				type: 'condition',
				negate: false,
				condition: {
					type: 'condition-number',
					operation: 'eq',
					target: {
						type: 'primitive',
						tableIndex,
						column,
					},
					compareTo: {
						type: 'value',
						parameterIndex: 0,
					},
				},
			},
		},
		parameters: [columnValue],
	};

	const indexGen = createIndexGenerators();
	const result = convertModifiers(modifiers, tableIndex, indexGen);

	expect(result).toStrictEqual(expectedResult);
});

test('Convert nested, primitive filter', () => {
	const tableIndex = randomInteger(0, 100);
	const column = randomIdentifier();

	const externalStore = randomIdentifier();
	const externalTable = randomIdentifier();
	const externalTableIndex = 0;
	const externalColumn = randomIdentifier();
	const externalColumnValue = randomInteger(1, 100);
	const externalKeyColumn = randomIdentifier();

	const modifiers: AbstractQueryModifiers = {
		filter: {
			type: 'condition',

			condition: {
				type: 'condition-number',

				operation: 'eq',
				target: {
					type: 'nested-one-target',
					field: {
						type: 'primitive',
						field: externalColumn,
					},
					nesting: {
						type: 'relational-many',
						local: {
							fields: [column],
						},
						foreign: {
							store: externalStore,
							collection: externalTable,
							fields: [externalKeyColumn],
						},
					},
				},
				compareTo: externalColumnValue,
			},
		},
	};

	const expectedResult: ModifierConversionResult = {
		clauses: {
			where: {
				type: 'condition',
				negate: false,
				condition: {
					type: 'condition-number',
					operation: 'eq',
					target: {
						type: 'primitive',
						tableIndex: externalTableIndex,
						column: externalColumn,
					},
					compareTo: {
						type: 'value',
						parameterIndex: 0,
					},
				},
			},
			joins: [
				{
					type: 'join',
					table: externalTable,
					tableIndex: externalTableIndex,
					on: {
						type: 'condition',
						negate: false,
						condition: {
							type: 'condition-field',
							target: {
								type: 'primitive',
								tableIndex,
								column: column,
							},
							operation: 'eq',
							compareTo: {
								type: 'primitive',
								tableIndex: externalTableIndex,
								column: externalKeyColumn,
							},
						},
					},
				},
			],
		},
		parameters: [externalColumnValue],
	};

	const indexGen = createIndexGenerators();
	const result = convertModifiers(modifiers, tableIndex, indexGen);

	expect(result).toStrictEqual(expectedResult);
});

test.only('Convert nested sort', () => {
	const tableIndex = randomInteger(0, 100);
	const column = randomIdentifier();

	const externalStore = randomIdentifier();
	const externalTable = randomIdentifier();
	const externalTableIndex = 0;
	const externalColumn = randomIdentifier();
	const externalKeyColumn = randomIdentifier();

	const modifiers: AbstractQueryModifiers = {
		sort: [
			{
				type: 'sort',
				direction: 'ascending',
				target: {
					type: 'nested-one-target',
					field: {
						type: 'primitive',
						field: externalColumn,
					},
					nesting: {
						type: 'relational-many',
						local: {
							fields: [column],
						},
						foreign: {
							store: externalStore,
							collection: externalTable,
							fields: [externalKeyColumn],
						},
					},
				},
			},
		],
	};

	const expectedResult: ModifierConversionResult = {
		clauses: {
			order: [
				{
					type: 'order',
					orderBy: {
						type: 'primitive',
						tableIndex: externalTableIndex,
						column: externalColumn,
					},
					direction: 'ASC',
				},
			],
			joins: [
				{
					type: 'join',
					table: externalTable,
					tableIndex: externalTableIndex,
					on: {
						type: 'condition',
						negate: false,
						condition: {
							type: 'condition-field',
							target: {
								type: 'primitive',
								tableIndex,
								column,
							},
							operation: 'eq',
							compareTo: {
								type: 'primitive',
								tableIndex: externalTableIndex,
								column: externalKeyColumn,
							},
						},
					},
				},
			],
		},
		parameters: [],
	};

	const indexGen = createIndexGenerators();
	const result = convertModifiers(modifiers, tableIndex, indexGen);

	expect(result).toStrictEqual(expectedResult);
});
