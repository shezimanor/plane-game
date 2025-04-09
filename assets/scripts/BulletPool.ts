import { Prefab, Node, instantiate } from 'cc';
import { Bullet } from './Bullet';

export class BulletPool {
  // 這個 pool 只收已經停用的子彈
  public inactivePool: Set<Node> = new Set();
  public poolName: string = '';
  private _prefab: Prefab;

  constructor(prefab: Prefab, poolName: string) {
    this._prefab = prefab;
    this.poolName = poolName;
  }

  // 取得一個子彈
  getBullet(): Node {
    // 如果有停用的子彈，就從停用的 pool 中取出
    if (this.inactivePool.size > 0) {
      for (const bullet of this.inactivePool) {
        // 標記成 active
        this.markAsActive(bullet);
        // 回傳
        return bullet;
      }
    } else {
      // 如果沒有，就從 pool 中取出一個新的子彈
      const bullet = instantiate(this._prefab);
      // 設定 poolName
      bullet.getComponent(Bullet).setPoolName(this.poolName);
      // 回傳
      return bullet;
    }
  }

  // 回收一個子彈
  recycleBullet(bullet: Node) {
    // 停用這個子彈
    this.markAsInactive(bullet);
  }

  // 啟用一個子彈
  markAsActive(bullet: Node) {
    bullet.active = true;
    this.inactivePool.delete(bullet);
  }

  // 停用一個子彈
  markAsInactive(bullet: Node) {
    bullet.active = false;
    this.inactivePool.add(bullet);
  }
}
