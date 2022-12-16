## svg-convert-path [![npm](https://img.shields.io/badge/npm-svg--convert--path-brightgreen)](https://www.npmjs.com/package/svg-convert-path)

一个 Node.js 库，用于将 svg 中形状元素转换为路径元素；基于 [convertpath](https://www.npmjs.com/package/convertpath) 开发

## Install

```
npm install svg-convert-path
```

## What it can do

- convertUseToGroup：转换 defs 和 symbol 元素为 g 元素
- convertShapeToPath：转换 shape 元素为 path 元素
- convertTransformForPath：删除 transform 属性并将数据转换到 path 属性
- removeGradient：删除通过 url('#id') 引入的渐变
- removeGroups：删除 g 元素并将 g 元素属性移动到其包含的元素；**支持参数 NodesOptions | AttributesOptions**
- viewBoxTransform：删除 width/height 属性并且重置 viewBox 属性；**支持参数 TransformOptions**

## Usage

```ts
import SVGConvert from 'svg-convert-path'

const parse = SVGConvert.parseFile('test.svg', {
  plugins: [
    'convertUseToGroup',
    'convertShapeToPath',
    'convertTransformForPath',
    'removeGradient',
    'removeGroups',
    'viewBoxTransform'
  ],
  options: {
    id: true,
    title: true,
    desc: true,
    style: true,
    fill: true,
    center: false,
    size: 1024
  },
})

const result = parse?.toSimpleSvg()
console.log(result)
```

## Interface

```ts
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

interface ParseConfig {
  plugins?: Array<string>;
  options?: TransformOptions | NodesOptions | AttributesOptions;
}
```

## API

#### SVGConvert.parseFile(filePath: string, config?: ParseConfig): void | SVGConvert

#### SVGConvert.parseStr(dataStr: string, config?: ParseConfig): void | SVGConvert

#### SVGConvert.parseDocument(document: Document, config?: ParseConfig): void | SVGConvert

#### parse?.toSimpleSvg(): string

#### parse?.getPathAttributes(): object[]

#### parse?.toBase64(): string

## CHANGELOG

[CHANGELOG.md](https://github.com/peiyanlu/svg-convert-path/blob/master/CHANGELOG.md)

## Special thanks

- [SVGO](https://github.com/svg/svgo)
- [fontello](https://github.com/fontello/svgpath)
- [W3C SVG11](https://www.w3.org/TR/SVG11/)
