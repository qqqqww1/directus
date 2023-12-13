export interface AbstractSqlQueryPrimitiveNode {
	type: 'primitive';

	tableIndex: number;
	column: string;
}
