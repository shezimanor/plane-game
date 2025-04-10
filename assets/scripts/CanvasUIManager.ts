import {
  _decorator,
  Button,
  Component,
  director,
  game,
  Input,
  Label,
  Node,
  sys
} from 'cc';
import { EventManager } from './EventManager';
import { CanvasGameManager } from './CanvasGameManager';
const { ccclass, property } = _decorator;

@ccclass('CanvasUIManager')
export class CanvasUIManager extends Component {
  private static _instance: CanvasUIManager = null;
  public static get instance(): CanvasUIManager {
    return CanvasUIManager._instance;
  }

  @property(Node)
  public bombUI: Node = null;
  @property(Label)
  public bombCountLabel: Label = null;
  @property(Label)
  public planeHpLabel: Label = null;
  @property(Label)
  public playerScoreLabel: Label = null;
  @property(Button)
  public pauseButton: Button = null;
  @property(Button)
  public resumeButton: Button = null;
  @property(Node)
  public gameOverPanel: Node = null;
  @property(Button)
  public restartButton: Button = null;
  @property(Label)
  public highestScoreLabel: Label = null;
  @property(Label)
  public currentScoreLabel: Label = null;

  // 最高分
  private _highestScore: number = 0;

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
    EventManager.eventTarget.on('gameOver', this.showGameOverPanel, this);
    // 註冊觸擊炸彈事件
    this.bombUI.on(Input.EventType.TOUCH_START, this.onTouchStartBomb, this);
    // 讀取本地端最高分數 localStorage 存的一定是字串
    let highScore = sys.localStorage.getItem('planeHighScore');
    if (!highScore) {
      highScore = '0';
      // 沒有紀錄，先存 0
      sys.localStorage.setItem('planeHighScore', highScore);
    }
    // 顯示最高分數
    this._highestScore = Number(highScore);
    this.highestScoreLabel.string = `${this._highestScore}`;
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
    EventManager.eventTarget.off('gameOver', this.showGameOverPanel, this);
    // 註銷觸擊炸彈事件
    this.bombUI.off(Input.EventType.TOUCH_START, this.onTouchStartBomb, this);
  }

  onTouchStartBomb() {
    const bombCount = CanvasGameManager.instance.getBombCount();
    // 使用炸彈
    if (bombCount > 0) {
      // 引爆炸彈(兩個偵聽：更新炸彈數、全範圍滅敵機)
      EventManager.eventTarget.emit('detonateBomb');
    }
  }

  updateBombCount(bombCount: number) {
    // 更新炸彈數量
    this.bombCountLabel.string = `${bombCount}`;
  }

  updatePlayerHp(hp: number) {
    // 更新玩家(飛機)血量
    this.planeHpLabel.string = `${hp < 0 ? 0 : hp}`;
  }

  updatePlayerScore(score: number) {
    // 更新玩家分數
    this.playerScoreLabel.string = `${score}`;
  }

  updateCurrentScore(score: number) {
    // 更新當前分數
    this.currentScoreLabel.string = `${score}`;
  }

  updateHighestScore(newScore: number) {
    // 更新最高分數
    const highScore = Number(sys.localStorage.getItem('planeHighScore'));
    if (newScore > highScore) {
      sys.localStorage.setItem('planeHighScore', `${newScore}`);
      this._highestScore = newScore;
      this.highestScoreLabel.string = `${this._highestScore}`;
    }
  }

  onClickResumeGame() {
    // 按鈕切換
    this.pauseButton.node.active = true;
    this.resumeButton.node.active = false;
    // 暫停遊戲
    game.resume();
  }

  onClickPauseGame() {
    // 按鈕切換
    this.resumeButton.node.active = true;
    this.pauseButton.node.active = false;
    // 暫停遊戲(要先等按鈕渲染切換完成)
    this.scheduleOnce(() => {
      game.pause();
    }, 0);
  }

  onClickRestartGame() {
    director.loadScene('01-start-scene');
    // 重新開始遊戲
    game.resume();
  }

  showGameOverPanel(score: number) {
    // 顯示結束畫面
    this.gameOverPanel.active = true;
    // 更新當前分數
    this.updateCurrentScore(score);
    // 更新最高分數(判斷在裡面)
    this.updateHighestScore(score);
  }
}
