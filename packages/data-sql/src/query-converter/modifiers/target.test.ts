import type { AbstractQueryTargetNestedOne, ConditionNumberNode, ConditionStringNode } from '@directus/data';
import { randomAlpha, randomIdentifier, randomInteger } from '@directus/random';
import { expect, test } from 'vitest';
import { createIndexGenerators } from '../../utils/create-index-generators.js';
import { convertNestedOneTarget, convertTarget, type TargetConversionResult } from './target.js';

test('convert primitive target', () => {
	const tableIndex = randomInteger(0, 100);
	const column = randomIdentifier();
	const columnValue = randomAlpha(10);

	const condition: ConditionStringNode = {
		type: 'condition-string',
		operation: 'eq',
		target: {
			type: 'primitive',
			field: column,
		},
		compareTo: columnValue,
	};

	const expectedResult: TargetConversionResult = {
		value: {
			type: 'primitive',
			column: column,
			tableIndex,
		},
		joins: [],
	};

	const indexGen = createIndexGenerators();
	const result = convertTarget(condition.target, tableIndex, indexGen);

	expect(result).toStrictEqual(expectedResult);
});

test('convert function target', () => {
	const tableIndex = randomInteger(0, 100);
	const column = randomIdentifier();
	const columnValue = randomInteger(1, 100);

	const condition: ConditionNumberNode = {
		type: 'condition-number',
		operation: 'eq',
		target: {
			type: 'fn',
			field: column,
			fn: {
				type: 'extractFn',
				fn: 'year',
				isTimestampType: false,
			},
		},
		compareTo: columnValue,
	};

	const expectedResult: TargetConversionResult = {
		value: {
			type: 'fn',
			fn: {
				type: 'extractFn',
				fn: 'year',
				isTimestampType: false,
			},
			column: column,
			tableIndex,
		},
		joins: [],
	};

	const indexGen = createIndexGenerators();
	const result = convertTarget(condition.target, tableIndex, indexGen);

	expect(result).toStrictEqual(expectedResult);
});

test('convert nested target', () => {
	const tableIndex = randomInteger(0, 100);
	const column = randomIdentifier();

	const externalStore = randomIdentifier();
	const externalTable = randomIdentifier();
	const externalTableIndex = 0;
	const externalColumn = randomIdentifier();
	const externalKeyColumn = randomIdentifier();

	const nestedTarget: AbstractQueryTargetNestedOne = {
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
	};

	const expectedResult: TargetConversionResult = {
		value: {
			type: 'primitive',
			tableIndex: externalTableIndex,
			column: externalColumn,
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
	};

	const indexGen = createIndexGenerators();
	const result = convertNestedOneTarget(nestedTarget, tableIndex, indexGen);

	expect(result).toStrictEqual(expectedResult);
});
