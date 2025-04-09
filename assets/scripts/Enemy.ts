import {
  _decorator,
  Animation,
  CCInteger,
  Component,
  Node,
  v3,
  Vec3
} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {
  @property(Animation)
  public destroyAnimation: Animation = null;
  @property(CCInteger)
  public speed: number = 200;

  start() {
    this.scheduleOnce(() => {
      this.destroyAnimation.play();
    }, 1);
  }

  update(deltaTime: number) {
    const position = this.node.position;
    this.node.setPosition(
      position.x,
      position.y - this.speed * deltaTime,
      position.z
    );
  }
}
