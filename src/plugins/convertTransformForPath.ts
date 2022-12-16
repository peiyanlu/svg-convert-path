import svgpath from 'svgpath'

/**
 * [convertTransformForPath] 转换 Transfrom
 * @param {Document} document
 */
export const convertTransformForPath = (document: Document) => {
  Array.from(document.documentElement.childNodes).forEach(node => {
    const child = <HTMLOrSVGImageElement>node

    if (node.nodeName.toUpperCase() === 'PATH') {
      const D = child.getAttribute('d')
      // 移除 path d 为空的数据
      if (!D) {
        child.parentNode?.removeChild(node)
      } else if (child.hasAttribute('transform')) {
        const transformStr = svgpath(D)
          .transform(child.getAttribute('transform')!)
          .rel()
          .round(2)
          .toString()
        child.removeAttribute('transform')
        child.setAttribute('d', transformStr)
      }
    }
  })
}

