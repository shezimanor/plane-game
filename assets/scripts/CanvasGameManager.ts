import { _decorator, CCInteger, Component, director, Node } from 'cc';
import { EventManager } from './EventManager';
const { ccclass, property } = _decorator;

@ccclass('CanvasGameManager')
export class CanvasGameManager extends Component {
  private static _instance: CanvasGameManager = null;
  public static get instance(): CanvasGameManager {
    return CanvasGameManager._instance;
  }

  // 炸彈數量
  @property(CCInteger)
  private _bombCount: number = 0;
  // 玩家分數
  @property(CCInteger)
  private _playerScore: number = 0;

  protected onLoad(): void {
    // 單例模式
    if (!CanvasGameManager._instance) {
      CanvasGameManager._instance = this;
    } else {
      this.destroy();
    }
    // 設為常駐節點(防止切換場景時被卸載)
    director.addPersistRootNode(this.node);
  }

  protected onDestroy(): void {
    if (CanvasGameManager._instance === this) {
      CanvasGameManager._instance = null;
    }
  }

  addBomb() {
    this._bombCount += 1;
    // 更新 UI
    EventManager.eventTarget.emit('updateBombCount', this._bombCount);
  }

  addScore(score: number) {
    this._playerScore += score;
    // 更新 UI
    EventManager.eventTarget.emit('updatePlayerScore', this._playerScore);
  }

  getPlayerScore(): number {
    return this._playerScore;
  }
}
