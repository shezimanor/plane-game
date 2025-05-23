import { _decorator, CCFloat, Component, math, Node, Prefab } from 'cc';
import { EnemyPool } from './EnemyPool';
import { EventManager } from './EventManager';
import { Enemy } from './Enemy';
import { EnemyPoolName } from './types/enums';
const { ccclass, property } = _decorator;

type EnemyCoordinate = {
  x: number;
  y: number;
};

@ccclass('EnemyManager')
export class EnemyManager extends Component {
  private static _instance: EnemyManager = null;
  public static get instance(): EnemyManager {
    return EnemyManager._instance;
  }
  // 預製體
  @property(Prefab)
  public enemy00Prefab: Prefab = null;
  @property(Prefab)
  public enemy01Prefab: Prefab = null;
  @property(Prefab)
  public enemy02Prefab: Prefab = null;
  // 生成頻率
  @property(CCFloat)
  public enemy00SpawnRate: number = 1;
  @property(CCFloat)
  public enemy01SpawnRate: number = 3.5;
  @property(CCFloat)
  public enemy02SpawnRate: number = 20;

  // 敵機池
  public enemyPool_zero: EnemyPool = null;
  public enemyPool_one: EnemyPool = null;
  public enemyPool_two: EnemyPool = null;

  // 敵機生成座標數據(x是範圍, y是固定值)
  public enemy00Coordinate: EnemyCoordinate = { x: 215, y: 445 };
  public enemy01Coordinate: EnemyCoordinate = { x: 200, y: 475 };
  public enemy02Coordinate: EnemyCoordinate = { x: 155, y: 555 };

  protected onLoad(): void {
    if (!EnemyManager._instance) {
      EnemyManager._instance = this;
    } else {
      this.destroy();
    }
    // 註冊事件
    EventManager.eventTarget.on('detonateBomb', this.killAllEnemy, this);
    // 訂閱事件(Enemy.ts發布)
    EventManager.eventTarget.on('stopEnemy', this.stopEnemy, this);
  }

  start() {
    // 設定敵機池
    this.enemyPool_zero = new EnemyPool(this.enemy00Prefab, 'enemyPool_zero');
    this.enemyPool_one = new EnemyPool(this.enemy01Prefab, 'enemyPool_one');
    this.enemyPool_two = new EnemyPool(this.enemy02Prefab, 'enemyPool_two');
    // 設定敵機生成計時器
    this.schedule(this.spawnEnemy00, this.enemy00SpawnRate);
    this.schedule(this.spawnEnemy01, this.enemy01SpawnRate);
    this.schedule(this.spawnEnemy02, this.enemy02SpawnRate);
  }

  protected onDestroy(): void {
    if (EnemyManager._instance === this) {
      EnemyManager._instance = null;
    }
    this.unschedule(this.spawnEnemy00);
    this.unschedule(this.spawnEnemy01);
    this.unschedule(this.spawnEnemy02);
    // 註銷事件
    EventManager.eventTarget.off('detonateBomb', this.killAllEnemy, this);
    EventManager.eventTarget.off('stopEnemy', this.stopEnemy, this);
  }

  spawnEnemy00() {
    this.spawnEnemy(this.enemyPool_zero, this.enemy00Coordinate);
  }

  spawnEnemy01() {
    this.spawnEnemy(this.enemyPool_one, this.enemy01Coordinate);
  }

  spawnEnemy02() {
    this.spawnEnemy(this.enemyPool_two, this.enemy02Coordinate);
  }

  spawnEnemy(enemyPool: EnemyPool, enemyCoordinate: EnemyCoordinate) {
    const enemy = enemyPool.getEnemy();
    // 設定位置
    enemy.setPosition(
      math.randomRangeInt(-enemyCoordinate.x, enemyCoordinate.x + 1),
      enemyCoordinate.y,
      0
    );
    // 設定父節點
    enemy.setParent(this.node);
  }

  stopEnemy(enemy: Node, poolName: EnemyPoolName) {
    switch (poolName) {
      case EnemyPoolName.EnemyPool_zero:
        if (this.enemyPool_zero) {
          this.enemyPool_zero.recycleEnemy(enemy);
        } else {
          console.error('EnemyPool0 not found');
          enemy.destroy();
        }
        break;
      case EnemyPoolName.EnemyPool_one:
        if (this.enemyPool_one) {
          this.enemyPool_one.recycleEnemy(enemy);
        } else {
          console.error('EnemyPool1 not found');
          enemy.destroy();
        }
        break;
      case EnemyPoolName.EnemyPool_two:
        if (this.enemyPool_two) {
          this.enemyPool_two.recycleEnemy(enemy);
        } else {
          console.error('EnemyPool2 not found');
          enemy.destroy();
        }
        break;
    }
  }

  killAllEnemy() {
    // 回收所有敵機
    this.node.children.forEach((childNode: Node) => {
      const enemy = childNode.getComponent(Enemy);
      // 如果是敵機（正常情況這個節點內只有敵機），且子節點是啟用狀態並且在畫面中，就回收敵機
      if (enemy && childNode.active && Math.abs(childNode.position.y) <= 450) {
        enemy.kill();
      }
    });
  }
}
