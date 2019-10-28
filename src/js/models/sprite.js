import Vector2D from 'js/models/vector'

export default class Sprite {
  constructor(opts){
    this.type = opts.type || '';
    this.artists =  opts.artists || [];
    this.visible= opts.visible !== false ? true : opts.visible
    this.opacity=1
    this.p=opts.p||new Vector2D(0,0)
    this.v=opts.v||new Vector2D(0,0)
  }
  update(){
    this.p.add(this.v)
  }
  draw(context){
    if (Array.isArray(this.artists)&& this.visible) {
      this.artists.forEach((a)=>{
        context.save();
        context.globalAlpha = this.opacity;
        a.draw.call(this,context);
        context.restore();
      
      })
    }
 }
}