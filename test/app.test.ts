import SVGConvert from '../src'
import fs from 'fs'

const fileName: string = `1`
// const fileName: string = `22`
// const fileName: string = `test`


const parse = SVGConvert.parseFile(`${ process.cwd() }/test/${ fileName }.svg`, {
  plugins: [
    'convertUseToGroup',
    'convertShapeToPath',
    'removeGroups',
  ],
  options: {
    id: true,
    title: true,
    desc: true,
    style: true,
    fill: true,
    stroke: true,
  },
})

fs.writeFileSync(`${ process.cwd() }/test/${ fileName }_parse.svg`, (parse?.toSimpleSvg()) || '')

console.log(fileName)
//
// console.log(parse?.toSimpleSvg())
//
// console.log(parse?.getPathAttributes())
//
// console.log(parse?.toBase64())