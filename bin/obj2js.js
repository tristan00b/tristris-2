#!/usr/bin/env -S node

import * as fs from 'fs/promises'
import { constants } from 'fs'

const usage =
`obj2js

usage: obj2js inFile outFile

  inFile  The path to the input file
  outFile The path to the output file (will be overwritten, if exists)

A tool for converting Wavefront (OBJ) files into JavaScript modules that are more convenient for use with to WebGL.
`

;(_ => {

  main(process.argv.slice(2))
  .catch(e => {
    console.log(`\n${e.message}\n`)
  })

})()

async function main(args)
{
  if (args.length < 2) throw new Error(usage)

  const [ipath, opath] = args

  const input  = await fs.readFile(ipath, 'utf8')
  const parsed = parseWavefrontObject(input)
  const output = convertToFileString(parsed)

  await fs.writeFile(opath, output)
}


function parseWavefrontObject(objFileStr)
{
  const _positions = []
  const _normals   = []
  const _colours   = []
  const _texels    = []
  const _faces     = []
  const _size      = 3

  const vertices =
  {
    name:      '',
    size:      _size,
    positions: [],
    normals:   [],
    colours:   [],
    texels:    [],
    indices:   [],
  }

  objFileStr.split('\n').forEach(line => {
    if      (line.startsWith('v '))
    {
      _positions.push(parseVertex({ str: line, size: _size }))
    }
    else if (line.startsWith('vn '))
    {
      _normals.push(parseNormal({ str: line, size: _size }))
    }
    else if (line.startsWith('f '))
    {
      _faces.push(parseFace({ str: line, size: _size }))
    }
    else if (line.startsWith('o '))
    {
      vertices.name = parseName({ str: line })
    }
  })

  _faces.forEach(face => {
    face.forEach(component => {
      const [pIdx, _, nIdx] = component

      const position = _positions[pIdx]
      const normal   = _normals  [nIdx]
      const index    = findPositionNormalPair({ vertices, position, normal })

      if (index !== -1) {
        // pair already added to data structure
        vertices.indices  .push(index)
      }
      else {
        // pair not yet added => we need a new index
        vertices.positions.push(position)
        vertices.normals  .push(normal)
        vertices.indices  .push(vertices.positions.length - 1)
      }

      // @todo handle colours, texels, etc
    })
  })

  return vertices
}


function findPositionNormalPair({ vertices, position, normal })
{
  const pCount  = vertices.positions.length
  const pString = JSON.stringify(position)
  const nString = JSON.stringify(normal)

  let result = -1

  for (let pIdx=0; pIdx<pCount; pIdx++)
  {
    const found = JSON.stringify(vertices.positions[pIdx]) == pString
               && JSON.stringify(vertices.normals  [pIdx]) == nString

    if (found)
    {
      result = pIdx
      break
    }
  }

  return result
}


function parseName({ str, prefix='o ' })
{
  const name = str.substring(2)

  if (name.length === 0)
    console.warn('object does not have a name')

  return name
}


function parseVertex({ str, size, prefix='v '})
{
  const components = str
    .substring(prefix.length)
    .split(' ')
    .map(parseFloat)

  if (components.length !== size)
    throw `vetex size != ${size}, got: ${components.length}`

  if (!components.every(c => typeof c === 'number'))
    throw `vertex component parsing failed, got:\n\n\t${components.map(c => typeof c)}`

  return components
}


function parseNormal({ str, size, prefix='vn ' })
{
  const components = str
    .substring(prefix.length)
    .split(' ')
    .map(parseFloat)

  if (components.length !== size)
    throw new Error(`normal size != ${size}, got: ${components.length}`)

  if (!components.every(c => typeof c === 'number'))
    throw new Error(`normal component parsing failed, got:\n\n\t${components.map(c => typeof c)}`)

  return components
}


function parseFace({ str, size, prefix='f ' })
{
  const components = str
    .substring(prefix.length)
    .split(' ')
    .map(f => f.split('/')
               .map(i => i ? parseInt(i) : 0)
               .map(i => i-1))

  if (components.length !== size)
    throw new Error(`face size must be ${size}, got: ${components.length}`)

  if (!components.every(c => c.every(i => typeof i === 'number')))
    throw new Error(`face component parsing failed, got:\n\n\t${components.map(c => c.map(i => typeof i))}`)

  return components
}


function convertToFileString(vertices)
{
  const {
    name,
    positions,
    normals,
    colours,
    texels,
    indices,
    size,
  } = vertices

  const lenStrs = [positions.length, normals.length, indices.length].map(String)
  const maxlen  = Math.max(...lenStrs.map(e => e.length), name.length)
  const [vlenStr, nlenStr, ilenStr] = lenStrs.map(str => `${ ' '.repeat(maxlen - str.length) }${ str }`)


  const output = `/*
 * name:     ${ name    }
 * vertices: ${ vlenStr }
 * normals:  ${ nlenStr }
 * indices:  ${ ilenStr }
 */
export const model = {
  name:       "${ name }",
  positions:  [${ positions.flat().join(', ') }],
  normals:    [${ normals  .flat().join(', ') }],
  colours:    [${ colours  .flat().join(', ') }],
  texels:     [${ texels   .flat().join(', ') }],
  indices:    [${ indices  .flat().join(', ') }],
  components: ${ size }
}
`
  return output
}
