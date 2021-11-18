import { _decorator, Component, director, Label, find } from 'cc';
import { GameResultComponent } from './GameResultComponent';
import { GameResult } from './non-components/BlastGame';

const { ccclass, property } = _decorator;

@ccclass('GameOverComponent')
export class GameOverComponent extends Component {

    @property({type: Label})
    resultLabel: Label = null;

    start() {
        let gameResultComponent = find("GameResult").getComponent(GameResultComponent);
        this.resultLabel.string = gameResultComponent.gameResult === GameResult.Loose ? "Вы проиграли." : "Победа!";
    }

   restartGame() {
       director.loadScene("Game");
   }
}
