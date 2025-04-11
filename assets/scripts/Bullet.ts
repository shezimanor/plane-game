import {
  _decorator,
  CCInteger,
  CCString,
  Collider2D,
  Component,
  Enum
} from 'cc';
import { EventManager } from './EventManager';
import { BulletPoolName } from './types/enums';
const { ccclass, property } = _decorator;

Enum(BulletPoolName);
@ccclass('Bullet')
export class Bullet extends Component {
  // 物件池名稱
  @property({ type: BulletPoolName })
  public poolName: BulletPoolName = BulletPoolName.BulletPool_one;
  // 速度
  @property(CCInteger)
  public speed: number = 500;
  // 傷害值
  @property(CCInteger)
  public damage: number = 1;

  public collider: Collider2D = null;
  private _initWorldPositionX: number = 0;
  private _worldPositionY: number = 0;
  private _bgHeight: number = 852;

  protected onLoad(): void {
    this._initWorldPositionX = this.node.worldPosition.x;
    this._worldPositionY = this.node.worldPosition.y;
    // 設定碰撞元件
    this.collider = this.getComponent(Collider2D);
  }

  protected onEnable(): void {
    // 子彈有子彈池做循環使用，所以 BulletPool.markAsInactive 會觸發 onEnable
    this.reset();
  }

  update(deltaTime: number) {
    this._worldPositionY += this.speed * deltaTime;
    this.node.setWorldPosition(
      this._initWorldPositionX,
      this._worldPositionY,
      0
    );

    // 如果子彈超出邊界，就回收子彈
    if (this._worldPositionY > this._bgHeight) {
      this.stopAction();
    }
  }

  // 設定子彈的初始x座標，因為飛機會動，但子彈的 x 是固定的。
  setInitWorldPositionX() {
    this._initWorldPositionX = this.node.worldPosition.x;
    this._worldPositionY = this.node.worldPosition.y;
  }

  // 終止子彈行為
  stopAction() {
    // 發布事件(Player.ts 訂閱)
    EventManager.eventTarget.emit('stopBullet', this.node, this.poolName);
  }

  reset() {
    if (this.collider) this.collider.enabled = true;
  }
}
