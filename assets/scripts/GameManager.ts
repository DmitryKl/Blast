
import { _decorator, Component, Node, SpriteFrame, Sprite, Prefab } from 'cc';
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

    @property({ type: modules.SpriteAtlas })
    fieldAtlas: modules.SpriteAtlas = null;
    @property({ type: [Prefab], tooltip: "0 - Corner, 1 - horizontal side, 2 - vertical side, 3 - inner" })
    fieldCellPrefabs: Prefab[] = [];

    @property({ type: [SpriteFrame] })
    tileSpriteFrames: SpriteFrame[] = [];
    @property({ type: Prefab })
    tilePrefab: Prefab = null;

    @property({ type: Prefab })
    cupColliderPrefab: Prefab = null;

    @property({type: Prefab})
    removePSPrefab: Prefab = null;

    tiles: Tile[][];

    tileSize: number;

    game: BlastGame;

    start() {
        this.game = new BlastGame(
            this.height,
            this.width,
            this.colorsCount,
            this.maxReshuffleCount,
            this.minCombinationCount);

        this.game.removeTileEvent = (tilePosition: Position) => { 
            let removePS = modules.instantiate(this.removePSPrefab);            
            this.node.addChild(removePS);
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
        
        this.tileSize = (<Node>this.tilePrefab.data).getComponent(modules.UITransform).contentSize.width;

        this.createCup();
        this.createField();
        this.initTiles();
        this.fillTileNodes();
    }

    private createField() {
        let startY = this.node.position.y - this.tileSize * this.height / 2;
        let startX = this.node.position.x - this.tileSize * this.width / 2;
        let offsetY = ((<Node>this.fieldCellPrefabs[0].data).getComponent(modules.UITransform).contentSize.height - this.tileSize) / 2;
        let offsetX = ((<Node>this.fieldCellPrefabs[0].data).getComponent(modules.UITransform).contentSize.width - this.tileSize) / 2;

        // bottom 
        this.createNodeWithSprite(this.fieldCellPrefabs[0], this.fieldAtlas.getSpriteFrame("field7"), startX - offsetX, startY - offsetY);
        for (let i = 1; i < this.width - 1; i++) {
            this.createNodeWithSprite(this.fieldCellPrefabs[1], this.fieldAtlas.getSpriteFrame("field8"), startX + this.tileSize * i, startY - offsetY);
        }
        this.createNodeWithSprite(this.fieldCellPrefabs[0], this.fieldAtlas.getSpriteFrame("field9"), startX + this.tileSize * (this.width - 1) + offsetX, startY - offsetY);

        // middle
        for (let row = 1; row < this.height - 1; row++) {
            this.createNodeWithSprite(this.fieldCellPrefabs[2], this.fieldAtlas.getSpriteFrame("field4"), startX - offsetX, startY + this.tileSize * row);
            for (let i = 1; i < this.width - 1; i++) {
                this.createNodeWithSprite(this.fieldCellPrefabs[3], this.fieldAtlas.getSpriteFrame("field5"), startX + this.tileSize * i, startY + this.tileSize * row);
            }
            this.createNodeWithSprite(this.fieldCellPrefabs[2], this.fieldAtlas.getSpriteFrame("field6"), startX + this.tileSize * (this.width - 1) + offsetX, startY + this.tileSize * row);
        }

        // top
        this.createNodeWithSprite(this.fieldCellPrefabs[0], this.fieldAtlas.getSpriteFrame("field1"), startX - offsetX, startY + this.tileSize * (this.height - 1) + offsetY);
        for (let i = 1; i < this.width - 1; i++) {
            this.createNodeWithSprite(this.fieldCellPrefabs[1], this.fieldAtlas.getSpriteFrame("field2"), startX + this.tileSize * i, startY + this.tileSize * (this.height - 1) + offsetY);
        }
        this.createNodeWithSprite(this.fieldCellPrefabs[0], this.fieldAtlas.getSpriteFrame("field3"), startX + this.tileSize * (this.width - 1) + offsetX, startY + this.tileSize * (this.height - 1) + offsetY);

    }

    private createNodeWithSprite(prefab: Prefab, spriteFrame: SpriteFrame, x: number, y: number): Node {
        let newNode: Node = modules.instantiate(prefab);
        this.node.addChild(newNode);
        newNode.setPosition(x, y);
        let spriteComponent: modules.Sprite = newNode.getComponent(Sprite);
        spriteComponent.spriteFrame = spriteFrame;

        return newNode;
    }

    private createCup() {
        let newNode = modules.instantiate(this.cupColliderPrefab);
        this.node.addChild(newNode);
        newNode.getComponent(modules.BoxCollider2D).size.width = this.width * this.tileSize;
        newNode.setPosition(this.node.position.x, this.node.position.y - (this.height + 1) * this.tileSize / 2);
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
        let startY: number = this.node.position.y + this.tileSize * this.height / 2;
        let startX: number = this.node.position.x - this.tileSize * this.width / 2;        

        let offsetsY = Utils.initArray(this.width, 0);

        for (let row = 0; row < this.height; row++) {
            for (let column = 0; column < this.width; column++) {
                if(this.tiles[row][column].node == null) {                    
                    this.tiles[row][column].node = this.createTileNode(
                        this.tiles[row][column], 
                        startX + column * this.tileSize,
                        startY + offsetsY[column]);
                    offsetsY[column] += this.tileSize;
                }              
            }
        }

                    
    }

    private createTileNode(tile: Tile, x: number, y: number): Node {
        let node = this.createNodeWithSprite(this.tilePrefab, this.tileSpriteFrames[tile.type], x, y);
        // node.on(Node.EventType.MOUSE_DOWN, function(event) {
        //     this.game.tapTile(this.getComponent(TileComponent).tile.position);
        //     this.fillTileNodes();
        // }.bind(node));
        node.getComponent(TileComponent).tile = tile;
        node.getComponent(TileComponent).game = this.game;
        
        return node;
    }
}
