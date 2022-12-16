import type { NodesOrAttributesOptions } from '../index'

/**
 * [removeNodesOrAttributes] 清除节点或样式属性
 * @example
 *     <path d="M600,600h100v100h-100Z" id="图层" fill='yellow' style="background:#000;" />
 *
 *     <path d="M600,600h100v100h-100Z" />
 * @param {Document} document
 * @param {NodesOrAttributesOptions} options
 */
export declare const removeNodesOrAttributes: (document: Document, options?: NodesOrAttributesOptions) => void
