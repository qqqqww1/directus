import type { AbstractQueryFunction } from '@directus/data';
import { randomAlpha, randomIdentifier, randomInteger } from '@directus/random';
import { describe, expect, test } from 'vitest';
import type { AbstractSqlQueryFnNode } from '../../types/index.js';
import { convertFn } from './function.js';
import { createIndexGenerators } from '../../utils/create-index-generators.js';

describe('Convert function', () => {
	test('With no args', () => {
		const tableIndex = randomInteger(0, 100);
		const column = randomIdentifier();

		const sampleAbstractFn: AbstractQueryFunction = {
			type: 'fn',
			fn: {
				type: 'extractFn',
				fn: 'month',
			},
			field: column,
		};

		const indexGen = createIndexGenerators();
		const result = convertFn(tableIndex, sampleAbstractFn, indexGen);

		const expectedFn: AbstractSqlQueryFnNode = {
			type: 'fn',
			fn: {
				type: 'extractFn',
				fn: 'month',
			},
			tableIndex: tableIndex,
			column,
		};

		expect(result).toStrictEqual({
			fn: expectedFn,
			parameters: [],
		});
	});

	test('With args', () => {
		const tableIndex = randomInteger(0, 100);
		const column = randomIdentifier();

		const argument1 = randomAlpha(10);
		const argument2 = randomAlpha(10);

		const sampleFn: AbstractQueryFunction = {
			type: 'fn',
			fn: {
				type: 'extractFn',
				fn: 'month',
			},
			field: column,
			args: [argument1, argument2],
		};

		const indexGen = createIndexGenerators();
		const result = convertFn(tableIndex, sampleFn, indexGen);

		const expectedFn: AbstractSqlQueryFnNode = {
			type: 'fn',
			fn: {
				type: 'extractFn',
				fn: 'month',
			},
			tableIndex: tableIndex,
			column: column,
			arguments: {
				type: 'values',
				parameterIndexes: [0, 1],
			},
		};

		expect(result).toStrictEqual({
			fn: expectedFn,
			parameters: [argument1, argument2],
		});
	});
});
