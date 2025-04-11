// 音樂類型
export enum MusicClipType {
  Bgm
}

// 音效類型
export enum SoundClipType {
  Enemy0Die, // 0
  Enemy1Die, // 1
  Enemy2Die, // 2
  Bullet, // 3
  GetBomb, // 4
  GetDouble, // 5
  UseBomb, // 6
  Hit, // 7
  GameOver, // 8
  ButtonClick, // 9
  NewHighestScore // 10
}

// 敵機類型
export enum EnemyType {
  Enemy0,
  Enemy1,
  Enemy2
}

// 射擊模式
export enum ShootType {
  OneShoot,
  TwoShoot
}

// 獎品類型
export enum RewardType {
  TwoShoot = 1,
  BigBomb = 2
}

// 子彈池名稱
export enum BulletPoolName {
  bulletPool_one,
  bulletPool_two
}
