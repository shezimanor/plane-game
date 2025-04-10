import { Prefab, Node, instantiate } from 'cc';
import { Reward } from './Reward';

export class RewardPool {
  // 這個 pool 只收已經停用的獎品
  public inactivePool: Set<Node> = new Set();
  public poolName: string = '';
  private _prefab: Prefab;

  constructor(prefab: Prefab, poolName: string) {
    this._prefab = prefab;
    this.poolName = poolName;
  }

  // 取得一個獎品
  getReward(): Node {
    // 如果有停用的獎品，就從停用的 pool 中取出
    if (this.inactivePool.size > 0) {
      for (const reward of this.inactivePool) {
        // 標記成 active
        this.markAsActive(reward);
        // 回傳
        return reward;
      }
    } else {
      // 如果沒有，就從 pool 中取出一個新的獎品
      const reward = instantiate(this._prefab);
      // 回傳
      return reward;
    }
  }

  // 回收一個獎品
  recycleReward(reward: Node) {
    // 停用這個獎品
    this.markAsInactive(reward);
  }

  // 啟用一個獎品
  markAsActive(reward: Node) {
    reward.active = true;
    this.inactivePool.delete(reward);
  }

  // 停用一個獎品
  markAsInactive(reward: Node) {
    reward.active = false;
    this.inactivePool.add(reward);
  }
}
