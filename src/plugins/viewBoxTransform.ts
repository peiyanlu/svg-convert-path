import svgpath from 'svgpath'
import type { TransformOptions } from '../index'


/**
 * [transNode] 递归遍历变换 path d 值
 * @param {HTMLOrSVGImageElement} Node
 * @param {number} tranX
 * @param {number} tranY
 * @param {number} percent
 */
const transNode = (Node: HTMLOrSVGImageElement, tranX: number, tranY: number, percent: number) => {
  Array.from(Node.childNodes).forEach(node => {
    const child = <HTMLOrSVGImageElement>node
    if (child.nodeName.toUpperCase() === 'PATH') {
      if (child.hasAttribute('d')) {
        const pathd = child.getAttribute('d')!
        child.setAttribute(
          'd',
          svgpath(pathd)
            .translate(tranX, tranY)
            .scale(percent)
            .rel()
            .round(2)
            .toString(),
        )
      }

      // deal with stroke-width
      if (child.hasAttribute('stroke-width')) {
        const width = Number(child.getAttribute('stroke-width'))
        child.setAttribute('stroke-width', (width * percent).toFixed(2))
      }
    } else if (child.hasChildNodes()) {
      transNode(child, tranX, tranY, percent)
    }
  })
}

/**
 * [viewBoxTransform 转换 viewBox
 * @param {Document} document
 * @param {TransformOptions} options
 */
export const viewBoxTransform = (document: Document, options?: TransformOptions) => {
  const { size = 1024, center = false } = options || {}

  const VIEWBox = size > 0 ? [ 0, 0, size, size ] : [ 0, 0, 1024, 1024 ]

  const getAttr = (attr: string) => document.documentElement.getAttribute(attr)!

  const viewBox = (getAttr('viewbox') || getAttr('viewBox'))
    .split(/\s+|,/)
    .filter(t => t)
    .map(t => Number(t))

  const xScale = size / viewBox[2]
  const yScale = size / viewBox[3]

  const percent = Math.min(xScale, yScale)

  const translateX = xScale > yScale

  const translate = Math.abs(viewBox[2] - viewBox[3]) / 2

  let tranX = translateX ? translate : 0
  let tranY = translateX ? 0 : translate

  if (!center) {
    tranX = VIEWBox[0] - viewBox[0]
    tranY = VIEWBox[1] - viewBox[1]
  }

  transNode(<HTMLOrSVGImageElement>document.documentElement, tranX, tranY, percent)

  document.documentElement.setAttribute('viewBox', VIEWBox.join(' '))
}

