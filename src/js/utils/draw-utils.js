const vertical = ['ttb', 'btt']
export function drawNode(){
  return [{
        draw(ctx) {
          ctx.save();
          ctx.translate(this.p.x, this.p.y) 
          ctx.beginPath();
          ctx.fillStyle = this.fillStyle
          ctx.lineWidth = this.lineWidth
          ctx.strokeStyle = this.strokeStyle || this.fillStyle
          ctx.arc(0, 0, this.r, 0, Math.PI * 2, true);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      },
      {
        draw(ctx) {
          let {textPos, p} = this
          let {x,y} =p
          if (textPos === 'top') {
            ctx.textAlign = "center";
            y -= this.r + 10
          } else if (textPos === 'bottom') {
            ctx.textAlign = "center";
            y += this.r * 2 + 10
          } else if (textPos === 'left') {
            x -= this.r + 10
            ctx.textAlign = "right";
          } else if (textPos === 'right') {
            x += this.r + 10
            ctx.textAlign = "left";

          } else if (textPos === 'center') {
            ctx.textAlign = "center";
          } else {
            ctx.textAlign = "center";
            y -= this.r + 10
          }
          ctx.save();
          ctx.translate(x, y) 
          ctx.font = this.font;
          ctx.textBaseline = "middle";
          ctx.fillStyle = this.textStyle
          ctx.fillText(this.text, 0, 0);
          ctx.restore();
        }
      }
    ]
}

export function drawLine(){
  return [{
    draw(ctx) {
      const radius = this.end.distanceTo(this.start) - this.r
      const rad = this.end.radiansVector(this.start)
      const evec = this.getVecByRR(rad, radius)
      const svec = this.getVecByRR(rad, this.r)
      ctx.save();
      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.strokeStyle = this.strokeStyle;
      ctx.lineWidth = this.lineWidth
      ctx.moveTo(svec.x, svec.y);
      ctx.lineTo(evec.x, evec.y);
      ctx.stroke();
      ctx.restore();
    }
  }, {
    draw(ctx) {
      const radius = this.end.distanceTo(this.start) - this.r
      const rad = this.end.radiansVector(this.start)
      const vec = this.getVecByRR(rad, radius)
      ctx.save();
      ctx.translate(vec.x, vec.y)
      ctx.rotate(rad);
      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.fillStyle = this.strokeStyle;
      ctx.strokeStyle = this.strokeStyle;
      ctx.lineWidth = 1
      ctx.moveTo(0, 0);
      ctx.lineTo(-8, 4);
      ctx.lineTo(-8, -4);
      ctx.closePath()
      ctx.stroke();
      ctx.fill();
      ctx.restore();
    }
  }]
}
export function drawCurve(dir) {
  return [{
    draw(ctx) {
      const offSet = vertical.includes(dir) ? Math.abs((this.end.y - this.start.y) / 2) : Math.abs((this.end.x - this.start.x) / 2)
      const rad = this.end.radiansVector(this.start)
      ctx.save();
      ctx.beginPath();
      if (dir === 'btt') {
        ctx.moveTo(this.start.x, this.start.y + this.r);
        ctx.bezierCurveTo(this.start.x, Math.floor(this.start.y - offSet), this.end.x, Math.floor(this.end.y + offSet), this.end.x, this.end.y);
      } else if (dir === 'ttb') {
        ctx.moveTo(this.start.x, this.start.y + this.r);
        ctx.bezierCurveTo(this.start.x, Math.floor(this.start.y + offSet), this.end.x, Math.floor(this.end.y - offSet), this.end.x, this.end.y - this.r);
      } else if (dir === 'ltr') {
        ctx.moveTo(this.start.x + this.r, this.start.y);
        ctx.bezierCurveTo(Math.floor(this.start.x + offSet), this.start.y, Math.floor(this.end.x - offSet), this.end.y, this.end.x, this.end.y);
      } else if (dir === 'rtl') {
        ctx.moveTo(this.start.x - this.r, this.start.y);
        ctx.bezierCurveTo(Math.floor(this.start.x - offSet), this.start.y, Math.floor(this.start.x - offSet), this.end.y, this.end.x, this.end.y);
      }

      ctx.strokeStyle = this.strokeStyle;
      ctx.lineWidth = this.lineWidth
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();
    }
  }]
}
export function drawPolyline(dir){
  return [{
    draw(ctx) {
      const offSet = vertical.includes(dir) ? Math.abs((this.end.y - this.start.y) / 3) : Math.abs((this.end.x - this.start.x) / 3)
      const rad = this.end.radiansVector(this.start)
      ctx.save();
      ctx.beginPath();
      if (dir === 'btt') {
        ctx.moveTo(this.start.x, this.start.y + this.r);
        ctx.lineTo(this.start.x, Math.floor(this.start.y - offSet));
        ctx.lineTo(this.end.x, Math.floor(this.end.y + offSet));
        ctx.lineTo( this.end.x, this.end.y);
      } else if (dir === 'ttb') {
        ctx.moveTo(this.start.x, this.start.y + this.r);
        ctx.lineTo(this.start.x, Math.floor(this.start.y + offSet));
        ctx.lineTo(this.end.x,Math.floor(this.end.y - offSet));
        ctx.lineTo(this.end.x, this.end.y - this.r);
      } else if (dir === 'ltr') {
        ctx.moveTo(this.start.x + this.r, this.start.y);
        ctx.lineTo(Math.floor(this.start.x + offSet), this.start.y);
        ctx.lineTo(Math.floor(this.end.x - offSet), this.end.y);
        ctx.lineTo(this.end.x, this.end.y);
      } else if (dir === 'rtl') {
        ctx.moveTo(this.start.x - this.r, this.start.y);
        ctx.lineTo(Math.floor(this.start.x -offSet), this.start.y);
        ctx.lineTo(Math.floor(this.end.x+offSet) , this.end.y);
        ctx.lineTo(this.end.x, this.end.y);
      }
      ctx.strokeStyle = this.strokeStyle;
      ctx.lineWidth = this.lineWidth
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();
    }
  }]
}