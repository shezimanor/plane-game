import {
  _decorator,
  CCFloat,
  CCInteger,
  Component,
  EventTouch,
  Input,
  input,
  instantiate,
  math,
  Node,
  Prefab,
  v3,
  Vec3
} from 'cc';
import { BulletPool } from './BulletPool';
import { Bullet } from './Bullet';
const { ccclass, property } = _decorator;

enum ShootType {
  OneShoot,
  TwoShoot
}

@ccclass('Player')
export class Player extends Component {
  @property(Node)
  public bulletParent: Node = null;
  @property(Prefab)
  public bullet01Prefab: Prefab = null;
  @property(Prefab)
  public bullet02Prefab: Prefab = null;
  // 子彈發射速率
  @property(CCFloat)
  public shootRate: number = 0.3;
  // 子彈計時器
  public shootTimer: number = 0;
  // 子彈發射類型
  @property(CCInteger)
  public shootType: ShootType = ShootType.TwoShoot;
  // 子彈池
  public bulletPool_one: BulletPool = null;
  public bulletPool_two: BulletPool = null;
  // 移動邊界範圍
  public borderX: number = 230;
  public borderY: number = 380;
  public tempVec3: Vec3 = v3(0, 0, 0);
  // 子彈一的初始位置是 bulletParent 的錨點位置
  public bullet01InitVec3: Vec3 = v3(0, 0, 0);
  // 子彈二的雙發初始位置是飛機圖片的兩翼槍口位置（一樣是 bulletParent 的本地座標）
  public bullet02LeftInitVec3: Vec3 = v3(-22, -29.5, 0);
  public bullet02RightInitVec3: Vec3 = v3(22, -29.5, 0);

  protected onLoad(): void {
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
  }

  start() {
    // 設定子彈池
    this.bulletPool_one = new BulletPool(this.bullet01Prefab, 'bulletPool_one');
    this.bulletPool_two = new BulletPool(this.bullet02Prefab, 'bulletPool_two');
  }

  update(deltaTime: number) {
    this.shootTimer += deltaTime;
    if (this.shootTimer >= this.shootRate) {
      this.shootTimer = 0;
      // 決定發射模式
      switch (this.shootType) {
        case ShootType.OneShoot:
          this.oneShoot();
          break;
        case ShootType.TwoShoot:
          this.twoShoot();
          break;
      }
    }
  }

  protected onDestroy(): void {
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
  }

  onTouchMove(event: EventTouch) {
    const position = this.node.position;
    let targetPosition = this.tempVec3.set(
      math.clamp(position.x + event.getDeltaX(), -this.borderX, this.borderX),
      math.clamp(position.y + event.getDeltaY(), -this.borderY, this.borderY),
      position.z
    );
    this.node.setPosition(targetPosition);
  }

  oneShoot() {
    const bullet = this.bulletPool_one.getBullet();
    // 設定位置
    bullet.setPosition(this.bullet01InitVec3);
    // 設定子彈的初始 x 座標，因為飛機會動，但子彈的 x 是固定的。
    bullet.getComponent(Bullet).setInitWorldPositionX();
    // 設定父節點
    bullet.setParent(this.bulletParent);
  }
  twoShoot() {
    const bulletLeft = this.bulletPool_two.getBullet();
    const bulletRight = this.bulletPool_two.getBullet();
    // 設定位置
    bulletLeft.setPosition(this.bullet02LeftInitVec3);
    bulletRight.setPosition(this.bullet02RightInitVec3);
    // 設定子彈的初始 x 座標，因為飛機會動，但子彈的 x 是固定的。
    bulletLeft.getComponent(Bullet).setInitWorldPositionX();
    bulletRight.getComponent(Bullet).setInitWorldPositionX();
    // 設定父節點
    bulletLeft.setParent(this.bulletParent);
    bulletRight.setParent(this.bulletParent);
  }
}
