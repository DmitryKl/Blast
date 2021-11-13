
export class BlastGame {
    readonly height: number;
    readonly width: number;
    readonly colorsCount: number;
    readonly maxReshuffleCount: number;
    readonly minCombinationCount: number;

    tiles: number[][];

    constructor(
        height: number, 
        width: number, 
        colorsCount: number,
        maxReshuffleCount: number,
        minCombinationCount: number)
    {
        this.height = height;
        this.width = width;
        this.colorsCount = colorsCount;
        this.maxReshuffleCount = maxReshuffleCount;
        this.minCombinationCount = minCombinationCount;

        this.tiles = new Array<Array<number>>(height);
        for(let row = 0; row < height; row++){
            this.tiles[row] = new Array(width);
            for (let col = 0; col < width; col++) {
                this.tiles[row][col] =  this.getRandomTile();        
            }
        }


    }

    private getRandomTile(): number{        
        return Math.floor(Math.random() * this.colorsCount);
    }

}
