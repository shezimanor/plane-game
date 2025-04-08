import { _decorator, CCInteger, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
  @property(CCInteger)
  public speed: number = 500;

  private _bgHeight: number = 446;

  start() {}

  update(deltaTime: number) {
    const position = this.node.position;
    this.node.setPosition(
      position.x,
      position.y + this.speed * deltaTime,
      position.z
    );
    if (position.y > this._bgHeight) {
      this.node.destroy();
    }
  }
}
