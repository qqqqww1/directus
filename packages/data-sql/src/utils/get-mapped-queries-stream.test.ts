import { expect, test, vi } from 'vitest';
import { getMappedQueriesStream } from './get-mapped-queries-stream.js';
import type { AliasMapping, SubQuery } from '../index.js';
import { ReadableStream } from 'node:stream/web';
import { randomAlpha, randomIdentifier } from '@directus/random';
import { readToEnd } from './stream-consumer.js';
import { randomUUID } from 'crypto';

function getStreamMock(data: Record<string, unknown>[]): ReadableStream<Record<string, unknown>> {
	return new ReadableStream({
		start(controller) {
			data.forEach((chunk) => controller.enqueue(chunk));
			controller.close();
		},
	});
}

test('nested-many', async () => {
	const columnIndexToName = (columnIndex: number) => `c${columnIndex}`;

	//@todo randomize the values
	const keyColumn = randomIdentifier();
	const keyColumnIndex = 0;
	const keyColumnValue1 = randomUUID();
	const keyColumnValue2 = randomUUID();
	const column = randomIdentifier();
	const columnIndex = 1;
	const columnValue1 = randomAlpha(10);
	const columnValue2 = randomAlpha(10);

	const externalTable = randomIdentifier();
	const externalTableIndex = 0;
	const externalColumn = randomIdentifier();
	const externalColumnIndex = 0;
	const externalColumnValue1 = randomAlpha(10);
	const externalColumnValue2 = randomAlpha(10);
	const foreignFieldValue3 = randomAlpha(10);

	const rootStream = getStreamMock([
		{
			[columnIndexToName(keyColumnIndex)]: keyColumnValue1,
			[columnIndexToName(columnIndex)]: columnValue1,
		},
		{
			[columnIndexToName(keyColumnIndex)]: keyColumnValue2,
			[columnIndexToName(columnIndex)]: columnValue2,
		},
	]);

	const subQuery: SubQuery = () => {
		return {
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
				},
				parameters: [],
			},
			subQueries: [],
			aliasMapping: [{ type: 'root', alias: externalColumn, columnIndex: externalColumnIndex }],
		};
	};

	const firstDatabaseResponse = [
		{
			[columnIndexToName(externalColumnIndex)]: externalColumnValue1,
		},
		{
			[columnIndexToName(externalColumnIndex)]: externalColumnValue2,
		},
	];

	const secondDatabaseResponse = [
		{
			[columnIndexToName(externalColumnIndex)]: foreignFieldValue3,
		},
	];

	const queryDataBaseMockFn = vi
		.fn()
		.mockResolvedValueOnce(getStreamMock(firstDatabaseResponse))
		.mockResolvedValueOnce(getStreamMock(secondDatabaseResponse));

	const aliasMapping: AliasMapping = [
		{ type: 'root', alias: keyColumn, columnIndex: keyColumnIndex },
		{ type: 'root', alias: column, columnIndex: columnIndex },
		{ type: 'sub', alias: externalTable, index: 0 },
	];

	const resultingStream = getMappedQueriesStream(
		rootStream,
		[subQuery],
		aliasMapping,
		columnIndexToName,
		queryDataBaseMockFn,
	);

	const actualResult = await readToEnd(resultingStream);

	const expectedResult = [
		{
			[keyColumn]: keyColumnValue1,
			[column]: columnValue1,
			[externalTable]: [
				{
					[externalColumn]: externalColumnValue1,
				},
				{
					[externalColumn]: externalColumnValue2,
				},
			],
		},
		{
			[keyColumn]: keyColumnValue2,
			[column]: columnValue2,
			[externalTable]: [
				{
					[externalColumn]: foreignFieldValue3,
				},
			],
		},
	];

	expect(actualResult).toEqual(expectedResult);
});
