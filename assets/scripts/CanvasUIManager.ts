import { _decorator, Button, Component, game, Label, Node } from 'cc';
import { EventManager } from './EventManager';
const { ccclass, property } = _decorator;

@ccclass('CanvasUIManager')
export class CanvasUIManager extends Component {
  private static _instance: CanvasUIManager = null;
  public static get instance(): CanvasUIManager {
    return CanvasUIManager._instance;
  }

  @property(Label)
  public BombCountLabel: Label = null;
  @property(Label)
  public PlaneHpLabel: Label = null;
  @property(Label)
  public PlayerScoreLabel: Label = null;
  @property(Button)
  public PauseButton: Button = null;
  @property(Button)
  public ResumeButton: Button = null;

  protected onLoad(): void {
    // 單例模式
    if (!CanvasUIManager._instance) {
      CanvasUIManager._instance = this;
    } else {
      this.destroy();
    }
    // 註冊事件
    EventManager.eventTarget.on('updateBombCount', this.updateBombCount, this);
    EventManager.eventTarget.on('updatePlayerHp', this.updatePlayerHp, this);
    EventManager.eventTarget.on(
      'updatePlayerScore',
      this.updatePlayerScore,
      this
    );
  }

  protected onDestroy(): void {
    if (CanvasUIManager._instance === this) {
      CanvasUIManager._instance = null;
    }
    // 註銷事件
    EventManager.eventTarget.off('updateBombCount', this.updateBombCount, this);
    EventManager.eventTarget.off('updatePlayerHp', this.updatePlayerHp, this);
    EventManager.eventTarget.off(
      'updatePlayerScore',
      this.updatePlayerScore,
      this
    );
  }

  updateBombCount(bombCount: number) {
    // 更新炸彈數量
    this.BombCountLabel.string = `${bombCount}`;
  }

  updatePlayerHp(hp: number) {
    // 更新玩家(飛機)血量
    this.PlaneHpLabel.string = `${hp < 0 ? 0 : hp}`;
  }

  updatePlayerScore(score: number) {
    // 更新玩家分數
    this.PlayerScoreLabel.string = `${score}`;
  }

  resumeGame() {
    // 按鈕切換
    this.PauseButton.node.active = true;
    this.ResumeButton.node.active = false;
    // 暫停遊戲
    game.resume();
  }

  pauseGame() {
    // 按鈕切換
    this.ResumeButton.node.active = true;
    this.PauseButton.node.active = false;
    // 暫停遊戲(要先等按鈕渲染切換完成)
    this.scheduleOnce(() => {
      game.pause();
    }, 0);
  }
}
