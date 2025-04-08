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
  v3
} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
  // 子彈發射點(純定位用)
  @property(Node)
  public bulletShootPoint: Node = null;
  @property(Node)
  public bulletParent: Node = null;
  @property(Prefab)
  public bullet01Prefab: Prefab = null;
  // 子彈發射速率
  @property(CCFloat)
  public shootRate: number = 0.3;
  // 子彈計時器
  public shootTimer: number = 0;
  // 移動邊界範圍
  public borderX: number = 230;
  public borderY: number = 380;

  protected onLoad(): void {
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
  }

  start() {}

  update(deltaTime: number) {
    this.shootTimer += deltaTime;
    if (this.shootTimer >= this.shootRate) {
      this.shootTimer = 0;
      this.shootBullet01();
    }
  }

  protected onDestroy(): void {
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
  }

  onTouchMove(event: EventTouch) {
    const position = this.node.position;
    let targetPosition = v3(
      math.clamp(position.x + event.getDeltaX(), -this.borderX, this.borderX),
      math.clamp(position.y + event.getDeltaY(), -this.borderY, this.borderY),
      position.z
    );
    this.node.setPosition(targetPosition);
  }

  shootBullet01() {
    const bullet01 = instantiate(this.bullet01Prefab);
    bullet01.setParent(this.bulletParent);
    bullet01.setWorldPosition(this.bulletShootPoint.worldPosition);
  }
}
