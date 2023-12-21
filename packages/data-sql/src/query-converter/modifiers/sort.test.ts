import type { AbstractQueryNodeSort, AtLeastOneElement } from '@directus/data';
import { randomIdentifier, randomInteger } from '@directus/random';
import { expect, test } from 'vitest';
import { createIndexGenerators } from '../../utils/create-index-generators.js';
import { convertSort, type SortConversionResult } from './sort.js';

test('convert ascending sort with a single field', () => {
	const tableIndex = randomInteger(0, 100);
	const column = randomIdentifier();

	const sorts: AtLeastOneElement<AbstractQueryNodeSort> = [
		{
			type: 'sort',
			direction: 'ascending',
			target: {
				type: 'primitive',
				field: column,
			},
		},
	];

	const expectedResult: SortConversionResult = {
		clauses: {
			joins: [],
			order: [
				{
					type: 'order',
					orderBy: {
						type: 'primitive',
						tableIndex,
						column,
					},
					direction: 'ASC',
				},
			],
		},
	};

	const indexGen = createIndexGenerators();
	const result = convertSort(sorts, tableIndex, indexGen);

	expect(result).toStrictEqual(expectedResult);
});

test('convert descending sort with a single field', () => {
	const tableIndex = randomInteger(0, 100);
	const column = randomIdentifier();

	const sorts: AtLeastOneElement<AbstractQueryNodeSort> = [
		{
			type: 'sort',
			direction: 'descending',
			target: {
				type: 'primitive',
				field: column,
			},
		},
	];

	const expectedResult: SortConversionResult = {
		clauses: {
			joins: [],
			order: [
				{
					type: 'order',
					orderBy: {
						type: 'primitive',
						tableIndex,
						column,
					},
					direction: 'DESC',
				},
			],
		},
	};

	const indexGen = createIndexGenerators();
	const result = convertSort(sorts, tableIndex, indexGen);

	expect(result).toStrictEqual(expectedResult);
});

test('convert ascending sort with multiple fields', () => {
	const tableIndex = randomInteger(0, 100);
	const column1 = randomIdentifier();
	const column2 = randomIdentifier();

	const sorts: AtLeastOneElement<AbstractQueryNodeSort> = [
		{
			type: 'sort',
			direction: 'ascending',
			target: {
				type: 'primitive',
				field: column1,
			},
		},
		{
			type: 'sort',
			direction: 'descending',
			target: {
				type: 'primitive',
				field: column2,
			},
		},
	];

	const expectedResult: SortConversionResult = {
		clauses: {
			joins: [],
			order: [
				{
					type: 'order',
					orderBy: {
						type: 'primitive',
						tableIndex,
						column: column1,
					},
					direction: 'ASC',
				},
				{
					type: 'order',
					orderBy: {
						type: 'primitive',
						tableIndex,
						column: column2,
					},
					direction: 'DESC',
				},
			],
		},
	};

	const indexGen = createIndexGenerators();
	const result = convertSort(sorts, tableIndex, indexGen);

	expect(result).toStrictEqual(expectedResult);
});

test('convert sort on nested item', () => {
	const tableIndex = randomInteger(0, 100);
	const column = randomIdentifier();

	const externalStore = randomIdentifier();
	const externalTable = randomIdentifier();
	const externalTableIndex = 0;
	const externalColumn = randomIdentifier();
	const externalKeyColumn = randomIdentifier();

	const sorts: AtLeastOneElement<AbstractQueryNodeSort> = [
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
	];

	const expectedResult: SortConversionResult = {
		clauses: {
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
		},
	};

	const indexGen = createIndexGenerators();
	const result = convertSort(sorts, tableIndex, indexGen);

	expect(result).toStrictEqual(expectedResult);
});
