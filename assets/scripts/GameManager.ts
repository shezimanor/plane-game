import { _decorator, CCInteger, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
  private static _instance: GameManager = null;
  public static get instance(): GameManager {
    return GameManager._instance;
  }

  // 炸彈數量
  @property(CCInteger)
  bombCount: number = 0;

  protected onLoad(): void {
    // 單例模式
    if (!GameManager._instance) {
      // console.log('GameManager instance created');
      GameManager._instance = this;
    } else {
      this.destroy();
    }
    // 設為常駐節點(防止切換場景時被卸載)
    director.addPersistRootNode(this.node);
  }

  protected onDestroy(): void {
    if (GameManager._instance === this) {
      GameManager._instance = null;
    }
  }

  addBomb() {
    this.bombCount++;
  }
}
