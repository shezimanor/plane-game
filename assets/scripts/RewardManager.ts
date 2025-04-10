import { _decorator, CCFloat, Component, math, Node, Prefab } from 'cc';
import { RewardPool } from './RewardPool';
const { ccclass, property } = _decorator;

type RewardCoordinate = {
  x: number;
  y: number;
};

@ccclass('RewardManager')
export class RewardManager extends Component {
  private static _instance: RewardManager = null;
  public static get instance(): RewardManager {
    return RewardManager._instance;
  }
  // 預製體
  @property(Prefab)
  public reward01Prefab: Prefab = null;
  @property(Prefab)
  public reward02Prefab: Prefab = null;
  // 生成頻率
  @property(CCFloat)
  public reward01SpawnRate: number = 7;
  @property(CCFloat)
  public reward02SpawnRate: number = 10;
  // 獎品池
  public rewardPool_one: RewardPool = null;
  public rewardPool_two: RewardPool = null;
  // 獎品生成座標數據(x是範圍, y是固定值)
  public reward01Coordinate: RewardCoordinate = { x: 200, y: 505 };
  public reward02Coordinate: RewardCoordinate = { x: 200, y: 525 };

  protected onLoad(): void {
    if (!RewardManager._instance) {
      RewardManager._instance = this;
    } else {
      this.destroy();
    }
  }

  start() {
    // 設定獎品池
    this.rewardPool_one = new RewardPool(this.reward01Prefab, 'rewardPool_one');
    this.rewardPool_two = new RewardPool(this.reward02Prefab, 'rewardPool_two');
    // 設定獎品生成計時器(也可以改成一個計時器隨機發放)
    this.schedule(this.spawnReward01, this.reward01SpawnRate);
    this.schedule(this.spawnReward02, this.reward02SpawnRate);
  }

  protected onDestroy(): void {
    if (RewardManager._instance === this) {
      RewardManager._instance = null;
    }
    this.unschedule(this.spawnReward01);
    this.unschedule(this.spawnReward02);
  }

  spawnReward01() {
    this.spawnReward(this.rewardPool_one, this.reward01Coordinate);
  }

  spawnReward02() {
    this.spawnReward(this.rewardPool_two, this.reward02Coordinate);
  }

  spawnReward(rewardPool: RewardPool, rewardCoordinate: RewardCoordinate) {
    const reward = rewardPool.getReward();
    // 設定位置
    reward.setPosition(
      math.randomRangeInt(-rewardCoordinate.x, rewardCoordinate.x + 1),
      rewardCoordinate.y,
      0
    );
    // 設定父節點
    reward.setParent(this.node);
  }
}
