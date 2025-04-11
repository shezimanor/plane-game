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
  Enum,
  Sprite,
  SpriteFrame,
  UITransform
} from 'cc';
import { Bullet } from './Bullet';
import { CanvasGameManager } from './CanvasGameManager';
import { AudioManager } from './AudioManager';
import { EnemyPoolName, EnemyType, SoundClipType } from './types/enums';
import { EventManager } from './EventManager';
const { ccclass, property } = _decorator;

// 讓屬性裝飾器能看懂 EnemyType, SoundClipType
Enum(EnemyType);
Enum(SoundClipType);
Enum(EnemyPoolName);

@ccclass('Enemy')
export class Enemy extends Component {
  // 敵機類型
  @property({ type: EnemyType })
  public enemyType: EnemyType = EnemyType.Enemy0;
  // 物件池名稱
  @property({ type: EnemyPoolName })
  public poolName: EnemyPoolName = EnemyPoolName.EnemyPool_zero;
  // 被擊毀動畫（死亡動畫）
  @property(CCString)
  private destroyAnimationName: string = '';
  // 被擊中動畫（受傷動畫）
  @property(CCString)
  private hitAnimationName: string = '';
  // 速度
  @property(CCInteger)
  public speed: number = 200;
  // 生命值
  @property(CCInteger)
  private hp: number = 1;
  // 傷害值
  @property(CCInteger)
  public damage: number = 1;
  // 分數
  @property(CCInteger)
  public score: number = 100;
  // 音效類型
  @property({ type: SoundClipType })
  public destroySoundType: SoundClipType = SoundClipType.Enemy0Die;

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

  // 碰撞開始：目前有分組，只會和敵機產生碰撞
  onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
    const bullet = otherCollider.getComponent(Bullet);
    // 如果是子彈才處理
    if (!bullet) return;
    this.hp -= bullet.damage;
    if (this.hp <= 0) {
      this.die();
    } else {
      this.hit();
    }
    // 停用「子彈」的碰撞元件（停止檢測碰撞）
    bullet.collider.enabled = false;
    // 停用子彈行為
    this.scheduleOnce(() => {
      bullet.stopAction();
    }, 0);
  }

  // 終止敵機行為
  stopAction() {
    // 發布事件(EnemyManager.ts 訂閱)
    EventManager.eventTarget.emit('stopEnemy', this.node, this.poolName);
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

  hit() {
    // 播放被擊中動畫
    if (this.hitAnimationName) this._animation.play(this.hitAnimationName);
    // 播放音效
    AudioManager.instance.playSound(SoundClipType.Hit, 0.1);
  }

  die() {
    // 播放被擊毀動畫
    if (this.destroyAnimationName)
      this._animation.play(this.destroyAnimationName);
    // 停用碰撞元件（停止檢測碰撞）
    this._collider.enabled = false;
    // 更新分數
    CanvasGameManager.instance.addScore(this.score);
    // 播放音效
    AudioManager.instance.playSound(this.destroySoundType);
  }

  kill() {
    this.hp = 0;
    this.die();
  }
}
