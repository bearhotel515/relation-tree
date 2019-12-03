import Sprite from './sprite'
import Vector2D from 'js/models/vector'
export default class Line extends Sprite{
  constructor(opts){
    super(opts)
    this.r = 10
    this.strokeStyle = '#ccc'
    this.lineWidth = 3
    this.start = new Vector2D(0, 0)
    this.end = new Vector2D(0, 0)
    Object.assign(this, opts)
  }

  getVecByRR (radians, radius) {
    let x = radius * Math.cos(radians) + this.start.x


    let y = radius * Math.sin(radians) + this.start.y
    return new Vector2D(x, y)
  }
}