import Sprite from './sprite'

export default class Node extends Sprite{
  constructor(opts){
    super(opts)
    this.r = 10
    this.textPos = 'top'
    this.text = ''
    this.fillStyle = 'green';
    this.strokeStyle = '#ccc';
    this.textStyle = '#666';
    Object.assign(this, opts)
  }
}