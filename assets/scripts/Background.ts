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
  private _nodes: Node[] = [];

  start() {
    this._height = this.bgNode1.getComponent(UITransform).height;
    this._nodes = [this.bgNode1, this.bgNode2];
  }

  update(deltaTime: number) {
    for (let node of this._nodes) {
      let position = node.position;
      node.setPosition(
        position.x,
        position.y - this.speed * deltaTime,
        position.z
      );
    }

    for (let i = 0; i < this._nodes.length; i++) {
      let currentNode = this._nodes[i];
      let nextNode = this._nodes[(i + 1) % this._nodes.length];
      let currentPosition = currentNode.position;

      if (currentPosition.y < -this._height) {
        currentNode.setPosition(
          currentPosition.x,
          nextNode.position.y + this._height,
          currentPosition.z
        );
      }
    }
  }
}
