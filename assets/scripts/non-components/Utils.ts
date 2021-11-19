export interface IEqutable<T> {
    equal(other: T): boolean;
}

export class Position implements IEqutable<Position> {
    row: number;
    column: number;

    constructor(row: number = 0, column: number = 0) {
        this.row = row;
        this.column = column;
    }

    addPosition(otherPosition: Position): Position {
        return new Position(this.row + otherPosition.row, this.column + otherPosition.column);
    }

    equal(other: Position): boolean {
        return this.row == other.row && this.column == other.column;
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

    static mergeArraysWithoutDuplicates<T extends IEqutable<T>>(array1: T[], array2: T[]): T[] {
        let result: T[] = [];

        array1.forEach(element => {
            result.push(element);
        });

        array2.forEach(element => {
            if (!this.arrayContainsValue(result, element)) {
                result.push(element);
            }
        });

        return result;
    }

    static arrayContainsValue<T extends IEqutable<T>>(array: T[], value: T): boolean {
        let finded = false;
        array.forEach(element => {
            if (element.equal(value)) {
                finded = true;
            }
        });

        return finded;
    }
}