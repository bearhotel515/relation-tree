import Node from 'js/models/node'
const vertical = ['ttb', 'btt']
const friction = 0.95
function borderHitTest(GroupApp) {
  const {
    drawNodes,
    cavDataMap,
    canvas,
    direction,
    containerStyle,
    walls
  } = GroupApp
  const {
    top,
    left,
    bottom,
    right
  } = walls
  const {
    padding
  } = containerStyle
  const {
    width,
    height
  } = canvas
  drawNodes.forEach((node) => {
    if (node.p.x >= width - padding) {
      node.p.x = width - padding - 2
    }
    if (node.p.x <= padding) {
      node.p.x = padding + 2
    }
    if (node.p.y >= height - padding) {
      node.p.y = height - padding - 2
    }
    if (node.p.y <= padding) {
      node.p.y = padding + 2
    }
  })
}
export function repulsionTest (GroupApp) {
  const {
    drawNodes,
    context,
    cavDataMap,
    direction,
    cellspacing,
    hitNode
  } = GroupApp
  let nodeA; let moveNode; let i; let m; let
    len = drawNodes.length
  borderHitTest(GroupApp)
  for (i = 0; i < len; i++) {
    nodeA = drawNodes[i]
    for (m = 0; m < len; m++) {
      drawNodes[m].isHit = false
      if (m != i) {
        moveNode = drawNodes[m]
        ballsHit(moveNode, nodeA, (moveNode.r + nodeA.r) * cellspacing, direction)
      }
    }
    nodeA.update()
    nodeA.draw(context)
  }
}
export function setChildrenV (parent, cavDataMap, direction) {
  let kid

  if (Array.isArray(parent.children)) {
    parent.children.forEach((kidUuid) => {
      kid = cavDataMap[kidUuid]
      if (kid && !kid.isHit) {
        kid.v.x = parent.v.x * 0.8
        kid.v.y = parent.v.y * 0.8
        kid.update()
      }
    })
  }
}
export function gravity (center, node, direction, n) {
  node.dx = center.p.x - node.p.x
  node.dy = center.p.y - node.p.y
  node.dist = Math.sqrt((node.dx * node.dx) + (node.dy * node.dy))
  if (node.dist < node.r) {
    return
  }
  node.angle = Math.atan2(node.dy, node.dx)
  node.f = 1 / node.dist
  if (vertical.includes(direction)) {
    node.v.x = Math.cos(node.angle) * node.dist * 0.01 * (n || 1)
  } else {
    node.v.y = Math.sin(node.angle) * node.dist * 0.01 * (n || 1)
  }
  node.update()
}
export function ballsHit (nodeA, nodeB, minDist, direction) {
  nodeA.dx = nodeA.p.x - nodeB.p.x
  nodeA.dy = nodeA.p.y - nodeB.p.y
  nodeA.dist = Math.sqrt((nodeA.dx * nodeA.dx) + (nodeA.dy * nodeA.dy))
  nodeA.isHit = nodeA.dist <= minDist
  if (vertical.includes(direction)) {
    nodeA.stopMove = Math.abs(nodeA.v.x) < 0.01
  } else {
    nodeA.stopMove = Math.abs(nodeA.v.y) < 0.01
  }
  if (!nodeA.isHit) {
    return
  }

  nodeA.angle = Math.atan2(nodeA.dy, nodeA.dx)
  nodeA.dist = nodeA.dist < 1 ? 1 : nodeA.dist
  nodeA.f = nodeA.r / nodeA.dist
  if (vertical.includes(direction)) {
    nodeA.v.x = Math.cos(nodeA.angle) * nodeA.f * 2
  } else {
    nodeA.v.y = Math.sin(nodeA.angle) * nodeA.f * 2
  }
}
