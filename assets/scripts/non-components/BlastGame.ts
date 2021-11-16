import { Position, Utils } from "./Utils";

export class BlastGame {
    readonly height: number;
    readonly width: number;
    readonly colorsCount: number;
    readonly maxReshuffleCount: number;
    readonly minCombinationCount: number;

    tiles: number[][];

    removeTileEvent: (position: Position) => void;
    fallTileEvent: (position: Position) => void;
    createTileEvent: (position: Position, type: number) => void;
    stateChangedEvent: () => void;

    constructor(
        height: number,
        width: number,
        colorsCount: number,
        maxReshuffleCount: number,
        minCombinationCount: number) {
        this.height = height;
        this.width = width;
        this.colorsCount = colorsCount;
        this.maxReshuffleCount = maxReshuffleCount;
        this.minCombinationCount = minCombinationCount;

        this.tiles = Utils.init2dArray(this.height, this.width, 0);
        for (let row = 0; row < this.height; row++) {
            for (let column = 0; column < this.width; column++) {
                this.tiles[row][column] = this.getRandomTile();
            }
        }
    }

    private getRandomTile(): number {
        return Math.floor(Math.random() * this.colorsCount);
    }

    public tapTile(position: Position) {
        let combination = this.getCombination(position);

        if (combination.length >= this.minCombinationCount) {
            this.removeTiles(combination);
            this.fallTiles();
            this.filleEmptyTiles();
            this.stateChangedEvent();
        }
    }

    private getCombination(start: Position): Position[] {
        let result: Position[] = [];

        let stack: Position[] = [];
        let used: Boolean[][] = Utils.init2dArray(this.height, this.width, false);

        stack.push(start);
        used[start.row][start.column] = true;
        while (stack.length > 0) {
            let position = stack.pop();
            result.push(position);

            let shifts = [
                new Position(-1, 0),
                new Position(1, 0),
                new Position(0, -1),
                new Position(0, 1),
            ];

            shifts.forEach(shift => {
                let newPosition = position.addPosition(shift);

                if (newPosition != null
                    && newPosition.row >= 0
                    && newPosition.row < this.height
                    && newPosition.column >= 0
                    && newPosition.column < this.width
                    && !used[newPosition.row][newPosition.column]
                    && this.tiles[position.row][position.column] == this.tiles[newPosition.row][newPosition.column]
                ) {
                    stack.push(newPosition);
                    used[newPosition.row][newPosition.column] = true;
                }
            });
        }

        return result;
    }

    private removeTiles(tilePositions: Position[]) {
        tilePositions.forEach(tilePosition => {
            this.tiles[tilePosition.row][tilePosition.column] = null;
            this.removeTileEvent(tilePosition);
        });
    }

    private filleEmptyTiles() {
        for (let row = 0; row < this.height; row++) {
            for (let column = 0; column < this.width; column++) {
                if (this.tiles[row][column] === null) {
                    this.tiles[row][column] = this.getRandomTile();
                    this.createTileEvent(new Position(row, column), this.tiles[row][column]);
                }
            }
        }
    }

    private fallTiles() {
        let someTileHasFallen = true;

        while (someTileHasFallen) {
            someTileHasFallen = false;
            for (let row = 0; row < this.height - 1; row++) {
                for (let column = 0; column < this.width; column++) {
                    if (this.tiles[row][column] === null && this.tiles[row + 1][column] !== null) {
                        this.fallTile(new Position(row + 1, column));
                        someTileHasFallen = true;
                    }
                }
            }
        }
    }

    private fallTile(tilePosition: Position) {
        if (tilePosition.row > 0) {
            this.tiles[tilePosition.row - 1][tilePosition.column] = this.tiles[tilePosition.row][tilePosition.column];
            this.tiles[tilePosition.row][tilePosition.column] = null;
            this.fallTileEvent(tilePosition);
        }
    }

}
