import { _decorator, Component, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StartSceneManager')
export class StartSceneManager extends Component {
  onClickStartButton() {
    // 切換場景
    director.loadScene('02-game-scene');
  }
}
