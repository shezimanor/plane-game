import { _decorator, CCInteger, Component } from 'cc';
import { EventManager } from './EventManager';
import { AudioManager, MusicClipType } from './AudioManager';
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
    // 註冊事件
    EventManager.eventTarget.on('detonateBomb', this.detonateBomb, this);
  }

  protected start(): void {
    // 播放背景音樂
    AudioManager.instance.playMusic(MusicClipType.Bgm);
  }

  protected onDestroy(): void {
    if (CanvasGameManager._instance === this) {
      CanvasGameManager._instance = null;
    }
    // 註銷事件
    EventManager.eventTarget.off('detonateBomb', this.detonateBomb, this);
  }

  addBomb() {
    this._bombCount += 1;
    // 更新 UI
    EventManager.eventTarget.emit('updateBombCount', this._bombCount);
  }

  getBombCount(): number {
    return this._bombCount;
  }

  detonateBomb() {
    if (this._bombCount > 0) {
      this._bombCount -= 1;
      // 更新 UI
      EventManager.eventTarget.emit('updateBombCount', this._bombCount);
    }
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
