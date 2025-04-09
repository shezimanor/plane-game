import { _decorator, CCInteger, Component, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Background')
export class Background extends Component {
  @property(Node)
  public bgNode1: Node = null;
  @property(Node)
  public bgNode2: Node = null;
  @property(CCInteger)
  public speed: number = 120;

  private _height: number = 0;

  start() {
    this._height = this.bgNode1.getComponent(UITransform).height;
  }

  update(deltaTime: number) {
    let position1 = this.bgNode1.position;
    let position2 = this.bgNode2.position;
    this.bgNode1.setPosition(
      position1.x,
      position1.y - this.speed * deltaTime,
      position1.z
    );
    this.bgNode2.setPosition(
      position2.x,
      position2.y - this.speed * deltaTime,
      position2.z
    );
    let currentPosition1 = this.bgNode1.position;
    let currentPosition2 = this.bgNode2.position;
    if (currentPosition1.y < -this._height) {
      this.bgNode1.setPosition(
        currentPosition1.x,
        currentPosition2.y + this._height,
        currentPosition1.z
      );
    }
    if (currentPosition2.y < -this._height) {
      this.bgNode2.setPosition(
        currentPosition2.x,
        currentPosition1.y + this._height,
        currentPosition2.z
      );
    }
  }
}
