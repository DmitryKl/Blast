
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
        this.tiles.forEach(row =>{
            row = new Array<number>(width);
            row.forEach(tile => {
                tile = this.getRandomTile();
            });
        });


    }

    private getRandomTile(): number{        
        return Math.floor(Math.random() * this.colorsCount);
    }

}
