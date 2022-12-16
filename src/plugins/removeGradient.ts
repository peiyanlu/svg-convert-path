const RegReferencesUrl = /\burl\(((["'])?#(.+?)\1)?\)/

/**
 * [removeGradient] 去除渐变 url('#id') 引用方法
 * @param {Document} document
 */
export const removeGradient = (document: Document) => {
  Array.from(document.documentElement.childNodes).forEach(node => {
    const child = <HTMLOrSVGImageElement>node

    if (child.nodeName.toUpperCase() === 'PATH') {
      if (
        child.hasAttribute('fill') &&
        RegReferencesUrl.test(child.getAttribute('fill')!)
      ) {
        child.removeAttribute('fill')
      }
    }
  })
}

