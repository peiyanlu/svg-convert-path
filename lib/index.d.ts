interface TransformOptions {
    size?: number;
    center?: boolean;
}
interface NodesOptions {
    title?: boolean;
    desc?: boolean;
}
interface AttributesOptions {
    id?: boolean;
    style?: boolean;
    fill?: boolean;
    stroke?: boolean;
}
type NodesOrAttributesOptions = NodesOptions | AttributesOptions;
interface ParseConfig {
    plugins?: Array<string>;
    options?: TransformOptions | NodesOrAttributesOptions;
}
declare class SVGConvert {
    protected document: Document;
    protected constructor(document: Document);
    static parseStr(dataStr: string, config?: ParseConfig): void | SVGConvert;
    static parseFile(filePath: string, config?: ParseConfig): void | SVGConvert;
    protected static parse(text: string, config?: ParseConfig): void | SVGConvert;
    static parseDocument(document: Document, config?: ParseConfig): void | SVGConvert;
    toSimpleSvg(): string;
    getPathAttributes(): object[];
    toBase64(): string;
}

export { AttributesOptions, NodesOptions, NodesOrAttributesOptions, ParseConfig, TransformOptions, SVGConvert as default };
