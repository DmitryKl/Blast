import { _decorator, Component, Node, SpriteFrame, Sprite, Prefab, ParticleSystem2D, instantiate, tween } from 'cc';
import { BlastGame } from './non-components/BlastGame';
import { Tile } from "./non-components/Tile";

const { ccclass, property } = _decorator;

@ccclass('TileComponent')
export class TileComponent extends Component {

    tile: Tile;
    game: BlastGame;

    start(){
        this.node.on(Node.EventType.MOUSE_DOWN, () => {
            this.game.tapTile(this.tile.position);
        });
    }    
}