import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StartSceneManager')
export class StartSceneManager extends Component {
  start() {}

  update(deltaTime: number) {}

  onClickStartButton() {
    // 切換場景
    director.loadScene('02-game-scene');
  }
}
