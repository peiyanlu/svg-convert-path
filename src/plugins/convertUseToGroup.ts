const symbolNodes = new Set<string>([])

/**
 * [transformUse] 转换 use 为 g
 * @param {HTMLOrSVGImageElement} node
 * @param {Document} document
 */
const transformUse = (node: HTMLOrSVGImageElement, document: Document) => {
  Array.from(node.childNodes).forEach(node => {
    const child = <HTMLOrSVGImageElement>node

    if (child.nodeName.toUpperCase() === 'USE') {
      const useID: string = child.getAttribute('xlink:href')?.replace('#', '')!
      let symbolNode = document.getElementById(useID)
      symbolNodes.add(useID)
      if (symbolNode) {
        const group = document.createElement('g')

        const attributes = Array.from(child.attributes)
        if (attributes.length > 0) {
          let x = Number(child.getAttribute('x')!) || 0
          let y = Number(child.getAttribute('y')!) || 0

          let transform = child.getAttribute('transform')!

          if (x !== 0 && y !== 0) transform += ` translate(${ x }, ${ y })`

          if (transform) {
            group.setAttribute(
              'transform',
              transform.replace(/(^\s+|\s+$)/g, ''),
            )
          }

          ;[ 'x', 'y', 'xlink:href', 'style' ].forEach(attr => child.removeAttribute(attr))

          Array.from(child.attributes).map(({ nodeName, value }) => {
            group.setAttribute(nodeName, value)
          })
        }

        if (symbolNode.nodeName.toUpperCase() === 'SYMBOL') {
          const newSymbol = symbolNode.cloneNode(true)
          const symbolGroup = document.createElement('g')

          ;[ 'transform', 'viewBox' ].forEach(attr => child.removeAttribute(attr))

          Array.from(symbolNode.attributes).map(({ nodeName, value }) => {
            symbolGroup.setAttribute(nodeName, value)
          })

          Array.from(newSymbol.childNodes).map(path => {
            symbolGroup.appendChild(path)
          })
          symbolNode = symbolGroup
        }

        group.appendChild(symbolNode?.cloneNode(true)!)

        child?.parentNode?.replaceChild(group, child)
      }
    } else if (child.hasChildNodes()) {
      transformUse(child, document)
    }
  })
}


/**
 * [convertUseToGroup] 转换 use 标签为 g 标签
 * 注意 symbol 标签 无 tranform 属性，含 viewBox 属性
 * @param {Document} document
 */
export const convertUseToGroup = (document: Document) => {
  transformUse(<HTMLOrSVGImageElement>document.documentElement, document)

  symbolNodes.forEach(id => {
    const node = document.getElementById(id)!
    if (node.nodeName.toUpperCase() === 'SYMBOL') {
      node.parentNode?.removeChild(node)
    } else if (node.parentNode?.nodeName.toUpperCase() === 'DEFS') {
      node.parentNode.removeChild(node)
    }
  })
}

