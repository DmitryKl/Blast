
import { _decorator, Component, Node, SpriteFrame, Sprite, Prefab } from 'cc';
import * as modules from 'cc';
import { BlastGame } from './non-components/BlastGame';
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
    @property({ type: [Prefab] , tooltip: "0 - Corner, 1 - horizontal side, 2 - vertical side, 3 - inner"})
    fieldCellPrefabs: Prefab[] = [];

    @property({ type: [SpriteFrame]})
    tileSpriteFrames: SpriteFrame[] = [];
    @property({ type: Prefab})
    tilePrefab: Prefab = null;

    tiles: Node[][];

    game: BlastGame;

    start() {
        this.game = new BlastGame(
            this.height,
            this.width,
            this.colorsCount,
            this.maxReshuffleCount,
            this.minCombinationCount);

        this.createField();
        this.initTiles();
    }

    private createField() {
        let cellHeight: number = (<Node>this.fieldCellPrefabs[3].data).getComponent(modules.UITransform).contentSize.height;
        let cellWidth: number = (<Node>this.fieldCellPrefabs[3].data).getComponent(modules.UITransform).contentSize.width;
        let startY: number = this.node.position.y + cellHeight * this.height / 2;
        let startX: number = this.node.position.x - cellWidth * this.width / 2;

        // top
        this.createNodeWithSprite(this.fieldCellPrefabs[0], this.fieldAtlas.getSpriteFrame("field1"), startY, startX);
        for (let i = 1; i < this.width - 1; i++) {
            this.createNodeWithSprite(this.fieldCellPrefabs[1], this.fieldAtlas.getSpriteFrame("field2"), startY, startX + cellWidth * i);
        }
        this.createNodeWithSprite(this.fieldCellPrefabs[0], this.fieldAtlas.getSpriteFrame("field3"), startY, startX + cellWidth * (this.width - 1));

        // middle
        for (let row = 1; row < this.height - 1; row++) {
            this.createNodeWithSprite(this.fieldCellPrefabs[2], this.fieldAtlas.getSpriteFrame("field4"), startY - cellHeight * row, startX);
            for (let i = 1; i < this.width - 1; i++) {
                this.createNodeWithSprite(this.fieldCellPrefabs[3], this.fieldAtlas.getSpriteFrame("field5"), startY - cellHeight * row, startX + cellWidth * i);
            }
            this.createNodeWithSprite(this.fieldCellPrefabs[2], this.fieldAtlas.getSpriteFrame("field6"), startY - cellHeight * row, startX + cellWidth * (this.width - 1));
        }


        // bottom
        this.createNodeWithSprite(this.fieldCellPrefabs[0], this.fieldAtlas.getSpriteFrame("field7"), startY - cellHeight * (this.height - 1), startX);
        for (let i = 1; i < this.width - 1; i++) {
            this.createNodeWithSprite(this.fieldCellPrefabs[1], this.fieldAtlas.getSpriteFrame("field8"), startY - cellHeight * (this.height - 1), startX + cellWidth * i);
        }
        this.createNodeWithSprite(this.fieldCellPrefabs[0], this.fieldAtlas.getSpriteFrame("field9"), startY - cellHeight * (this.height - 1), startX + cellWidth * (this.width - 1));

    }

    private createNodeWithSprite(prefab: Prefab, spriteFrame: SpriteFrame, y: number, x: number): Node {
        let newNode: Node = modules.instantiate(prefab);
        newNode.setPosition(new modules.Vec3(x, y, newNode.position.z));
        let spriteComponent: modules.Sprite = newNode.getComponent(Sprite);
        spriteComponent.spriteFrame = spriteFrame;
        this.node.addChild(newNode);

        return newNode;
    }

    private initTiles() {
        let tileHeight: number = (<Node>this.tilePrefab.data).getComponent(modules.UITransform).contentSize.height;
        tileHeight *= 0.90;
        let tileWidth: number = (<Node>this.tilePrefab.data).getComponent(modules.UITransform).contentSize.width;
        let startY: number = this.node.position.y + tileHeight * this.height / 2;
        let startX: number = this.node.position.x - tileWidth * this.width / 2;

        this.tiles = new Array<Array<Node>>(this.height);
        for (let row = 0; row < this.height; row++) {
            this.tiles[row] = new Array<Node>(this.width);            
        }
        
        for (let row = this.height - 1; row >= 0; row--){
            for (let col = 0; col < this.width; col++) {                
                this.tiles[row][col] = this.createNodeWithSprite(
                    this.tilePrefab, 
                    this.tileSpriteFrames[this.game.tiles[row][col]], 
                    startY - row * tileHeight, 
                    startX + col * tileWidth);
            }
        }
    }

}
