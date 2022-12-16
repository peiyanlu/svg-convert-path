import type { AttributesOptions, NodesOptions, NodesOrAttributesOptions } from '../index'

type OptionKeys = Array<keyof NodesOptions> | Array<keyof AttributesOptions>

/**
 * [clearNode] 递归遍历清除属性
 * @param {*} node
 * @param document
 * @param options
 */
const clearNode = (node: HTMLOrSVGImageElement, document: Document, options?: NodesOrAttributesOptions) => {
  if (!options) return
  // 基本的图形都不含有子结点
  const hasChildren = node.hasChildNodes()
  const nodeName = (node: HTMLOrSVGImageElement) => node.nodeName.toUpperCase()

  const nodes: OptionKeys = [ 'title', 'desc' ]
  const attrs: OptionKeys = [ 'id', 'style', 'fill' ]

  const removeNode = (name: string, flag = true) => {
    if (nodeName(node).toLowerCase() === name && flag) {
      node.parentNode?.removeChild(node)
    }
  }

  const removeAttr = (attr: string, flag = true) => {
    const some = (attrs: string[]) => attrs.some((attr) => node.hasAttribute(attr))

    const stroke = some([ 'stroke', 'stroke-width' ])

    const hasFillNone = (node: HTMLOrSVGImageElement) => {
      let hasFill = false
      let parent: HTMLOrSVGImageElement = <HTMLOrSVGImageElement>node.parentNode

      while (!hasFill && parent && nodeName(parent) === 'G') {
        hasFill = parent.hasAttribute('fill') && parent.getAttribute('fill') === 'none'
        parent = <HTMLOrSVGImageElement>parent?.parentNode
      }

      return hasFill
    }


    /**
     * fill 属性处理：
     * 如果存在 stroke 等属性但是没有 fill 等属性，fill 属性值设置为 none
     * 如果不存在 stroke 或者 fill 与 stroke 同时存在，删除 fill 属性
     */
    if (
      attr === 'fill' && flag
      && nodeName(node) !== 'G'
      && stroke && hasFillNone(node)
      && !node.hasAttribute('fill')
    ) {
      return node.setAttribute(attr, 'none')
    }

    if (attr === 'stroke' && node.getAttribute('stroke') === 'none' && nodeName(node) === 'G') {
      ;[ 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-dasharray' ]
        .forEach(name => node.removeAttribute(name))
    }

    if (node?.hasAttribute(attr) && flag) {
      node.removeAttribute(attr)
    }
  }

  if (hasChildren) {
    if ((<Array<string>>nodes).includes(nodeName(node).toLowerCase())) {
      nodes.forEach(name => removeNode(name, (<NodesOptions>options)[name]))
    } else {
      Array
        .from(node.childNodes)
        .forEach(item => clearNode(<HTMLOrSVGImageElement>item, document, options))
    }
  } else {
    const deep = (node: HTMLOrSVGImageElement) => {
      let hasChildren = false
      let parent: HTMLOrSVGImageElement = node
      while (!hasChildren && parent && nodeName(node) === 'G') {
        removeNode(parent.nodeName)
        hasChildren = (<HTMLOrSVGImageElement>parent).hasChildNodes()
        parent = <HTMLOrSVGImageElement>(<HTMLOrSVGImageElement>parent)?.parentNode
      }
    }

    deep(node)
  }

  attrs.forEach(key => removeAttr(key, (<AttributesOptions>options)[key]))
}

/**
 * [removeNodesOrAttributes] 清除节点或样式属性
 * @example
 *     <path d="M600,600h100v100h-100Z" id="图层" fill='yellow' style="background:#000;" />
 *
 *     <path d="M600,600h100v100h-100Z" />
 * @param {Document} document
 * @param {NodesOrAttributesOptions} options
 */
export const removeNodesOrAttributes = (document: Document, options?: NodesOrAttributesOptions) => {
  Array
    .from(document.documentElement.childNodes)
    .forEach(node => clearNode(<HTMLOrSVGImageElement>node, document, options))
}
