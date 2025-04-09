import {
  _decorator,
  CCFloat,
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
  public shootType: ShootType = ShootType.TwoShoot;
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

  start() {}

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
    const bullet = instantiate(this.bullet01Prefab);
    bullet.setParent(this.bulletParent);
    bullet.setPosition(this.bullet01InitVec3);
  }
  twoShoot() {
    const bulletLeft = instantiate(this.bullet02Prefab);
    const bulletRight = instantiate(this.bullet02Prefab);
    bulletLeft.setParent(this.bulletParent);
    bulletRight.setParent(this.bulletParent);
    bulletLeft.setPosition(this.bullet02LeftInitVec3);
    bulletRight.setPosition(this.bullet02RightInitVec3);
  }
}
