import type { AbstractQueryFieldNode } from '@directus/data';
import { randomIdentifier, randomInteger } from '@directus/random';
import { expect, test } from 'vitest';
import { createIndexGenerators } from '../../utils/create-index-generators.js';
import { convertFieldNodes, type FieldConversionResult } from './fields.js';

test('primitives only', () => {
	const tableIndex = randomInteger(0, 100);
	const column1 = randomIdentifier();
	const column1Index = 0;
	const column1Alias = randomIdentifier();
	const column2 = randomIdentifier();
	const column2Index = 1;
	const column2Alias = randomIdentifier();

	const fields: AbstractQueryFieldNode[] = [
		{
			type: 'primitive',
			field: column1,
			alias: column1Alias,
		},
		{
			type: 'primitive',
			field: column2,
			alias: column2Alias,
		},
	];

	const expectedResult: FieldConversionResult = {
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
			joins: [],
		},
		parameters: [],
		aliasMapping: [
			{ type: 'root', alias: column1Alias, columnIndex: column1Index },
			{ type: 'root', alias: column2Alias, columnIndex: column2Index },
		],
		subQueries: [],
	};

	const indexGen = createIndexGenerators();
	const result = convertFieldNodes(fields, tableIndex, indexGen);

	expect(result).toStrictEqual(expectedResult);
});

test('primitive, fn', () => {
	const tableIndex = randomInteger(0, 100);
	const column1 = randomIdentifier();
	const column1Index = 0;
	const column1Alias = randomIdentifier();
	const column2 = randomIdentifier();
	const column2Index = 1;
	const column2Alias = randomIdentifier();

	const fields: AbstractQueryFieldNode[] = [
		{
			type: 'primitive',
			field: column1,
			alias: column1Alias,
		},
		{
			type: 'fn',
			fn: {
				type: 'extractFn',
				fn: 'month',
			},
			field: column2,
			alias: column2Alias,
		},
	];

	const expectedResult: FieldConversionResult = {
		clauses: {
			select: [
				{
					type: 'primitive',
					tableIndex,
					column: column1,
					columnIndex: column1Index,
				},
				{
					type: 'fn',
					fn: {
						type: 'extractFn',
						fn: 'month',
					},
					tableIndex,
					column: column2,
					columnIndex: column2Index,
				},
			],
			joins: [],
		},
		parameters: [],
		aliasMapping: [
			{ type: 'root', alias: column1Alias, columnIndex: column1Index },
			{ type: 'root', alias: column2Alias, columnIndex: column2Index },
		],
		subQueries: [],
	};

	const indexGen = createIndexGenerators();
	const result = convertFieldNodes(fields, tableIndex, indexGen);

	expect(result).toStrictEqual(expectedResult);
});

test('primitive, fn, m2o', () => {
	const tableIndex = randomInteger(0, 100);
	const column1 = randomIdentifier();
	const column1Index = 0;
	const column1Alias = randomIdentifier();
	const column2 = randomIdentifier();
	const column2Index = 2;
	const column2Alias = randomIdentifier();
	const foreignKeyColumn = randomIdentifier();

	const externalStore = randomIdentifier();
	const externalTable = randomIdentifier();
	const externalTableIndex = 0;
	const externalAlias = randomIdentifier();
	const externalColumn = randomIdentifier();
	const externalColumnIndex = 1;
	const externalColumnAlias = randomIdentifier();
	const externalKeyColumn = randomIdentifier();

	const fields: AbstractQueryFieldNode[] = [
		{
			type: 'primitive',
			field: column1,
			alias: column1Alias,
		},
		{
			type: 'nested-single-one',
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
					fields: [foreignKeyColumn],
				},
				foreign: {
					store: externalStore,
					collection: externalTable,
					fields: [externalKeyColumn],
				},
			},
			alias: externalAlias,
		},
		{
			type: 'fn',
			fn: {
				type: 'extractFn',
				fn: 'month',
			},
			field: column2,
			alias: column2Alias,
		},
	];

	const expectedResult: FieldConversionResult = {
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
					tableIndex: externalTableIndex,
					column: externalColumn,
					columnIndex: externalColumnIndex,
				},
				{
					type: 'fn',
					fn: {
						type: 'extractFn',
						fn: 'month',
					},
					tableIndex,
					column: column2,
					columnIndex: column2Index,
				},
			],
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
								column: foreignKeyColumn,
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
		},
		parameters: [],
		aliasMapping: [
			{
				type: 'root',
				alias: column1Alias,
				columnIndex: column1Index,
			},
			{
				type: 'nested',
				alias: externalAlias,
				children: [{ type: 'root', alias: externalColumnAlias, columnIndex: externalColumnIndex }],
			},
			{
				type: 'root',
				alias: column2Alias,
				columnIndex: column2Index,
			},
		],
		subQueries: [],
	};

	const indexGen = createIndexGenerators();
	const result = convertFieldNodes(fields, tableIndex, indexGen);

	expect(result).toStrictEqual(expectedResult);
});

test('primitive, o2m', () => {
	const tableIndex = randomInteger(0, 100);
	const column = randomIdentifier();
	const columnIndex = 0;
	const columnAlias = randomIdentifier();
	const keyColumn = randomIdentifier();
	const keyColumnIndex = 1;

	const externalStore = randomIdentifier();
	const externalCollection = randomIdentifier();
	const externalAlias = randomIdentifier();
	const externalColumn = randomIdentifier();
	const externalColumnAlias = randomIdentifier();
	const externalForeignKeyColumn = randomIdentifier();

	const fields: AbstractQueryFieldNode[] = [
		{
			type: 'primitive',
			field: column,
			alias: columnAlias,
		},
		{
			type: 'nested-single-many',
			fields: [
				{
					type: 'primitive',
					field: externalColumn,
					alias: externalColumnAlias,
				},
			],
			alias: externalAlias,
			nesting: {
				type: 'relational-many',

				local: {
					fields: [keyColumn],
				},
				foreign: {
					store: externalStore,
					collection: externalCollection,
					fields: [externalForeignKeyColumn],
				},
			},
			modifiers: {},
		},
	];

	const expectedResult: FieldConversionResult = {
		clauses: {
			select: [
				{
					type: 'primitive',
					tableIndex,
					column,
					columnIndex,
				},
				{
					type: 'primitive',
					tableIndex,
					column: keyColumn,
					columnIndex: keyColumnIndex,
				},
			],
			joins: [],
		},
		parameters: [],
		aliasMapping: [
			{
				type: 'root',
				alias: columnAlias,
				columnIndex: columnIndex,
			},
			{
				type: 'sub',
				alias: externalAlias,
				index: 0,
			},
		],
		subQueries: [expect.any(Function)],
	};

	const indexGen = createIndexGenerators();
	const result = convertFieldNodes(fields, tableIndex, indexGen);

	expect(result).toStrictEqual(expectedResult);
});
