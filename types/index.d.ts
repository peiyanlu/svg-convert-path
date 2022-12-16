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

export type NodesOrAttributesOptions = NodesOptions | AttributesOptions;

export interface ParseConfig {
  plugins?: Array<string>;
  options?: TransformOptions | NodesOrAttributesOptions;
}

export default class SVGConvert {
  static document: Document

  static parseStr(dataStr: string, config?: ParseConfig): typeof SVGConvert;

  static parseFile(filePath: string, config?: ParseConfig): typeof SVGConvert;

  static toSimpleSvg(): string;

  private static parse

  static parseNode(node: Document, config?: ParseConfig): typeof SVGConvert;

  static getPathAttributes(): object[];

  static toBase64(): string;
}
