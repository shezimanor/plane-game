import {
  _decorator,
  CCInteger,
  CCString,
  Collider2D,
  Component,
  Node,
  UITransform
} from 'cc';
import { RewardManager } from './RewardManager';
import { RewardPool } from './RewardPool';
const { ccclass, property } = _decorator;

export enum ShootType {
  TwoShoot = 1,
  BigBomb = 2
}

@ccclass('Reward')
export class Reward extends Component {
  // 物件池名稱
  @property(CCString)
  public poolName: string = '';
  // 速度
  @property(CCInteger)
  public speed: number = 200;
  // 獎品項目: 1, 2
  @property(CCInteger)
  public rewardType: ShootType = ShootType.TwoShoot;

  // 碰撞器會被玩家讀取
  public collider: Collider2D = null;
  private _rewardManager: RewardManager = null;
  private _bgHeight: number = 852;

  protected onLoad(): void {
    // 設定獎品管理器實例
    this._rewardManager = this.node.parent.getComponent(RewardManager);
    // 設定碰撞元件
    this.collider = this.getComponent(Collider2D);
  }

  protected onEnable(): void {
    // 獎品有獎品池做循環使用，所以 RewardPool.markAsInactive 會觸發 onEnable
    this.reset();
  }

  update(deltaTime: number) {
    const position = this.node.position;
    this.node.setPosition(
      position.x,
      position.y - this.speed * deltaTime,
      position.z
    );

    // 如果獎品超出邊界，就回收獎品
    if (
      this.node.position.y <
      -(this._bgHeight / 2 + this.getComponent(UITransform).height / 2 + 100)
    ) {
      this.stopAction();
    }
  }
  // 終止獎品行為
  stopAction() {
    if (
      this._rewardManager &&
      this._rewardManager[this.poolName] instanceof RewardPool
    ) {
      this._rewardManager[this.poolName].recycleReward(this.node);
    } else {
      console.error('RewardPool not found');
      this.node.destroy();
    }
  }

  // 重置獎品狀態
  reset() {
    // 啟用檢測元件
    if (this.collider) this.collider.enabled = true;
  }
}
