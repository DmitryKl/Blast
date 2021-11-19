import { _decorator, Component, Node, SpriteFrame, Sprite, Prefab, Vec2, Size, Label } from 'cc';
import * as modules from 'cc';
import { BlastGame, GameResult, TileType } from './non-components/BlastGame';
import { Position, Utils } from "./non-components/Utils";
import { TileComponent } from './TileComponent';
import { GameResultComponent } from './GameResultComponent';

const { ccclass, property } = _decorator;

@ccclass('GameComponent')
export class GameComponent extends Component {

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
    superTileActivateThreshold = 5;
    @property
    superTileRadius = 3;
    @property
    fieldPaddingY = 10;
    @property
    fieldPaddingX = 10;
    @property
    scoreGoal = 2000;
    @property
    movesCount = 20;

    @property({ type: Node })
    field: Node = null;

    @property({ type: [SpriteFrame] })
    tileSpriteFrames: SpriteFrame[] = [];
    @property({ type: SpriteFrame })
    superTileSpriteFrame: SpriteFrame = null;
    @property({ type: Prefab })
    tilePrefab: Prefab = null;

    @property({ type: Prefab })
    removePSPrefab: Prefab = null;

    @property({ type: Label })
    score: Label = null;
    @property({ type: Label })
    moves: Label = null;
    @property({ type: modules.ProgressBar })
    progressBar: modules.ProgressBar = null;

    gameResultComponent: GameResultComponent;

    tiles: TileComponent[][];

    tileSize: Size;
    tileStartPoint: Vec2;

    game: BlastGame;

    start() {
        this.game = new BlastGame(
            this.height,
            this.width,
            this.colorsCount,
            this.maxReshuffleCount,
            this.minCombinationCount,
            this.superTileActivateThreshold,
            this.superTileRadius,
            this.scoreGoal,
            this.movesCount);


        this.bindEvents();
        this.calculateSizes();
        this.initTiles();
        this.fillTileNodes();        

        this.gameResultComponent = modules.find("GameResult").getComponent(GameResultComponent);

        this.game.reshuffleIfNeed();
    }

    update() {
        this.score.string = String(this.game.score);
        this.moves.string = `Ходов:\n${this.game.movesCount}`;
        this.progressBar.progress = this.game.score / this.game.scoreGoal;
    }

    private bindEvents() {
        this.game.removeTileEvent = (tilePosition: Position) => {
            let removePS = modules.instantiate(this.removePSPrefab);
            this.field.addChild(removePS);
            removePS.setPosition(this.tiles[tilePosition.row][tilePosition.column].node.position);

            this.tiles[tilePosition.row][tilePosition.column].node.destroy();
            this.tiles[tilePosition.row][tilePosition.column] = null;
        };

        this.game.fallTileEvent = (tilePosition: Position) => {
            if (this.tiles[tilePosition.row][tilePosition.column] != null) {
                this.tiles[tilePosition.row - 1][tilePosition.column] = this.tiles[tilePosition.row][tilePosition.column];
                this.tiles[tilePosition.row - 1][tilePosition.column].getComponent(TileComponent).tilePosition = new Position(tilePosition.row - 1, tilePosition.column);
                this.tiles[tilePosition.row][tilePosition.column] = null;
            }
        };

        this.game.tilesFallenEvent = () => {
            this.fillTileNodes();
        };

        this.game.superTileAddedEvent = position => {
            modules.tween(this)
                .delay(0.5)
                .call(() => this.fillSuperTileNode(position))
                .start();
        };

        this.game.tilesSwappedEvent = () => {
            modules.tween(this)
                .delay(1)
                .call(() => {
                    for (let row = 0; row < this.height; row++) {
                        for (let column = 0; column < this.width; column++) {
                            this.tiles[row][column].node.destroy();
                            this.tiles[row][column] = null;
                        }
                    }
                })
                .call(() => { this.fillTileNodes() })
                .start();
        };

        this.game.gameOverEvent = (result: GameResult) => {
            this.gameResultComponent.gameResult = result;
            modules.tween(this)                
                .delay(0.5)
                .call(() => modules.director.loadScene("GameOver"))
                .start();
            ;
        }
    }

    private calculateSizes() {
        this.tileSize = new Size(
            (this.field.getComponent(modules.UITransform).width - 2 * this.fieldPaddingX) / this.width,
            (this.field.getComponent(modules.UITransform).height - 2 * this.fieldPaddingY) / this.height
        );

        this.tileStartPoint = new Vec2(
            - this.tileSize.width * (this.width - 1) / 2,
            - this.tileSize.height * this.height / 2
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
        this.tiles = Utils.init2dArray(this.height, this.width);
    }

    private fillTileNodes() {
        let offsetsY = Utils.initArray(this.width, 0);

        for (let row = 0; row < this.height; row++) {
            for (let column = 0; column < this.width; column++) {
                if (this.tiles[row][column] == null) {
                    this.tiles[row][column] = this.createTileNode(
                        new Position(row, column),
                        new Vec2(
                            this.tileStartPoint.x + column * this.tileSize.width,
                            this.tileStartPoint.y + this.tileSize.height * this.height + offsetsY[column]
                        )
                    );
                    offsetsY[column] += this.tileSize.height;
                }
            }
        }
    }

    private createTileNode(tilePosition: Position, position: Vec2): TileComponent {
        let newNode: TileComponent = modules.instantiate(this.tilePrefab).getComponent(TileComponent);
        this.field.addChild(newNode.node);
        newNode.node.setPosition(position.x, position.y);
        newNode.getComponent(Sprite).spriteFrame = this.getTileSpriteFrameByType(this.game.tiles[tilePosition.row][tilePosition.column]);

        newNode.getComponent(TileComponent).tilePosition = tilePosition;
        newNode.getComponent(TileComponent).game = this.game;

        return newNode;
    }

    private getTileSpriteFrameByType(type: TileType) {
        if (type == TileType.Super) {
            return this.superTileSpriteFrame;
        }

        return this.tileSpriteFrames[type];
    }

    private fillSuperTileNode(position: Position) {
        this.tiles[position.row][position.column].node.destroy();
        this.tiles[position.row][position.column] = this.createTileNode(
            new Position(position.row, position.column),
            new Vec2(
                this.tileStartPoint.x + position.column * this.tileSize.width,
                this.tileStartPoint.y + position.row * this.tileSize.height
            )
        );
    }
}
