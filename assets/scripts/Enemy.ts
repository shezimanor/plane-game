import {
  _decorator,
  Animation,
  AnimationState,
  CCInteger,
  CCString,
  Collider2D,
  color,
  Color,
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
import { Bullet } from './Bullet';
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
  // 因為擊毀動畫播放會改變顏色 alpha，所以要還原
  private _color: Color = color(255, 255, 255, 255);

  protected onLoad(): void {
    // 儲存初始數據（用來重置）一定要寫在這裡面，因為 onLoad 會在 onEnable 前執行
    this._maxHp = this.hp;
    this._body = this.node.getChildByName('Body').getComponent(Sprite);
    this._spriteFrame = this._body ? this._body.spriteFrame : null;
    // 設定動畫元件
    this._animation = this._body ? this._body.getComponent(Animation) : null;
    if (this._animation) {
      this._animation.on(
        Animation.EventType.FINISHED,
        this.onAnimationFinished,
        this
      );
    }
    // 設定碰撞元件
    this._collider = this.getComponent(Collider2D);
    if (this._collider) {
      this._collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
    // 設定敵機管理器實例
    this._enemyManager = this.node.parent.getComponent(EnemyManager);
  }

  protected onEnable(): void {
    console.log('enemy onEnable');
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

    // 如果敵機超出邊界，就回收敵機
    if (
      this.node.position.y <
      -(this._bgHeight / 2 + this.getComponent(UITransform).height / 2)
    ) {
      this.stopAction();
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
    // 註銷動畫事件
    if (this._animation) {
      this._animation.off(
        Animation.EventType.FINISHED,
        this.onAnimationFinished,
        this
      );
    }
  }

  // 動畫播放結束
  onAnimationFinished(type: Animation.EventType, state: AnimationState) {
    if (state.name === this.destroyAnimationName) {
      // 停用敵機行為
      this.stopAction();
    }
  }

  // 碰撞開始
  onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
    // console.log(selfCollider.name, otherCollider.name);
    const bullet = otherCollider.getComponent(Bullet);
    // 如果是子彈才處理
    if (!bullet) return;
    this.hp -= bullet.damage;
    if (this.hp <= 0) {
      // 播放被擊毀動畫
      if (this.destroyAnimationName)
        this._animation.play(this.destroyAnimationName);
      // 停用碰撞元件（停止檢測碰撞）
      this._collider.enabled = false;
    } else {
      // 播放被擊中動畫
      if (this.hitAnimationName) this._animation.play(this.hitAnimationName);
    }
    // 停用「子彈」的碰撞元件（停止檢測碰撞）
    bullet.collider.enabled = false;
    // 停用子彈行為
    this.scheduleOnce(() => {
      bullet.stopAction();
    }, 0.1);
  }

  // 終止敵機行為
  stopAction() {
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

  // 重置敵機狀態
  reset() {
    // 重置血量
    this.hp = this._maxHp;
    // 重置 spriteFrame, color
    if (this._body) {
      this._body.spriteFrame = this._spriteFrame;
      this._body.color = this._color;
    }
    // 啟用檢測元件
    if (this._collider) this._collider.enabled = true;
  }
}
