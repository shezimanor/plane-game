import { _decorator, CCInteger, Component, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Background')
export class Background extends Component {
  @property(Node)
  public bgNode1: Node = null;
  @property(Node)
  public bgNode2: Node = null;
  @property(Node)
  public bgNode3: Node = null;
  @property(CCInteger)
  public speed: number = 120;
  private _height: number = 0;
  private _limit: number = 0;
  private _nodes: Node[] = [];

  start() {
    this._height = this.bgNode1.getComponent(UITransform).height;
    this._limit = (this._height * 3) / 2;
    this._nodes = [this.bgNode1, this.bgNode2, this.bgNode3];
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

    const nodesLength = this._nodes.length;

    for (let i = 0; i < nodesLength; i++) {
      let currentNode = this._nodes[i];
      let prevNode = this._nodes[(i - 1 + nodesLength) % nodesLength];
      let currentPosition = currentNode.position;

      if (currentPosition.y < -this._limit) {
        currentNode.setPosition(
          currentPosition.x,
          prevNode.position.y + this._height,
          currentPosition.z
        );
      }
    }
  }
}
