import {
  _decorator,
  Component,
  EventTouch,
  Input,
  input,
  math,
  Node,
  v3
} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
  // 移動邊界範圍
  borderX: number = 230;
  borderY: number = 380;

  protected onLoad(): void {
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
  }

  start() {}

  update(deltaTime: number) {}

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
}
