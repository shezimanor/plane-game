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
  bombCount: number = 0;

  protected onLoad(): void {
    // 單例模式
    if (!CanvasGameManager._instance) {
      // console.log('CanvasGameManager instance created');
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
    this.bombCount += 1;
    console.log('Bomb Count', this.bombCount);
    EventManager.eventTarget.emit('updateBombCount', this.bombCount);
  }
}
