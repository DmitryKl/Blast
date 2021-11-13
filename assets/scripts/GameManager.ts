
import { _decorator, Component, Node, SpriteFrame, Sprite } from 'cc';
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

    @property({type: modules.SpriteAtlas})
    private fieldAtlas: modules.SpriteAtlas = null;

    @property({type: modules.Prefab})
    private fieldCellPrefab: modules.Prefab = null;

    game: BlastGame;

    start () {
        this.game = new BlastGame(
            this.height, 
            this.width, 
            this.colorsCount, 
            this.maxReshuffleCount, 
            this.minCombinationCount);

        this.createField();
    }

    private createField(){
        let cellHeight: number = (<Node>this.fieldCellPrefab.data).getComponent(modules.UITransform).contentSize.height;
        let cellWidth: number = (<Node>this.fieldCellPrefab.data).getComponent(modules.UITransform).contentSize.width;
        let startY: number = this.node.position.y + cellHeight * this.height / 2;
        let startX: number = this.node.position.x - cellWidth * this.width / 2;

        let y: number = startY;
        let x: number = startX;
        // top
        this.createCellField(this.fieldAtlas.getSpriteFrame("field1"), startY, startX);
        for(let i = 1; i < this.width - 1; i++) {
            this.createCellField(this.fieldAtlas.getSpriteFrame("field2"), startY, startX + cellWidth * i);
        }
        this.createCellField(this.fieldAtlas.getSpriteFrame("field3"), startY, startX + cellWidth * (this.width - 1));

        // middle
        for(let row = 1; row < this.height - 1; row++){
            this.createCellField(this.fieldAtlas.getSpriteFrame("field4"), startY - cellHeight * row, startX);
            for(let i = 1; i < this.width - 1; i++) {
                this.createCellField(this.fieldAtlas.getSpriteFrame("field5"), startY - cellHeight * row, startX + cellWidth * i);
            }
            this.createCellField(this.fieldAtlas.getSpriteFrame("field6"), startY - cellHeight * row, startX + cellWidth * (this.width - 1));
        }
        

        // bottom
        this.createCellField(this.fieldAtlas.getSpriteFrame("field7"), startY - cellHeight * (this.height - 1), startX);
        for(let i = 1; i < this.width - 1; i++) {
            this.createCellField(this.fieldAtlas.getSpriteFrame("field8"), startY - cellHeight * (this.height - 1), startX + cellWidth * i);
        }
        this.createCellField(this.fieldAtlas.getSpriteFrame("field9"), startY - cellHeight * (this.height - 1), startX + cellWidth * (this.width - 1));

    }

    private createCellField(spriteFrame: SpriteFrame, y: number, x: number) {
        let newNode: Node = modules.instantiate(this.fieldCellPrefab);
        newNode.setPosition(new modules.Vec3(x, y, newNode.position.z));
        let spriteComponent: modules.Sprite = newNode.getComponent(Sprite);
        spriteComponent.spriteFrame = spriteFrame;
        this.node.addChild(newNode);
    }
}
