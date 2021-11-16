
import { _decorator, Component, Node, SpriteFrame, Sprite, Prefab, Vec2, Size } from 'cc';
import * as modules from 'cc';
import { BlastGame } from './non-components/BlastGame';
import { Position, Utils } from "./non-components/Utils";
import { Tile } from "./non-components/Tile";
import { TileComponent } from './TileComponent';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property
    height = 8;
    @property
    width = 10;
    @property
    colorsCount = 5;
    @property
    maxReshuffleCount = 5;
    @property
    minCombinationCount = 2;
    @property
    fieldPaddingY = 10;
    @property
    fieldPaddingX = 10;

    @property({ type: Node })
    field: Node = null;

    @property({ type: [SpriteFrame] })
    tileSpriteFrames: SpriteFrame[] = [];
    @property({ type: Prefab })
    tilePrefab: Prefab = null;

    @property({ type: Prefab })
    removePSPrefab: Prefab = null;

    tiles: Tile[][];

    tileSize: Size;
    tileStartPoint: Vec2;

    game: BlastGame;

    start() {
        this.game = new BlastGame(
            this.height,
            this.width,
            this.colorsCount,
            this.maxReshuffleCount,
            this.minCombinationCount);


        this.bindEvents();
        this.calculateSizes();
        this.initTiles();
        this.fillTileNodes();
    }

    private bindEvents() {
        this.game.removeTileEvent = (tilePosition: Position) => {
            let removePS = modules.instantiate(this.removePSPrefab);
            this.field.addChild(removePS);
            removePS.setPosition(this.tiles[tilePosition.row][tilePosition.column].node.position);

            this.tiles[tilePosition.row][tilePosition.column].node.destroy();
            this.tiles[tilePosition.row][tilePosition.column].node = null;
        };

        this.game.fallTileEvent = (tilePosition: Position) => {
            this.tiles[tilePosition.row - 1][tilePosition.column].node = this.tiles[tilePosition.row][tilePosition.column].node;
            this.tiles[tilePosition.row - 1][tilePosition.column].node.getComponent(TileComponent).tile = this.tiles[tilePosition.row - 1][tilePosition.column];
            this.tiles[tilePosition.row][tilePosition.column].node = null;
        };

        this.game.createTileEvent = (tilePosition: Position, tileType: number) => {
            this.tiles[tilePosition.row][tilePosition.column].type = tileType;
        };

        this.game.stateChangedEvent = this.fillTileNodes.bind(this);
    }

    private calculateSizes() {
        this.tileSize = new Size(
            (this.field.getComponent(modules.UITransform).width - 2 * this.fieldPaddingX) / this.width,
            (this.field.getComponent(modules.UITransform).height - 2 * this.fieldPaddingY) / this.height
        );

        this.tileStartPoint = new Vec2(
            - this.tileSize.width * (this.width - 1) / 2,
            this.tileSize.height * this.height / 2
        );

        this.tilePrefab.data.getComponent(modules.UITransform).contentSize = new Size(
            this.tileSize.width,
            this.tileSize.height * 1.1
        );
        this.tilePrefab.data.getComponent(modules.BoxCollider2D).size = new Size(
            this.tileSize.width - 2,
            this.tileSize.height
        );
        this.tilePrefab.data.getComponent(modules.BoxCollider2D).offset = new Vec2(
            0,
            -this.tileSize.height * 0.04
        );
    }

    private initTiles() {
        this.tiles = new Array<Array<Tile>>(this.height);
        for (let row = 0; row < this.height; row++) {
            this.tiles[row] = new Array<Tile>(this.width);
            for (let column = 0; column < this.width; column++) {
                this.tiles[row][column] = new Tile(new Position(row, column), this.game.tiles[row][column]);
            }
        }
    }

    private fillTileNodes() {
        let offsetsY = Utils.initArray(this.width, 0);

        for (let row = 0; row < this.height; row++) {
            for (let column = 0; column < this.width; column++) {
                if (this.tiles[row][column].node == null) {
                    this.tiles[row][column].node = this.createTileNode(
                        this.tiles[row][column],
                        new Vec2(
                            this.tileStartPoint.x + column * this.tileSize.width,
                            this.tileStartPoint.y + offsetsY[column]
                        )
                    );
                    offsetsY[column] += this.tileSize.height;
                }
            }
        }
    }

    private createTileNode(tile: Tile, position: Vec2): Node {
        let newNode: Node = modules.instantiate(this.tilePrefab);     
        this.field.addChild(newNode);
        newNode.setPosition(position.x, position.y);
        newNode.getComponent(Sprite).spriteFrame = this.tileSpriteFrames[this.tiles[tile.position.row][tile.position.column].type];        
                
        newNode.getComponent(TileComponent).tile = tile;
        newNode.getComponent(TileComponent).game = this.game;

        return newNode;
    }
}
