/**
 * [transRemoveNode] 递归遍历去除 <g>
 * @example
 * <g transform="scale(2)">
 *     <path transform="rotate(45)" d="M0,0 L10,20"/>
 *     <path transform="translate(10, 20)" d="M0,10 L20,30"/>
 * </g>
 *                          ⬇
 * <path transform="scale(2) rotate(45)" d="M0,0 L10,20"/>
 * <path transform="scale(2) translate(10, 20)" d="M0,10 L20,30"/>
 * @param {HTMLOrSVGImageElement} node
 */
const transRemoveNode = (node: HTMLOrSVGImageElement) => {
  const ATTR = Array.from(node.attributes)

  Array.from(node.childNodes).map(item => {
    const child = <HTMLOrSVGImageElement>item

    const hasAttr = (attr: string) => child.hasAttribute(attr)
    if (ATTR.length > 0) {
      ATTR.map(attr => {
        if (attr.nodeName.toLowerCase() === 'transform') {
          let transformStr = attr.value

          if (hasAttr('transform')) {
            transformStr += ` ${ child.getAttribute('transform') }`
          }

          child.setAttribute(attr.nodeName, transformStr)
        } else if (!hasAttr(attr.nodeName)) {
          child.setAttribute(attr.nodeName, attr.value)
        }
      })
    }

    // 除了 <g></g> 以外都 insert Node
    if (!(child.nodeName.toUpperCase() === 'G' && !child.hasChildNodes())) {
      child.parentNode?.insertBefore(child, node)
    }

    if (child.nodeName.toUpperCase() === 'G' && child.hasChildNodes()) {
      transRemoveNode(child)
    }
  })

  node.parentNode?.removeChild(node)
}

/**
 * [removeGroups] 去除 <g>
 * @param {Document} document
 */
export const removeGroups = (document: Document) => {
  Array.from(document.documentElement.childNodes).forEach(node => {
    const child = <HTMLOrSVGImageElement>node

    if (child.nodeName.toUpperCase() === 'G') {
      if (child.hasChildNodes()) {
        transRemoveNode(child)
      } else {
        // empty
        child.parentNode?.removeChild(child)
      }
    }
  })
}

