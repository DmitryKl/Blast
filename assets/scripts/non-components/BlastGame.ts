import { Position, Utils } from "./Utils";

export enum GameResult {
    Win,
    Loose
}

export enum TileType {
    Blue,
    Green,
    Purple,
    Red,
    Yellow,
    Super
}

export class BlastGame {
    readonly height: number;
    readonly width: number;
    readonly colorsCount: number;
    readonly maxReshuffleCount: number;
    readonly minCombinationCount: number;
    readonly superTileActivateThreshold: number;
    readonly superTileRadius: number;

    tiles: TileType[][];
    score: number = 0;
    readonly scoreGoal: number;
    movesCount: number;

    removeTileEvent: (position: Position) => void;
    fallTileEvent: (position: Position) => void;
    tilesFallenEvent: () => void;
    superTilesAddedEvent: () => void;
    tilesSwappedEvent: () => void;
    gameOverEvent: (result: GameResult) => void;

    constructor(
        height: number,
        width: number,
        colorsCount: number,
        maxReshuffleCount: number,
        minCombinationCount: number,
        superTileActivateThreshold: number,
        superTileRadius: number,
        scoreGoal: number,
        movesCount: number
    ) {
        this.height = height;
        this.width = width;
        this.colorsCount = colorsCount;
        this.maxReshuffleCount = maxReshuffleCount;
        this.minCombinationCount = minCombinationCount;
        this.superTileActivateThreshold = superTileActivateThreshold;
        this.superTileRadius = superTileRadius;
        this.scoreGoal = scoreGoal;
        this.movesCount = movesCount;

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
        let combination;
        if (this.tiles[position.row][position.column] == TileType.Super) {
            combination = this.getCombinationByRadius(position, this.superTileRadius);
        } else {
            combination = this.getCombination(position);
        }

        let currentTileIsSuper = this.tiles[position.row][position.column] == TileType.Super;
        if (combination.length >= this.minCombinationCount || currentTileIsSuper) {
            this.movesCount--;
            this.score += this.getScoreByCombinationLength(combination.length);
            this.removeTiles(combination);            
            this.fallTiles();
            this.fillEmptyTiles();
            this.tilesFallenEvent();
            this.tryAddSuperTile(position, combination, currentTileIsSuper);
            this.superTilesAddedEvent();
            this.reshuffleIfNeed();

            if (this.score >= this.scoreGoal) {
                this.gameOverEvent(GameResult.Win);
            } else if (this.movesCount == 0) {
                this.gameOverEvent(GameResult.Loose);
            }
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

    private fillEmptyTiles() {
        for (let row = 0; row < this.height; row++) {
            for (let column = 0; column < this.width; column++) {
                if (this.tiles[row][column] === null) {
                    this.tiles[row][column] = this.getRandomTile();
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

    private fallTile(tile: Position) {
        this.tiles[tile.row - 1][tile.column] = this.tiles[tile.row][tile.column];
        this.tiles[tile.row][tile.column] = null;
        this.fallTileEvent(tile);
    }

    private reshuffleIfNeed() {
        let reshuffleIteration = 0;
        let moveExists = this.moveExists();

        while (!moveExists && reshuffleIteration < this.maxReshuffleCount) {
            this.reshuffle();
            reshuffleIteration++;
            moveExists = this.moveExists();
        }

        if (!moveExists && reshuffleIteration == this.maxReshuffleCount) {
            this.gameOverEvent(GameResult.Loose);
        }

        if (reshuffleIteration > 0) {
            this.tilesSwappedEvent();
        }
    }

    private reshuffle() {
        let positions: Position[] = [];

        for (let row = 0; row < this.height; row++) {
            for (let column = 0; column < this.width; column++) {
                positions.push(new Position(row, column));
            }
        }

        while (positions.length > 1) {
            let firstPosition = positions.pop();
            let secondPostionIndex = Math.floor(Math.random() * positions.length);
            let secondPosition = positions[secondPostionIndex];
            this.swapTiles(firstPosition, secondPosition);
            positions.splice(secondPostionIndex, 1)
        }
    }

    private swapTiles(tile1: Position, tile2: Position) {
        let tmp = this.tiles[tile1.row][tile1.column];
        this.tiles[tile1.row][tile1.column] = this.tiles[tile2.row][tile2.column];
        this.tiles[tile2.row][tile2.column] = tmp;
    }

    private moveExists(): boolean {
        let checkedTiles = Utils.init2dArray(this.height, this.width, false);

        for (let row = 0; row < this.height; row++) {
            for (let column = 0; column < this.width; column++) {
                if(this.tiles[row][column] == TileType.Super) {
                    return true;
                }
                if (!checkedTiles[row][column]) {
                    let combination = this.getCombination(new Position(row, column));

                    if (combination.length >= this.minCombinationCount) {
                        return true;
                    } else {
                        combination.forEach(position => {
                            checkedTiles[position.row][position.column] = true;
                        });
                    }
                }
            }
        }

        return false;
    }

    private getScoreByCombinationLength(length: number): number {
        switch (length) {
            case 1:
            case 2:
            case 3:
            case 4: return length * 10;
            case 5:
            case 6:
            case 7: return length * 15;
            default: return length * 20;
        }
    }

    private tryAddSuperTile(position: Position, combination: Position[], currentTileIsSuper: boolean) {
        if (currentTileIsSuper) return;
        if (combination.length >= this.superTileActivateThreshold) {
            this.tiles[position.row][position.column] = TileType.Super;
        }
    }

    private getCombinationByRadius(position: Position, totalRadius: number): Position[] {
        // Массив вида [1, 2, ... , this.superTileRadius, ... ,2 , 1]
        let radiuses = Array.from({ length: totalRadius * 2 - 1 },
            (v, k) => totalRadius - Math.abs(k + 1 - totalRadius));

        let row = position.row - totalRadius + 1;

        let result: Position[] = [];
        radiuses.forEach(radius => {
            for (let column = position.column - radius + 1; column < position.column + radius; column++) {
                if (column >= 0 && column < this.width
                    && row >= 0 && row < this.height
                ) {
                    result.push(new Position(row, column));
                }
            }
            row++;
        });

        return result;
    }
}
