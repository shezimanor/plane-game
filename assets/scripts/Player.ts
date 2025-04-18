import {
  _decorator,
  Animation,
  AnimationState,
  CCFloat,
  CCInteger,
  CCString,
  Collider2D,
  color,
  Color,
  Component,
  Contact2DType,
  EventTouch,
  game,
  Input,
  input,
  math,
  Node,
  Prefab,
  Sprite,
  SpriteFrame,
  UITransform,
  v3,
  Vec3
} from 'cc';
import { BulletPool } from './BulletPool';
import { Enemy } from './Enemy';
import { Reward } from './Reward';
import { CanvasGameManager } from './CanvasGameManager';
import { EventManager } from './EventManager';
import { AudioManager } from './AudioManager';
import { BulletPoolName, ShootType, SoundClipType } from './types/enums';
import { Bullet } from './Bullet';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
  // 子彈生成的節點
  @property(Node)
  public bulletParent: Node = null;
  // 子彈一預製體
  @property(Prefab)
  public bullet01Prefab: Prefab = null;
  // 子彈二預製體
  @property(Prefab)
  public bullet02Prefab: Prefab = null;
  // 被擊毀動畫（死亡動畫）
  @property(CCString)
  private destroyAnimationName: string = '';
  // 被擊中動畫（受傷動畫）
  @property(CCString)
  private hitAnimationName: string = '';
  // 備注一下： Default Clip: PlayerIdle
  // 子彈發射類型
  @property(CCInteger)
  public shootType: ShootType = ShootType.TwoShoot;
  // 子彈發射速率
  @property(CCFloat)
  public shootRate: number = 0.3;
  // 生命值
  @property(CCInteger)
  public hp: number = 3;
  // 雙發模式的時效
  @property(CCInteger)
  public twoShootDuration: number = 5;

  // 子彈池
  public bulletPool_one: BulletPool = null;
  public bulletPool_two: BulletPool = null;
  // 移動邊界範圍
  public borderX: number = 230;
  public borderY: number = 380;
  public tempUIVec3: Vec3 = new Vec3(0, 0, 0);
  public tempLocalVec3: Vec3 = new Vec3(0, 0, 0);
  // 子彈一的初始位置是 bulletParent 的錨點位置
  public bullet01InitVec3: Vec3 = v3(0, 0, 0);
  // 子彈二的雙發初始位置是飛機圖片的兩翼槍口位置（一樣是 bulletParent 的本地座標）
  public bullet02LeftInitVec3: Vec3 = v3(-22, -29.5, 0);
  public bullet02RightInitVec3: Vec3 = v3(22, -29.5, 0);
  // 雙發模式的計時器
  private _twoShootTimer: number = 0;

  // 子彈計時器
  private _shootTimer: number = 0;
  // 碰撞器(Player 的碰撞群組為 DEFAULT)
  private _collider: Collider2D = null;
  private _animation: Animation = null;
  private _maxHp: number = 1;
  private _body: Sprite = null;
  private _spriteFrame: SpriteFrame = null;
  // 無敵狀態（可以建立無敵時間計時器，但目前是直接使用被擊中的動畫時長）
  private _isInvisible: boolean = false;
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
    // 設定子彈池
    this.bulletPool_one = new BulletPool(this.bullet01Prefab, 'bulletPool_one');
    this.bulletPool_two = new BulletPool(this.bullet02Prefab, 'bulletPool_two');
    // 設定觸控事件
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    // 事件訂閱(Bullet.ts發布)
    EventManager.eventTarget.on('stopBullet', this.stopBullet, this);
  }

  protected onEnable(): void {
    this.reset();
  }

  start() {
    // 更新 UI
    EventManager.eventTarget.emit('updatePlayerHp', this.hp);
  }

  update(deltaTime: number) {
    // 如果血量 <= 0, 或是無敵時間就不處理
    if (this.hp <= 0 || this._isInvisible) return;
    // 自動發射
    this._shootTimer += deltaTime;
    // 雙發模式有計時器
    if (this.shootType === ShootType.TwoShoot) this._twoShootTimer += deltaTime;
    // 計時器到達發射速率就發射
    if (this._shootTimer >= this.shootRate) {
      this._shootTimer = 0;
      // 決定發射模式
      switch (this.shootType) {
        case ShootType.OneShoot:
          this.oneShoot();
          break;
        case ShootType.TwoShoot:
          this.twoShoot();
          // 雙發模式有計時器
          if (this._twoShootTimer >= this.twoShootDuration) {
            this.shootType = ShootType.OneShoot;
            this._twoShootTimer = 0;
          }
          break;
      }
    }
  }

  protected onDestroy(): void {
    // 註銷觸控事件
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
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
    // 註銷事件訂閱
    EventManager.eventTarget.off('stopBullet', this.stopBullet, this);
  }

  onTouchMove(event: EventTouch) {
    // 取得當前觸控點的 UI 座標
    const touchUIPosition = event.getUILocation();
    this.tempUIVec3.set(touchUIPosition.x, touchUIPosition.y, 0);
    // 轉換為本地座標
    this.node.parent
      .getComponent(UITransform)
      .convertToNodeSpaceAR(this.tempUIVec3, this.tempLocalVec3);
    // const position = this.node.position;
    let targetPosition = this.tempLocalVec3.set(
      math.clamp(this.tempLocalVec3.x, -this.borderX, this.borderX),
      math.clamp(this.tempLocalVec3.y, -this.borderY, this.borderY),
      this.tempLocalVec3.z
    );
    this.node.setPosition(targetPosition);
  }

  oneShoot() {
    const bullet = this.bulletPool_one.getBullet();
    const bulletInstance = bullet.getComponent(Bullet);
    // 設定位置
    bullet.setPosition(this.bullet01InitVec3);
    // 設定子彈的初始 x 座標，因為飛機會動，但子彈的 x 是固定的。
    bulletInstance.setInitWorldPositionX();
    // 設定父節點
    bullet.setParent(this.bulletParent);
    // 子彈音效
    AudioManager.instance.playSound(SoundClipType.Bullet);
  }

  twoShoot() {
    const bulletLeft = this.bulletPool_two.getBullet();
    const bulletRight = this.bulletPool_two.getBullet();
    const bulletLeftInstance = bulletLeft.getComponent(Bullet);
    const bulletRightInstance = bulletRight.getComponent(Bullet);
    // 設定位置
    bulletLeft.setPosition(this.bullet02LeftInitVec3);
    bulletRight.setPosition(this.bullet02RightInitVec3);
    // 設定子彈的初始 x 座標，因為飛機會動，但子彈的 x 是固定的。
    bulletLeftInstance.setInitWorldPositionX();
    bulletRightInstance.setInitWorldPositionX();
    // 設定父節點
    bulletLeft.setParent(this.bulletParent);
    bulletRight.setParent(this.bulletParent);
    // 子彈音效
    AudioManager.instance.playSound(SoundClipType.Bullet);
  }

  // 動畫播放結束
  onAnimationFinished(type: Animation.EventType, state: AnimationState) {
    if (state.name === this.destroyAnimationName) {
      // 遊戲結束
      game.pause();
      // 顯示結束畫面(會同時更新結算分數畫面)
      EventManager.eventTarget.emit(
        'gameOver',
        CanvasGameManager.instance.getPlayerScore()
      );
    } else if (state.name === this.hitAnimationName) {
      // 結束無敵狀態
      this._isInvisible = false;
    }
  }

  // 碰撞開始：目前有分組(DEFAULT)，只會和敵機(Enemy)產生碰撞
  onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
    // 無敵狀態不處理碰撞
    if (this._isInvisible) return;
    switch (otherCollider.group) {
      // 敵機 2^2
      case 4:
        const enemy = otherCollider.getComponent(Enemy);
        this.contactEnemy(enemy);
        break;
      // 獎品 2^3
      case 8:
        const reward = otherCollider.getComponent(Reward);
        this.contactReward(reward);
        break;
    }
  }

  contactReward(reward: Reward) {
    // 有獎品才處理
    if (!reward) return;
    // 獎品類型
    switch (reward.rewardType) {
      // 雙發子彈
      case 1:
        this.shootType = ShootType.TwoShoot;
        // 設定計時器：雙發子彈有時效性，而且可以延長時間(timer 歸零)，所以使用 update 自定義定時器
        this._twoShootTimer = 0;
        // 播放音效
        AudioManager.instance.playSound(SoundClipType.GetDouble);
        break;
      // 大炸彈
      case 2:
        CanvasGameManager.instance.addBomb();
        // 播放音效
        AudioManager.instance.playSound(SoundClipType.GetBomb);
        break;
    }
    // 停用碰撞元件（停止檢測碰撞）
    reward.collider.enabled = false;
    // 停用獎品行為
    this.scheduleOnce(() => {
      reward.stopAction();
    }, 0);
  }

  contactEnemy(enemy: Enemy) {
    // 有敵機才處理
    if (!enemy) return;
    this.hp -= enemy.damage;
    // 更新 UI
    EventManager.eventTarget.emit('updatePlayerHp', this.hp);
    // 判斷血量
    if (this.hp <= 0) {
      this.die();
    } else {
      this.hit();
    }
  }

  die() {
    // 播放被擊毀動畫
    if (this.destroyAnimationName)
      this._animation.play(this.destroyAnimationName);
    // 停用碰撞元件（停止檢測碰撞）
    this._collider.enabled = false;
    // 播放音效
    AudioManager.instance.playSound(SoundClipType.GameOver);
  }

  hit() {
    // 播放被擊中動畫
    if (this.hitAnimationName) this._animation.play(this.hitAnimationName);
    // 要進入無敵狀態(由被擊中動畫來控制無敵時間長度，目前是0.5秒)
    this._isInvisible = true;
    // 播放音效
    AudioManager.instance.playSound(SoundClipType.Hit);
  }

  // 重置玩家狀態(不一定會用到)
  reset() {
    // 重置血量
    this.hp = this._maxHp;
    // 更新 UI
    EventManager.eventTarget.emit('updatePlayerHp', this.hp);
    // 重置 spriteFrame, color
    if (this._body) {
      this._body.spriteFrame = this._spriteFrame;
      this._body.color = this._color;
    }
    // 啟用檢測元件
    if (this._collider) this._collider.enabled = true;
  }

  stopBullet(bullet: Node, poolName: BulletPoolName) {
    switch (poolName) {
      case BulletPoolName.BulletPool_one:
        if (this.bulletPool_one) {
          this.bulletPool_one.recycleBullet(bullet);
        } else {
          console.error('BulletPool not found');
          bullet.destroy();
        }
        break;
      case BulletPoolName.BulletPool_two:
        if (this.bulletPool_two) {
          this.bulletPool_two.recycleBullet(bullet);
        } else {
          console.error('BulletPool not found');
          bullet.destroy();
        }
        break;
    }
  }
}
