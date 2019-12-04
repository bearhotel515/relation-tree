import Node from 'src/js/models/node.js'
import Line from 'src/js/models/line.js'
import Vector2D from 'src/js/models/vector.js'
import eventUtils from 'utils/event-utils'
import {
  getBrothersMap,
  getEdges,
  leverOrderTraversal,
  array2map,
  getCanvasData,
  canvasData2Map,
  canvasData2LevelArr,
  setNodesInitPos,
  sortArr,

} from 'utils/data-utils'
import {
  nodeHitBorderTest,
  repulsionTest,
  gravity,
  setChildrenV
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
    this.canvas = canvas
    this.context = this.canvas.getContext('2d')
    this.canvasData = null
    this.cavDataMap = {}
    this.cavDataLevelArr = []
    this.drawNodes = []
    this.requestAnimationID
    this.currentLevel
    this.cellspacing = opt.cellspacing || 3
   
    this.totalFrames = 0
    this.maxFrames = 50000
    this.animate = opt.animate === undefined ? true : opt.animate
    this.containerStyle = Object.assign({}, {
      padding: 40
    }, opt.containerStyle || {})
    this.direction = opt.direction || 'ttb'
    this.edge = Object.assign({
      type: 'edge',
      lineWidth: 1,
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
    this.animationFrameAfter = opt.animationFrameAfter

    this.hitNode = this.createNode({
      p: new Vector2D(0, 0),
      v: new Vector2D(0, 0),
      r:this.node.radius
    })
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
    } else if(this.edge.mode === 'polyline'){ 
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
    this.copyContext = this.copyCanvas.getContext('2d')
    document.querySelector('body').appendChild(this.copyCanvas)
  }

  addCollisionObjs(objs) {
    this.collisions = [].concat(objs)
  }
  hitTest(ctx, mouse) {
    try {
      var hit = ctx.getImageData(mouse.x, mouse.y, 1, 1).data[3] > 1
    } catch (e) {
      if (!DisplayObject.suppressCrossDomainErrors) {
        throw "An error has occurred. This is most likely due to security restrictions on reading canvas pixel data with local or cross-domain images.";
      }
    }
    return hit
  }
  onMouseEvent(event) {
    if (event.type === 'click') {
      this.listener.click && this.listener.click(this.hitObject)
    } else if (event.type === 'contextmenu') {
      this.listener.contextmenu && this.listener.contextmenu(this.hitObject)
    } else if (event.type === 'dblclick') {
      this.listener.dblclick && this.listener.dblclick(this.hitObject)
    } else if (event.type === 'mousedown' && this.hitObject) {
      this.listener.mousedown && this.listener.mousedown(this.hitObject)
    } else if (event.type === 'mouseup') {
      this.listener.mouseup && this.listener.mouseup(this.hitObject)
    } else if (event.type === 'mousemove') {
      this.mouseTest((obj) => {
        if (obj) {
          this.hitObject = obj
          this.canvas.style.cursor = 'pointer'
        } else {
          this.canvas.style.cursor = 'auto'
          this.hitObject = null
        }
        this.listener.mousemove && this.listener.mousemove(this.hitObject)
      })
    }
  }
  addEventListener(listener) {
    this.listener = Object.assign({}, listener)
    this.mouse = eventUtils.captureMouse(this.canvas)
    this.dispatchEvent = this.onMouseEvent.bind(this)
    this.canvas.addEventListener('mousedown', this.dispatchEvent, false)
    this.canvas.addEventListener('mouseup', this.dispatchEvent, false)
    this.canvas.addEventListener('mousemove', this.dispatchEvent, false)
    this.canvas.addEventListener('click', this.dispatchEvent, false)
    this.canvas.addEventListener('dblclick', this.dispatchEvent, false)
    this.canvas.addEventListener('contextmenu', this.dispatchEvent, false)
  }
  removeEventListener() {
    eventUtils.removeCaptureMouse(this.canvas)
    this.canvas.removeEventListener('mousedown', this.dispatchEvent, false)
    this.canvas.removeEventListener('mouseup', this.dispatchEvent, false)
    this.canvas.removeEventListener('mousemove', this.dispatchEvent, false)
    this.canvas.removeEventListener('click', this.dispatchEvent, false)
    this.canvas.removeEventListener('dblclick', this.dispatchEvent, false)
    this.canvas.removeEventListener('contextmenu', this.dispatchEvent, false)
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
    this.canvasData = null
    this.cavDataMap = null
    this.cavDataLevelArr = null
    this.drawNodes = null
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
    this.drawNodes = this.getDrawNodes()
  }

  iterateLevelArr() {
    let nodes = []
    let sumV
    let brothers
    let father
    let newPosition
    let newVelocity
    let levelSum
    const {
      cavDataLevelArr,
      drawNodes,
      cavDataMap,
      direction,
      hitNode
    } = this
    for (let lvl = 0, len = cavDataLevelArr.length; lvl < len; lvl++) {
      this.currentLevel = lvl
      nodes = cavDataLevelArr[lvl]
      levelSum = 0
      brothers = getBrothersMap(nodes)
      for (let fuuid in brothers) {
        if (Array.isArray(brothers[fuuid])) {
          father = cavDataMap[fuuid]
          if (!father) {
            continue
          }
          newPosition = null
          if (vertical.includes(direction)) { 
            if (brothers[fuuid].length == 1) {
              newPosition = brothers[fuuid][0].p.x
            } else if (brothers[fuuid].length > 1) { 
              newPosition = (brothers[fuuid][0].p.x + brothers[fuuid][father.children.length - 1].p.x) / 2
            }
            if (newPosition && father.p.x !== newPosition && father.stopMove) {
              hitNode.p.x = newPosition
              hitNode.p.y = father.p.y
              gravity(hitNode,father,this.direction)
            }
          } else { 
            if (brothers[fuuid].length == 1) { 
              newPosition = brothers[fuuid][0].p.y
            } else if (brothers[fuuid].length > 1) { 
              newPosition = (brothers[fuuid][0].p.y + brothers[fuuid][father.children.length - 1].p.y) / 2
            }
            if (newPosition && father.p.y !== newPosition && father.stopMove) {
              hitNode.p.y = newPosition
              hitNode.p.x = father.p.x
              gravity(hitNode,father)
            }
          }
          father.update()
        }
      }

    }
  }
  updateEdgesPos() {
    let node, children, kid, kiduuid, start, end
    const {
      drawNodes,
      cavDataMap,
      drawEdges
    } = this
    drawEdges.forEach(line => {
      [start, end] = line.edge
      line.start.x = cavDataMap[start].p.x
      line.start.y = cavDataMap[start].p.y
      line.end.x = cavDataMap[end].p.x
      line.end.y = cavDataMap[end].p.y
    })
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
  makeWallCell() {
    const {
      padding
    } = this.containerStyle
    const {
      radius
    } = this.node
    const top = this.createNode({
      name: 'top',
      p: new Vector2D(0, padding),
      v: new Vector2D(0, 0),
      r: radius
    })
    const left = this.createNode({
      name: 'left',
      p: new Vector2D(padding, 0),
      v: new Vector2D(0, 0),
      r: radius
    })
    const bottom = this.createNode({
      name: 'bottom',
      p: new Vector2D(0, this.canvas.height + padding),
      v: new Vector2D(0, 0),
      r: radius
    })
    const right = this.createNode({
      name: 'right',
      p: new Vector2D(this.canvas.height - padding, 0),
      v: new Vector2D(0, 0),
      r: radius
    })
    this.walls = {
      top,
      left,
      bottom,
      right
    }
  }

  getDrawNodes () {
    let nodes; let
      drawNodes = []
    for (let lvl = 0, len = this.cavDataLevelArr.length; lvl < len; lvl++) {
      nodes = this.cavDataLevelArr[lvl]
      nodes.forEach((n) => {
        if (n.type == 'node' && !drawNodes.includes(n)) {
          drawNodes.push(n)
        }
      })
    }
    return drawNodes
  }

  setChildren () {
    let node; let uid; let
      kid
    for (let i = 0, len = this.drawNodes.length; i < len; i++) {
      node = this.drawNodes[i]
      node.isSetChildren = false
      if (Array.isArray(node.children)) {
        for (let m = 0, num = node.children.length; m < num; m++) {
          uid = node.children[m]
          kid = this.cavDataMap[uid]
          this.hitNode.p.x = node.p.x
          this.hitNode.p.y = node.p.y
          if (vertical.includes(this.direction)) {
            this.hitNode.p.y = kid.p.y
          } else {
            this.hitNode.p.x = kid.p.x
          }
          if (kid.stopMove && !node.stopMove) {
            node.isSetChildren = true
            gravity(this.hitNode, kid, this.direction)
          }
        }
      }
    }
  }

  loop () {
    this.clear()
    sortArr(this)
    const {
      drawNodes,
      context,
      cavDataMap
    } = this
    if (!window.sun) {
      window.sun = 1
    }
    window.sun++
    repulsionTest(this)
    this.setChildren()
    this.iterateLevelArr()

    this.updateEdgesPos()
    this.drawSprite(this.drawEdges)
    if (typeof this.animationFrameAfter === 'function') {
      this.animationFrameAfter()
    }
    this.requestAnimationID = requestAnimationFrame(this.loop.bind(this))
  }

  stopRequestAnimation () {
    if (this.requestAnimationID) {
      cancelAnimationFrame(this.requestAnimationID)
      this.requestAnimationID = null
    }
  }

  resize(width, height) {
    this.stopRequestAnimation()
    this.clear()
    this.setCanvasStyle(width, height)
    this.makeWallCell()
    setNodesInitPos(this, this.canvasData.sprites, this.cavDataMap, this.canvas.width)
    this.loop()
  }
  load(data) {
    this.stopRequestAnimation()
    this.clear()
    this.transformData(data)
    this.makeWallCell()
    this.loop();
  }
  destroy() {
    this.emptyData()
    this.stopRequestAnimation()
    this.removeEventListener()
    this.removeDom()
  }
}