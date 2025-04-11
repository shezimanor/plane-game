import { _decorator, CCInteger, CCString, Collider2D, Component } from 'cc';
import { Player } from './Player';
import { BulletPool } from './BulletPool';
const { ccclass, property } = _decorator;
@ccclass('Bullet')
export class Bullet extends Component {
  // 物件池名稱
  @property(CCString)
  public poolName: string = '';
  // 速度
  @property(CCInteger)
  public speed: number = 500;
  // 傷害值
  @property(CCInteger)
  public damage: number = 1;

  public collider: Collider2D = null;
  private _initWorldPositionX: number = 0;
  private _worldPositionY: number = 0;
  private _player: Player = null;
  private _bgHeight: number = 852;

  protected onLoad(): void {
    this._initWorldPositionX = this.node.worldPosition.x;
    this._worldPositionY = this.node.worldPosition.y;
    // 設定玩家實例
    this._player = this.node.parent.parent.getComponent(Player);
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

  stopAction() {
    if (this._player && this._player[this.poolName] instanceof BulletPool) {
      this._player[this.poolName].recycleBullet(this.node);
    } else {
      console.error('BulletPool not found');
      this.node.destroy();
    }
  }

  reset() {
    if (this.collider) this.collider.enabled = true;
  }
}
