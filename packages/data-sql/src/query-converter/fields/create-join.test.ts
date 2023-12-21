import type { AbstractQueryFieldNodeNestedRelationalMany } from '@directus/data';
import { randomIdentifier, randomInteger } from '@directus/random';
import { expect, test } from 'vitest';
import type { AbstractSqlQueryJoinNode } from '../../types/index.js';
import { createJoin } from './create-join.js';

test('Convert m2o relation on single field ', () => {
	const tableIndex = randomInteger(0, 100);
	const column = randomIdentifier();

	const externalStore = randomIdentifier();
	const externalTable = randomIdentifier();
	const externalTableIndex = randomInteger(0, 100);
	const externalColumn = randomIdentifier();

	const relationalField: AbstractQueryFieldNodeNestedRelationalMany = {
		type: 'relational-many',
		local: {
			fields: [column],
		},
		foreign: {
			store: externalStore,
			collection: externalTable,
			fields: [externalColumn],
		},
	};

	const expectedResult: AbstractSqlQueryJoinNode = {
		type: 'join',
		table: externalTable,
		tableIndex: externalTableIndex,
		on: {
			type: 'condition',
			condition: {
				type: 'condition-field',
				target: {
					type: 'primitive',
					tableIndex: tableIndex,
					column: column,
				},
				operation: 'eq',
				compareTo: {
					type: 'primitive',
					tableIndex: externalTableIndex,
					column: externalColumn,
				},
			},
			negate: false,
		},
	};

	const result = createJoin(relationalField, tableIndex, externalTableIndex);

	expect(result).toStrictEqual(expectedResult);
});

test('Convert m2o relation with composite keys', () => {
	const tableIndex = randomInteger(0, 100);
	const column1 = randomIdentifier();
	const column2 = randomIdentifier();

	const externalStore = randomIdentifier();
	const externalTable = randomIdentifier();
	const externalTableIndex = randomInteger(0, 100);
	const externalColumn1 = randomIdentifier();
	const externalColumn2 = randomIdentifier();

	const relationalField: AbstractQueryFieldNodeNestedRelationalMany = {
		type: 'relational-many',
		local: {
			fields: [column1, column2],
		},
		foreign: {
			store: externalStore,
			collection: externalTable,
			fields: [externalColumn1, externalColumn2],
		},
	};

	const expectedResult: AbstractSqlQueryJoinNode = {
		type: 'join',
		table: externalTable,
		tableIndex: externalTableIndex,
		on: {
			type: 'logical',
			operator: 'and',
			negate: false,
			childNodes: [
				{
					type: 'condition',
					condition: {
						type: 'condition-field',
						target: {
							type: 'primitive',
							tableIndex: tableIndex,
							column: column1,
						},
						operation: 'eq',
						compareTo: {
							type: 'primitive',
							tableIndex: externalTableIndex,
							column: externalColumn1,
						},
					},
					negate: false,
				},
				{
					type: 'condition',
					condition: {
						type: 'condition-field',
						target: {
							type: 'primitive',
							tableIndex: tableIndex,
							column: column2,
						},
						operation: 'eq',
						compareTo: {
							type: 'primitive',
							tableIndex: externalTableIndex,
							column: externalColumn2,
						},
					},
					negate: false,
				},
			],
		},
	};

	const result = createJoin(relationalField, tableIndex, externalTableIndex);

	expect(result).toStrictEqual(expectedResult);
});
