import { _decorator, Component, game } from 'cc';
import { GameResult } from './non-components/BlastGame';


const { ccclass, property } = _decorator;

@ccclass('GameResultComponent')
export class GameResultComponent extends Component {
    gameResult: GameResult;

    onLoad() {
        game.addPersistRootNode(this.node);
    }
}
