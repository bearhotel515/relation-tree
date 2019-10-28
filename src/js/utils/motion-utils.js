
const vertical = ['ttb','btt']

export function nodeHitBorderTest(node, w, h, padding = 40,dir) {
  if ((node.r*2 + node.p.x) > (w - padding)) {
    node.p.x = w - padding - node.r*2
  }
  if ((node.p.x - node.r) < padding) {
    node.p.x = padding + node.r
  }
  if ((node.p.x - node.r) < padding || (node.r + node.p.x) > (w - padding)) {
    node.v.x = 0
  }
  if ((node.p.y - node.r) < padding) {
   node.p.y = padding + node.r
  }
  if ((node.p.y + node.r) > (h - padding)) {
   node.p.y = h - padding - node.r
  }
  if ((node.p.y - node.r) < padding || (node.p.y + node.r) > (h - padding)) {
    node.v.y = 0
  }

}

export function repulsionTest(GroupApp) {
  const { 
    drawNodes,
    cavDataMap, 
    canvas,
    direction, 
    containerStyle,
    cavDataLevelArr } = GroupApp
  const { width,height} = canvas
  const { padding} = containerStyle
  drawNodes.forEach(node => {
    nodeHitBorderTest(node, width, height,padding)
  })
  let nodeA, nodeB
  for (let i = 0, len = drawNodes.length; i < len; i++) {
    nodeA = drawNodes[i]
    for (let m = 0; m < len; m++) {
      nodeB = drawNodes[m]
      if (nodeA != nodeB && nodeA.type == 'node' && nodeB.type == 'node') {
        checkCollision(nodeA, nodeB,direction,cavDataMap)
      }
    }
  }
}

function setChildrenV(parent,cavDataMap){
  if(Array.isArray(parent.children)){
    parent.children.forEach(kidUuid=>{
      if(cavDataMap[kidUuid]){
        cavDataMap[kidUuid].v.x=parent.v.x*0.3
        cavDataMap[kidUuid].v.y=parent.v.y*0.3
      }
    })
  } 
}

function checkCollision(ballA, ballB,direction,cavDataMap) {
  let dx = ballA.p.x - ballB.p.x;
  let dy = ballA.p.y - ballB.p.y;
  let dist = Math.sqrt(dx * dx + dy * dy);
  let spring = 0.25, friction = 0.9
  let minDist =( ballA.r + ballB.r)*3
  if (dist < ballA.r) {
    if(vertical.includes(direction)){
      ballA.p.x -= 10
    }else{ 
      ballA.p.y-= 10
    }
  } else if (dist >=ballA.r && dist < minDist) {
    let angle = Math.atan2(dy, dx);
    let tx = ballB.p.x + Math.cos(angle) * minDist;
    let ty = ballB.p.y + Math.sin(angle) * minDist;
    let ax = (tx - ballA.p.x) * spring;
    let ay = (ty - ballA.p.y) * spring;
    if(vertical.includes(direction)){
      ballA.v.x += ax;
    }else{
      ballA.v.y += ay;
    }
  } else {  
     if(vertical.includes(direction)){
      ballA.v.x *= friction
    }else{
      ballA.v.y *= friction
    }  
  }
  setChildrenV(ballA,cavDataMap)
}

 