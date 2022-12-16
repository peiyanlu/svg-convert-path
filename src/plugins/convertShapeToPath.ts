/**
 * [generatePathNode] 获得替换后的 path 节点
 * @param {HTMLOrSVGImageElement} node
 * @param {Document} document
 * @returns {HTMLElement}
 */
const generatePathNode = (node: HTMLOrSVGImageElement, document: Document) => {
  const newPathNode = document.createElement('path')

  Array.from(node.attributes).forEach(attribute => {
    newPathNode.setAttribute(attribute.name, attribute.value)
  })

  return newPathNode
}

/**
 * [generate] 几何图形转换为 path 节点
 * @param {HTMLOrSVGImageElement} node
 * @param {Document} document
 */
const convertPathData = (node: HTMLOrSVGImageElement, document: Document) => {
  if (!node.nodeName) return
  const nodeName = node.nodeName.toLowerCase()
  const numberAttr = (attr: string): number => parseFloat(node.getAttribute(attr)!)

  const replaceNode = (attrs: string[], pathValue: string) => {
    const newPathNode = generatePathNode(node, document)
    newPathNode.setAttribute('d', pathValue)
    attrs.forEach(attribute => attribute && newPathNode.removeAttribute(attribute))
    node.parentNode?.replaceChild(newPathNode, node)
  }


  let attrs: string[] = []
  let pathValue: string = ''
  switch (nodeName) {
    case 'rect': {
      const x = numberAttr('x')
      const y = numberAttr('y')
      const width = numberAttr('width')
      const height = numberAttr('height')
      /**
       * rx 和 ry 的规则是：
       * 1. 如果其中一个设置为 0 则圆角不生效
       * 2. 如果有一个没有设置则取值为另一个
       * 3.rx 的最大值为 width 的一半, ry 的最大值为 height 的一半
       */
      let rx = numberAttr('rx') || numberAttr('ry') || 0
      let ry = numberAttr('ry') || numberAttr('rx') || 0

      // 非数值单位计算，如当宽度像100%则移除
      if (isNaN(x - y + width - height + rx - ry)) return

      rx = rx > width / 2 ? width / 2 : rx
      ry = ry > height / 2 ? height / 2 : ry

      // 如果其中一个设置为 0 则圆角不生效
      let path: string
      if (rx == 0 || ry == 0) {
        path = `M${ x } ${ y }h ${ width }v ${ height }h ${ -width }z`
      } else {
        const vector = ' 0 0 1 '
        path = `M${ x } ${ y + ry }a${ rx } ${ ry + vector + rx } ${ -ry }h${ width - rx - rx }a${ rx } ${ ry + vector + rx } ${ ry }v${ height - ry - ry }a${ rx } ${ ry + vector + (-rx) } ${ ry }h${ rx + rx - width }a${ rx } ${ ry + vector + (-rx) } ${ -ry }z`
      }

      attrs = [ 'x', 'y', 'width', 'height', 'rx', 'ry' ]
      pathValue = path

      break
    }

    case 'circle': {
      const cx = numberAttr('cx')
      const cy = numberAttr('cy')
      const r = numberAttr('r')

      if (isNaN(cx - cy + r)) return

      const vector = ' 0 1 0 '
      const path = `M${ cx - r } ${ cy }a${ r } ${ r + vector + (2 * r) } 0a${ r } ${ r + vector + (-2 * r) } 0z`

      attrs = [ 'cx', 'cy', 'r' ]
      pathValue = path

      break
    }

    case 'ellipse': {
      const cx = numberAttr('cx')
      const cy = numberAttr('cy')
      const rx = numberAttr('rx')
      const ry = numberAttr('ry')

      if (isNaN(cx - cy + rx - ry)) return

      const vector = ' 0 1 0 '
      const path = `M${ cx - rx } ${ cy }a${ rx } ${ ry + vector + (2 * rx) } 0a${ rx } ${ ry + vector + (-2 * rx) } 0z`

      attrs = [ 'cx', 'cy', 'rx', 'ry' ]
      pathValue = path

      break
    }

    case 'line': {
      const x1 = numberAttr('x1')
      const y1 = numberAttr('y1')
      const x2 = numberAttr('x2')
      const y2 = numberAttr('y2')

      if (isNaN(x1 - y1 + (x2 - y2))) return

      const path = `M${ x1 } ${ y1 }L${ x2 } ${ y2 }`

      attrs = [ 'x1', 'y1', 'x2', 'y2' ]
      pathValue = path

      break
    }

    case 'polygon': // polygon 与 polyline 是一样的，polygon 多边形，polyline折线
    case 'polyline': {
      const regNumber = /[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g
      const points = (node.getAttribute('points')?.match(regNumber) || []).map(Number)
      if (points.length < 4) return

      const ml = points.slice(0, 2).join(' ')
      const lz = points.slice(2).join(' ')
      const z = nodeName === 'polygon' ? 'z' : ''
      const path = `M${ ml }L${ lz }${ z }`

      attrs = [ 'points' ]
      pathValue = path

      break
    }

    default:
      attrs = []
      pathValue = ''
      break
  }

  if (attrs.length && pathValue.length) {
    replaceNode(attrs, pathValue)
  }
}

/**
 * [transRemoveNode] 递归遍历转换基本图形
 * @param {*} node
 * @param document
 */
const transNode = (node: HTMLOrSVGImageElement, document: Document) => {
  // 基本的图形都不含有子结点
  if (!node.hasChildNodes() && node.nodeName.toUpperCase() !== 'PATH') {
    return convertPathData(node, document)
  }

  if (node.hasChildNodes()) {
    Array
      .from(node.childNodes)
      .forEach(item => transNode(<HTMLOrSVGImageElement>item, document))
  }
}

/**
 * [convertShapeToPath] 基本图形转换
 * 包含 rect、cricle、ellipse、line、polygon、polyline
 * @param {*} document
 */
export const convertShapeToPath = (document: Document) => {
  Array
    .from(document.documentElement.childNodes)
    .forEach(node => transNode(<HTMLOrSVGImageElement>node, document))
}
