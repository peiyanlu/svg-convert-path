import fs from 'fs'
import { minify } from 'html-minifier'
import juice from 'juice'
import { DOMParser, XMLSerializer } from 'xmldom'
import {
  convertShapeToPath,
  convertTransformForPath,
  convertUseToGroup,
  removeGradient,
  removeGroups,
  viewBoxTransform,
} from './plugins'

export interface TransformOptions {
  size?: number;
  center?: boolean;
}

export interface NodesOptions {
  title?: boolean;
  desc?: boolean;
}

export interface AttributesOptions {
  id?: boolean;
  style?: boolean;
  fill?: boolean;
  stroke?: boolean;
}

export type NodesOrAttributesOptions = NodesOptions | AttributesOptions

export interface ParseConfig {
  plugins?: Array<string>,
  options?: TransformOptions | NodesOrAttributesOptions
}

enum SpecialPlugins {
  convertUseToGroup = 'convertUseToGroup',
  viewBoxTransform = 'viewBoxTransform'
}


type pluginFn<T> = (document: Document, options?: T) => void
type PluginType = {
  [key: string]: pluginFn<TransformOptions> | pluginFn<NodesOrAttributesOptions>
}

const pluginList: PluginType = {
  convertUseToGroup,
  convertShapeToPath,
  convertTransformForPath,
  removeGradient,
  removeGroups,
  viewBoxTransform,
}

/**
 * 解决 minify 压缩 svg 引起的 viewBox 变成 viewbox 问题
 * @param {Document} document
 */
const fixExtraFiled = (document: Document) => {
  const node = document.documentElement
  const viewbox = node.getAttribute('viewbox')
  if (viewbox) {
    node.setAttribute('viewBox', viewbox)
    node.removeAttribute('viewbox')
  }
}


const dispatcher = (document: Document, config?: ParseConfig) => {
  const { plugins, options } = config!

  if (plugins) {
    const cug = plugins.indexOf(SpecialPlugins.convertUseToGroup)
    if (!!~cug && cug !== 0) {
      plugins.splice(cug, 1)
      plugins.unshift(SpecialPlugins.convertUseToGroup)
    }
    const vt = plugins.indexOf(SpecialPlugins.viewBoxTransform)
    if (!!~vt && vt !== plugins.length - 1) {
      plugins.splice(vt, 1)
      plugins.push(SpecialPlugins.viewBoxTransform)
    }

    plugins?.forEach(plugin => pluginList[plugin] && pluginList[plugin](document, options))
  }
}

export default class SVGConvert {
  protected constructor(protected document: Document) {

  }

  static parseStr(dataStr: string, config?: ParseConfig) {
    return this.parse(dataStr, config)
  }

  static parseFile(filePath: string, config?: ParseConfig) {
    const text = fs.readFileSync(filePath, { encoding: 'utf-8' })
    return this.parse(text, config)
  }

  protected static parse(text: string, config?: ParseConfig) {
    try {
      const parser = new DOMParser()
      const source = juice(minify(text, {
        collapseWhitespace: true, removeComments: true,
      }))
      const doc = parser.parseFromString(source, 'application/xml')

      return this.parseDocument(doc, config)
    } catch ( e ) {
      return console.error('SVG 解析失败：', e)
    }
  }

  static parseDocument(document: Document, config?: ParseConfig) {
    const nodeName = document.documentElement.nodeName.toUpperCase()

    if (nodeName !== 'SVG') {
      return console.error('SVG 解析失败：请传入 SVG 文档！')
    }

    fixExtraFiled(document)
    dispatcher(document, config)

    return new SVGConvert(document)
  }

  toSimpleSvg() {
    return this.document ? new XMLSerializer().serializeToString(this.document) : ''
  }

  getPathAttributes() {
    const paths: object[] = []

    if (this.document) {
      Array
        .from(this.document.documentElement.childNodes)
        .forEach((node, index) => {
          const pathObj: Record<string, any> = {}
          pathObj.pid = index
          if (node.nodeName.toUpperCase() === 'PATH') {
            Array
              .from((<HTMLOrSVGImageElement>node).attributes)
              .forEach((attr) => {
                if (attr.value) {
                  pathObj[attr.nodeName.toLowerCase()] = attr.value
                }
              })
            paths.push(pathObj)
          }
        })
    }

    return paths
  }

  toBase64() {
    return `data:image/svg+xml;charset=utf-8,${ encodeURIComponent(this.toSimpleSvg()) }`
  }
}
