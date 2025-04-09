import { _decorator, CCInteger, Component, Node } from 'cc';
import { Player } from './Player';
import { BulletPool } from './BulletPool';
const { ccclass, property } = _decorator;
@ccclass('Bullet')
export class Bullet extends Component {
  @property(CCInteger)
  public speed: number = 500;

  public poolName: string = '';
  private _initWorldPositionX: number = 0;
  private _player: Player = null;
  private _bgHeight: number = 852;

  start() {
    this._initWorldPositionX = this.node.worldPosition.x;
    // 設定玩家實例
    this._player = this.node.parent.parent.getComponent(Player);
  }

  update(deltaTime: number) {
    const position = this.node.worldPosition;
    this.node.setWorldPosition(
      this._initWorldPositionX,
      position.y + this.speed * deltaTime,
      position.z
    );
    if (position.y > this._bgHeight) {
      if (this._player && this._player[this.poolName] instanceof BulletPool) {
        this._player[this.poolName].recycleBullet(this.node);
        // this.node.removeFromParent();
      } else {
        console.error('BulletPool not found');
        this.node.destroy();
      }
    }
  }

  // 設定子彈的初始x座標，因為飛機會動，但子彈的 x 是固定的。
  setInitWorldPositionX() {
    this._initWorldPositionX = this.node.worldPosition.x;
  }

  setPoolName(name: string) {
    this.poolName = name;
  }
}
