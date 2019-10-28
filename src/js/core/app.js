import Node from 'src/js/models/node.js'
import Line from 'src/js/models/line.js'
import eventUtils from 'utils/event-utils'
import {
  getBrothersMap,
  getEdges,
  leverOrderTraversal,
  array2map,
  getCanvasData,
  canvasData2Map,
  canvasData2LevelArr,
  setNodesInitPos
} from 'utils/data-utils'
import {
  nodeHitBorderTest,
  repulsionTest,
} from 'utils/motion-utils'
import { 
  drawNode,
  drawCurve,
  drawLine,
  drawPolyline
 } from 'utils/draw-utils'

const horizontal = ['ltr', 'rtl']
const vertical = ['ttb', 'btt']
export default class App {
  constructor(canvas, opt = {}) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
    this.canvasData = null
    this.cavDataMap = {}
    this.cavDataLevelArr = []
    this.drawNodes = []
    this.requestAnimationID
    this.currentLevel
    this.totalFrames = 0
    this.maxFrames = 50000
    this.animate = opt.animate === undefined ? true : opt.animate
    this.containerStyle = Object.assign({}, {
      padding: 40
    }, opt.containerStyle || {})
    this.direction = opt.direction || 'ttb'
    this.edge = Object.assign({
      type: 'edge',
      lineWidth:1,
    }, opt.edge)
    this.node = Object.assign({
      textPos: 'top', 
      textDir: '',
      lineWidth: 1,  
      font: "15px Arial", 
      fillStyle: 'green', 
      strokeStyle: 'green',  
      textStyle: '#666', 
      radius: 10  
    }, opt.node)
    this.listener = Object.assign({}, opt.listener)
    this.artists = Object.assign({}, opt.artists)
    this.createCopyCanvas()
    this.setCanvasStyle(opt.width || 500, opt.height || 500)
  }
  edgeArtists() {
    if (typeof this.artists.edgeArtists  === 'function') {
      return this.artists.edgeArtists()
    }
    const dir = this.direction
    if (this.edge.mode === 'curve') {
      return drawCurve(dir)
    }else if(this.edge.mode === 'polyline'){ 
      return drawPolyline(dir)
    }
    return drawLine()
  }
  nodeArtists() {
    if (typeof this.artists.nodeArtists === 'function') {
      return this.artists.nodeArtists()
    }
    return drawNode()
  }
  createLine(options) {
    return new Line(options)
  }
  createNode(options) {
    return new Node(options)
  }
  createCopyCanvas() {
    this.copyCanvas = document.createElement('canvas')
    this.copyCanvas.id = 'copyCanvas'
    this.copyCanvas.style.position = 'absolute'
    this.copyCanvas.style.top = '-9999999px'
    this.copyContext = this.copyCanvas.getContext('2d');
    document.querySelector('body').appendChild(this.copyCanvas)
  }

  addCollisionObjs(objs) {
    this.collisions = [].concat(objs)
  }
  hitTest(ctx, mouse) {
    try {
      var hit = ctx.getImageData(mouse.x, mouse.y, 1, 1).data[3] > 1;
    } catch (e) {
      if (!DisplayObject.suppressCrossDomainErrors) {
        throw "An error has occurred. This is most likely due to security restrictions on reading canvas pixel data with local or cross-domain images.";
      }
    }
    return hit;
  }
  onMouseEvent(event) {
    if (event.type === 'click') {
      this.listener.click && this.listener.click(this.hitObject)
    } else if (event.type === 'mousedown' && this.hitObject) {
      this.listener.mousedown && this.listener.mousedown(this.hitObject)
    } else if (event.type === 'mouseup') {
      this.listener.mouseup && this.listener.mouseup(this.hitObject)
    } else if (event.type === 'mousemove') {
      this.mouseTest((obj) => {
        if (obj) {
          this.hitObject = obj
          this.canvas.style.cursor = 'pointer';
        } else {
          this.canvas.style.cursor = 'auto';
          this.hitObject = null
        }
        this.listener.mousemove && this.listener.mousemove(this.hitObject)
      })
    }
  }
  addEventListener(listener) {
    this.listener = Object.assign({}, listener)
    this.mouse = eventUtils.captureMouse(this.canvas);
    this.dispatchEvent = this.onMouseEvent.bind(this)
    this.canvas.addEventListener('mousedown', this.dispatchEvent, false);
    this.canvas.addEventListener('mouseup', this.dispatchEvent, false);
    this.canvas.addEventListener('mousemove', this.dispatchEvent, false);
    this.canvas.addEventListener('click', this.dispatchEvent, false);
  }
  removeEventListener() {
    eventUtils.removeCaptureMouse(this.canvas)
    this.canvas.removeEventListener('mousedown', this.dispatchEvent, false);
    this.canvas.removeEventListener('mouseup', this.dispatchEvent, false);
    this.canvas.removeEventListener('mousemove', this.dispatchEvent, false);
    this.canvas.removeEventListener('click', this.dispatchEvent, false);
  }
  removeDom() {
    this.canvas.parentNode.removeChild(this.canvas)
    if (this.canvas) {
      this.canvas = null
    }
    this.copyCanvas.parentNode.removeChild(this.copyCanvas)
    if (this.copyCanvas) {
      this.copyCanvas = null
    }

  }
  setCanvasStyle(w, h) {
    this.copyCanvas.height = this.canvas.height = h
    this.copyCanvas.width = this.canvas.width = w
  }
  emptyData() {
    this.collisions = null
  }
  destroy() {
    this.emptyData()
    this.removeEventListener()
    this.removeDom()
  }
  clear(context, width, height) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.copyContext.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
  mouseTest(cb) {
    let ctx = this.copyContext
    let len = this.collisions.length
    while (len) {
      let o = this.collisions[len - 1]
      this.clear(ctx, this.copyCanvas.width, this.copyCanvas.height)
      let tmpObj
      o.draw(ctx)
      if (this.hitTest(ctx, this.mouse)) {
        tmpObj = o
        len = 1
      }
      cb(tmpObj)
        --len
    }
  }
  init(opt = {}) {
    this.setCanvasStyle(opt.width || 500, opt.height || 500)
  }
  transformData(treeData) {
    let nodeArray = leverOrderTraversal(treeData)
    let nodeMaps = array2map(nodeArray) 
    this.canvasData = getCanvasData(this, nodeArray, nodeMaps, this.node, this.edge)
    this.cavDataMap = canvasData2Map(this.canvasData.sprites)
    this.cavDataLevelArr = canvasData2LevelArr(this.canvasData.sprites)
    setNodesInitPos(this)
    this.drawEdges = getEdges(this.canvasData.sprites)
    this.addCollisionObjs(this.canvasData.collisionObjs)
  }

  iterateLevelArr(levelArr, drawNodes, cavDataMap, direction) {
    let nodes = []
    let sumV
    let brothers
    let father
    let newPosition
    let newVelocity
    for (let lvl = 0, len = levelArr.length; lvl < len; lvl++) {
      this.currentLevel = lvl
      nodes = levelArr[lvl]
      nodes.forEach(n => {
        if (n.type == 'node' && !drawNodes.includes(n)) {
          drawNodes.push(n)
        }
      })
      brothers = getBrothersMap(nodes)
      for (let fuuid in brothers) {
        if (Array.isArray(brothers[fuuid])) {
          father = cavDataMap[fuuid]
          if (father) {
            newPosition = null
            if (vertical.includes(direction)) { 
              if (brothers[fuuid].length == 1) {
                newPosition = brothers[fuuid][0].p.x
              } else if (brothers[fuuid].length > 1) { 
                newPosition = (brothers[fuuid][0].p.x + brothers[fuuid][father.children.length - 1].p.x) / 2
              }
              if (newPosition) {
                if (father.p.x !== newPosition) {
                  father.p.x = newPosition
                }
              }
            } else { 
              if (brothers[fuuid].length == 1) {
                newPosition = brothers[fuuid][0].p.y
              } else if (brothers[fuuid].length > 1) {  
                newPosition = (brothers[fuuid][0].p.y + brothers[fuuid][father.children.length - 1].p.y) / 2
              }
              if (newPosition) {
                if (father.p.y !== newPosition) {
                  father.p.y = newPosition
                }
              }
            }
          }
        }
      }
      repulsionTest(this)
     
    }
  }
  updateSpritesPos(data) {
    Array.isArray(data) && data.forEach((d) => {
      d.update && d.update()
    })
  }
  updateEdgesPos(drawNodes, cavDataMap, drawEdges) {
    let node, children, kid, kiduuid, start, end
    for (let i = 0, len = drawNodes.length; i < len; i++) {
      node = drawNodes[i]
      children = node.children
      if (!children || children.length < 1) {
        continue
      }
      for (let m = 0, sum = children.length; m < sum; m++) {
        kiduuid = children[m]
        kid = cavDataMap[kiduuid]
        drawEdges.forEach(line => {
          [start, end] = line.edge
          if (start == node._uuid && end == kid._uuid) {
            line.start.x = node.p.x
            line.start.y = node.p.y
            line.end.x = kid.p.x
            line.end.y = kid.p.y
          }
        })
      }
    }
  }
  drawSprite(data) {
    data.forEach((d) => {
      d.draw(this.context)
    })
  }
  getAllNodeSumV() {
    let sum = 0
    this.drawNodes.forEach(n => {
      sum += n.v.x
    })
    return sum
  }
  loop() {
    this.iterateLevelArr(this.cavDataLevelArr, this.drawNodes, this.cavDataMap, this.direction)
    this.updateSpritesPos(this.drawNodes)
    this.updateEdgesPos(this.drawNodes, this.cavDataMap, this.drawEdges)
    this.clear()
    this.drawSprite([].concat(this.drawEdges).concat(this.drawNodes))
    this.requestAnimationID = requestAnimationFrame(this.loop.bind(this));
  }
  stopRequestAnimation() {
    if (this.requestAnimationID) {
      cancelAnimationFrame(this.requestAnimationID);
      this.requestAnimationID = null
    }
  }

  resize(width, height) {
    this.stopRequestAnimation()
    this.clear()
    this.setCanvasStyle(width, height)
    setNodesInitPos(this, this.canvasData.sprites, this.cavDataMap, this.canvas.width)
    this.loop();
  }
  load(data) {
    this.stopRequestAnimation()
    this.clear()
    this.transformData(data)
    this.loop();
  }
  destroy() {
    this.stopRequestAnimation()
    this.removeEventListener()
  }
}