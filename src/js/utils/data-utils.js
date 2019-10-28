import Vector2D from 'js/models/vector'
const vertical = ['ttb', 'btt']
export function guid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
export function leverOrderTraversal(tree) {
  let result = []
  let floor = 0
  let queue = []
  let index = 0
  let rootNode = {} = Object.assign({
    father: 'tree',
    widthRatio: 1,
    which: 0,
    level: 0,
    _uuid: 'root',
  }, tree)
  queue.push(rootNode);
  let node = null;
  let len = null;
  let kids = []
  let child
  let tmpObj
  while (index != queue.length) {
    node = queue[index++];
    len = Array.isArray(node.children) ? node.children.length : 0;
    kids = []
    if (len > 0) {
      for (let i = 0; i < len; i++) {
        child = Object.assign({
          father: node._uuid,
          widthRatio: node.widthRatio / len,
          which: i,
          level: node.level + 1,
          _uuid: guid(),
        }, node.children[i])
        queue.push(child);
        kids.push(child._uuid)
      }
      queue[index - 1].children = kids
    }
  }
  for (let i = 0; i < queue.length; i++) {
    result[i] = queue[i];
  }

  return result;
}
export function array2map(arr) {
  let map = {}
  if (Array.isArray(arr)) {
    arr.forEach(itm => {
      map[itm._uuid] = itm 
    })
  }
  return map
}
export function map2levelArray(map) {
  let array = []
  Object.keys(map).forEach(key => {
    if (!array[map[key].level]) {
      array[map[key].level] = []
    }
    array[map[key].level].push(map[key])  
  })
  return array
}
export function getCanvasData(GroupApp, nodes, nodeMaps, nodeCfg, edgeCfg) {
  let arr = [];
  let edges = []
  let o = null
  let x, y
  for (let i = 0, len = nodes.length; i < len; i++) {
    o = nodes[i]
    x = o.x || 0
    y = o.y || 0
    arr.push(GroupApp.createNode({
      artists: GroupApp.nodeArtists(),
      p: vertical.includes(GroupApp.direction) ? new Vector2D(250 + i * 1, y) : new Vector2D(x, 250 + i * 1),
      v: new Vector2D(0, 0),
      r: nodeCfg.radius || 10,
      text: o.name,
      type: 'node',
      ...nodeCfg,
      ...o
    }))
    if (o.children && o.children.length) {
      o.children.forEach((uuid) => {
        let end = nodeMaps[uuid]
        if (end) {
          edges.push(GroupApp.createLine({
            artists: GroupApp.edgeArtists(),
            start: new Vector2D(x, y),
            end: new Vector2D(end.x || 0, end.y || 0),
            r: nodeCfg.radius,
            type: 'edge',
            edge: [o._uuid, end._uuid],
            ...edgeCfg
          }))
        }

      })
    }
  }
  return {
    sprites: edges.concat(arr),
    collisionObjs: arr
  }
}

export function canvasData2Map(arr) {
  let map = {}
  arr.forEach(d => {
    map[d._uuid] = d
  })
  return map;
}

export function canvasData2LevelArr(arr) {
  let levelArray = []
  arr.forEach(node => {
    if (!levelArray[node.level]) {
      levelArray[node.level] = []
    }
    levelArray[node.level].push(node)  
  })
  return levelArray
}

export function setNodesInitPos(GroupApp) {
  let occupyWidth = 0,
    minRowHight = 0,
    minColWidth = 0,
    node, father, cx, cy, p, start,
    preFloor = 0;  
  const {
    nodes,
    canvasData,
    cavDataMap,
    canvas,
    direction,
    containerStyle,
    cavDataLevelArr
  } = GroupApp
  const {
    width,
    height
  } = canvas
  const {
    sprites
  } = canvasData
  const {
    padding
  } = containerStyle
  minRowHight = (height - padding * 2) / cavDataLevelArr.length
  minColWidth = (width - padding * 2) / cavDataLevelArr.length
  for (let i = 0; i < sprites.length; i++) {
    node = sprites[i]
    if (node.type === "edge") {
      continue
    }
    father = cavDataMap[node.father]
    cx = 0
    cy = 0;
    if (node.father === 'tree') {  
      if (direction === 'btt' || direction === 'ttb') {
        p = new Vector2D(Math.floor(width / 2), 0)
      } else {
        p = new Vector2D(0, Math.floor(height / 2))
      }
      father = GroupApp.createNode({
        p, 
        v: new Vector2D(0, 0),
        _uuid: 'tree',
        level: -1,
        children: ['root'],
        widthRatio: 1
      })
      if (vertical.includes(direction)) {  
        cavDataMap['root'].p.x = Math.floor(width / 2);
        cavDataMap['root'].p.y = 0
      } else {
        cavDataMap['root'].p.x = 0;
        cavDataMap['root'].p.y = Math.floor(height / 2);
      }
      cavDataMap['root'].widthRatio = 1
    }

    if (vertical.includes(direction)) { 
      start = father.p.x - width * father.widthRatio / 2;
      cx = start + width * node.widthRatio * (node.which + 0.5);
    } else { 
      start = father.p.y - height * father.widthRatio / 2;
      cy = start + height * node.widthRatio * (node.which + 0.5);
    }
    if (direction === 'btt') { 
      cy = height - node.level * minRowHight - padding - node.r;
    } else if (direction === 'ttb') {  
      cy = node.level * minRowHight + padding + node.r;
    } else if (direction === 'ltr') {  
      cx = node.level * minColWidth + padding + node.r;
    } else if (direction === 'rtl') {  
      cx = width - node.level * minColWidth - padding - node.r;
    }

    node.p.x = Math.floor(cx);
    node.p.y = Math.floor(cy);
  }
}
export function getBrothersMap(arr) {
  let brothers = {}
  arr.forEach(a => {
    if (a.type == 'node') {
      if (!brothers[a.father]) {
        brothers[a.father] = []
      }
      brothers[a.father].push(a)
    }
  })
  return brothers
}

export function getEdges(sprites) {
  if (Array.isArray(sprites)) {
    return sprites.filter(s => {
      return s.type == 'edge'
    })
  } else {
    return []
  }

}