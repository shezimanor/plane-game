import {
  _decorator,
  Animation,
  CCInteger,
  Component,
  Node,
  UITransform,
  v3,
  Vec3
} from 'cc';
import { EnemyManager } from './EnemyManager';
import { EnemyPool } from './EnemyPool';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {
  @property(Animation)
  public destroyAnimation: Animation = null;
  @property(CCInteger)
  public speed: number = 200;

  public poolName: string = '';
  private _enemyManager: EnemyManager = null;

  private _bgHeight: number = 852;

  start() {
    // 設定敵機管理器實例
    this._enemyManager = this.node.parent.getComponent(EnemyManager);
  }

  update(deltaTime: number) {
    const position = this.node.position;
    this.node.setPosition(
      position.x,
      position.y - this.speed * deltaTime,
      position.z
    );

    // 暫定回收條件
    if (
      this.node.position.y <
      -(this._bgHeight / 2 + this.getComponent(UITransform).height / 2)
    ) {
      if (
        this._enemyManager &&
        this._enemyManager[this.poolName] instanceof EnemyPool
      ) {
        this._enemyManager[this.poolName].recycleEnemy(this.node);
      } else {
        console.error('EnemyPool not found');
        this.node.destroy();
      }
    }
  }

  // 設定敵機池的名稱
  setPoolName(name: string) {
    this.poolName = name;
  }
}
