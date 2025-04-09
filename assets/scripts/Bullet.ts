import { _decorator, CCInteger, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
  @property(CCInteger)
  public speed: number = 500;

  private _bgHeight: number = 852;
  private _initWorldPositionX: number = 0;

  start() {
    this._initWorldPositionX = this.node.worldPosition.x;
  }

  update(deltaTime: number) {
    const position = this.node.worldPosition;
    this.node.setWorldPosition(
      this._initWorldPositionX,
      position.y + this.speed * deltaTime,
      position.z
    );
    if (position.y > this._bgHeight) {
      this.node.destroy();
    }
  }
}
