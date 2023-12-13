import type { AbstractSqlQuerySelectPrimitiveNode } from '../../types/index.js';

/**
 * @param tableIndex
 * @param field
 * @param columnIndex
 * @returns the converted primitive node
 */
export const createPrimitiveSelect = (
	tableIndex: number,
	column: string,
	columnIndex: number,
): AbstractSqlQuerySelectPrimitiveNode => {
	const primitive: AbstractSqlQuerySelectPrimitiveNode = {
		type: 'primitive',
		tableIndex,
		column,
		columnIndex,
	};

	return primitive;
};
