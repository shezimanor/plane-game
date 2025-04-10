import { _decorator, Component, Label, Node } from 'cc';
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

  protected onLoad(): void {
    // 單例模式
    if (!CanvasUIManager._instance) {
      CanvasUIManager._instance = this;
    } else {
      this.destroy();
    }
    // 註冊事件
    EventManager.eventTarget.on('updateBombCount', this.updateBombCount, this);
  }

  protected onDestroy(): void {
    if (CanvasUIManager._instance === this) {
      CanvasUIManager._instance = null;
    }
    // 註銷事件
    EventManager.eventTarget.off('updateBombCount', this.updateBombCount, this);
  }

  updateBombCount(bombCount: number) {
    console.log('updateBombCount', bombCount);
    // 更新炸彈數量
    this.BombCountLabel.string = `${bombCount}`;
  }
}
