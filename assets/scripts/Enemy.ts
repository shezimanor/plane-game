import {
  _decorator,
  Animation,
  CCInteger,
  CCString,
  Collider2D,
  Component,
  Contact2DType,
  Node,
  Sprite,
  SpriteFrame,
  UITransform,
  v3,
  Vec3
} from 'cc';
import { EnemyManager } from './EnemyManager';
import { EnemyPool } from './EnemyPool';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {
  // 被擊毀動畫（死亡動畫）
  @property(CCString)
  private destroyAnimationName: string = '';
  // 被擊中動畫（受傷動畫）
  @property(CCString)
  private hitAnimationName: string = '';
  // 物件池名稱
  @property(CCString)
  public poolName: string = '';
  // 速度
  @property(CCInteger)
  public speed: number = 200;
  // 生命值
  @property(CCInteger)
  private hp: number = 1;

  private _enemyManager: EnemyManager = null;
  private _bgHeight: number = 852;
  private _collider: Collider2D = null;
  private _animation: Animation = null;
  private _maxHp: number = 1;
  private _body: Sprite = null;
  private _spriteFrame: SpriteFrame = null;

  protected onLoad(): void {
    // 儲存初始數據（用來重置）一定要寫在這裡面，因為 onLoad 會在 onEnable 前執行
    this._maxHp = this.hp;
    this._body = this.node.getChildByName('Body').getComponent(Sprite);
    this._spriteFrame = this._body.spriteFrame;
    // 設定敵機管理器實例
    this._enemyManager = this.node.parent.getComponent(EnemyManager);
    // 設定動畫元件
    this._animation = this.getComponent(Animation);
    // 註冊碰撞事件
    this._collider = this.getComponent(Collider2D);
    if (this._collider) {
      this._collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
  }

  protected onEnable(): void {
    // 敵機有敵機池做循環使用，所以 EnemyPool.markAsInactive 會觸發 onEnable
    this.reset();
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

  protected onDestroy(): void {
    // 註銷碰撞事件
    if (this._collider) {
      this._collider.off(
        Contact2DType.BEGIN_CONTACT,
        this.onBeginContact,
        this
      );
    }
  }

  // 碰撞開始
  onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
    // console.log(selfCollider.name, otherCollider.name);
  }

  // 重置敵機狀態
  reset() {
    // 重置血量
    this.hp = this._maxHp;
    // 重置 spriteFrame
    this._body.spriteFrame = this._spriteFrame;
    // 啟用檢測元件
    this._collider.enabled = true;
  }
}
