
export default class Vector2D {
  constructor (x, y) {
    this.x = x 
    this.y = y 
  }

  distanceTo (v) {
    return Math.sqrt(this.distanceToSquared(v))
  }

  distanceToSquared (v) {
    let dx = this.x - v.x; let
      dy = this.y - v.y
    return dx * dx + dy * dy
  }

 
  lengthSq () {
    return this.x * this.x + this.y * this.y
  }

 
  length () {
    return Math.sqrt(this.lengthSq())
  }

  fromArray (array) {
    this.x = array[0]
    this.y = array[1]
    return this	
  }


  toArray () {
    return [this.x, this.y]
  }

  radians () {
    return Math.atan2(this.y, this.x)
  }

  radiansVector (v) {
    return Math.atan2(this.y - v.y, this.x - v.x)
  }

  add (v) {
    this.x += v.x
    this.y += v.y
    return this
  }
}