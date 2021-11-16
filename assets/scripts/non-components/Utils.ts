export class Position {
    row: number;
    column: number;

    constructor(row: number = 0, column: number = 0) {
        this.row = row;
        this.column = column;
    }

    addPosition(otherPosition: Position): Position {
        return new Position(this.row + otherPosition.row, this.column + otherPosition.column);
    }
}

export class Utils {
    static init2dArray<T>(rowCount: number, columnCount: number, value: T = null): T[][] {
        let result: T[][] = [];

        for (let row = 0; row < rowCount; row++) {
            result[row] = [];
            for (let col = 0; col < columnCount; col++) {
                result[row][col] = value;
            }
        }

        return result;
    }

    static initArrayByFunction<T>(count: number, getValue: () => T): T[] {
        let result: T[] = [];

        for (let i = 0; i < count; i++) {
            result[i] = getValue();
        }

        return result;
    }

    static initArray<T>(count: number, value: T = null): T[] {
        return this.initArrayByFunction(count, () => value);
    }
}