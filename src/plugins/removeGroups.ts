import { XMLSerializer } from 'xmldom'
import { minify } from 'html-minifier'
import juice from 'juice'

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
  const attrs: OptionKeys = [ 'id', 'style', 'stroke', 'fill' ]

  const removeNode = (name: string, flag = true) => {
    if (nodeName(node).toLowerCase() === name && flag) {
      node.parentNode?.removeChild(node)
    }
  }

  const removeAttr = (attr: string, flag = true) => {
    const some = (attrs: string[]) => attrs.some((attr) => node.hasAttribute(attr))
    const stroke = some([ 'stroke', 'stroke-width' ])

    if (flag) {
      switch (attr) {
        case 'stroke':
          if (node.getAttribute('stroke') === 'none') {
            ;[ 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-dasharray' ]
              .forEach(name => node.removeAttribute(name))
          }
          break
        case 'fill':
          const fill = node.getAttribute('fill')
          if (fill !== 'none') {
            if (!stroke || (stroke && fill !== node.getAttribute('stroke'))) {
              node.removeAttribute(attr)
            }
          }
          break
        default:
          if (node?.hasAttribute(attr)) {
            node.removeAttribute(attr)
          }
          break
      }
    }
  }

  if (hasChildren && (<Array<string>>nodes).includes(nodeName(node).toLowerCase())) {
    nodes.forEach(name => removeNode(name, (<NodesOptions>options)[name]))
  }

  attrs.forEach(key => removeAttr(key, (<AttributesOptions>options)[key]))
}

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
  Array.from(node.childNodes).forEach(item => {
    const child = <HTMLOrSVGImageElement>item
    const nodeName = (node: HTMLOrSVGImageElement | Attr) => node.nodeName.toUpperCase()
    
    const hasAttr = (attr: string) => child.hasAttribute(attr)
    Array.from(node.attributes).map(attr => {
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

    
    const G = child.nodeName.toUpperCase() === 'G'
    const hasChildren = child.hasChildNodes()
    // 除了 <g></g> 以外都 insert Node
    if (!(G && !hasChildren)) {
      child.parentNode?.insertBefore(child, node)
    }

    if (G && hasChildren) {
      transRemoveNode(child)
    }
  })

  node.parentNode?.removeChild(node)
}

/**
 * [removeGroups] 去除 <g>
 * @param {Document} document
 * @param options
 */
export const removeGroups = (document: Document, options?: NodesOrAttributesOptions) => {
  const childNodes = () => Array.from(document.documentElement.childNodes)

  childNodes().forEach(node => {
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

  childNodes().forEach(node => {
    const child = <HTMLOrSVGImageElement>node
    clearNode(child, document, options)
  })
}

