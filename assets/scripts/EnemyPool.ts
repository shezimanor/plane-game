import { Prefab, Node, instantiate } from 'cc';

export class EnemyPool {
  // 這個 pool 只收已經停用的敵機
  public inactivePool: Set<Node> = new Set();
  public poolName: string = '';
  private _prefab: Prefab;

  constructor(prefab: Prefab, poolName: string) {
    this._prefab = prefab;
    this.poolName = poolName;
  }

  // 取得一個敵機
  getEnemy(): Node {
    // 如果有停用的敵機，就從停用的 pool 中取出
    if (this.inactivePool.size > 0) {
      for (const enemy of this.inactivePool) {
        // 標記成 active
        this.markAsActive(enemy);
        // 回傳
        return enemy;
      }
    } else {
      // 如果沒有，就從 pool 中取出一個新的敵機
      const enemy = instantiate(this._prefab);
      // 回傳
      return enemy;
    }
  }

  // 回收一個敵機
  recycleEnemy(enemy: Node) {
    // 停用這個敵機
    this.markAsInactive(enemy);
  }

  // 啟用一個敵機
  markAsActive(enemy: Node) {
    enemy.active = true;
    this.inactivePool.delete(enemy);
  }

  // 停用一個敵機
  markAsInactive(enemy: Node) {
    enemy.active = false;
    this.inactivePool.add(enemy);
  }
}
