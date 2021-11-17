import { _decorator, Component, Node, SpriteFrame, Sprite, Prefab, ParticleSystem2D, instantiate, tween } from 'cc';
import { BlastGame } from './non-components/BlastGame';
import { Position } from './non-components/Utils';

const { ccclass, property } = _decorator;

@ccclass('TileComponent')
export class TileComponent extends Component {

    tilePosition: Position;
    game: BlastGame;

    start(){
        this.node.on(Node.EventType.TOUCH_END, () => {
            this.game.tapTile(this.tilePosition);
        });
    }    
}