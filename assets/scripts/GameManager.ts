import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
  private static _instance: GameManager = null;
  public static get instance(): GameManager {
    return GameManager._instance;
  }

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

  start() {}

  update(deltaTime: number) {}

  protected onDestroy(): void {
    if (GameManager._instance === this) {
      GameManager._instance = null;
    }
  }
}
