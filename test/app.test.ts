import SVGConvert from '../lib/index.module'
import fs from 'fs'

// const fileName: string = `1`
// const fileName: string = `22`
const fileName: string = `test`

const parse = SVGConvert.parseFile(`${ process.cwd() }/test/${ fileName }.svg`, {
  plugins: [
    'convertUseToGroup',
    'removeNodesOrAttributes',
    'convertShapeToPath',
  ],
  options: {
    id: true,
    title: true,
    desc: true,
    style: true,
    fill: true,
  },
})

fs.writeFileSync(`${ process.cwd() }/test/${ fileName }_parse.svg`, (parse?.toSimpleSvg()) || '')

console.log(fileName)
//
// console.log(parse?.toSimpleSvg())
//
// console.log(parse?.getPathAttributes())