#!/usr/bin/env -S node

import * as fs from 'fs/promises'
import { constants } from 'fs'


const usage = `obj2js

usage: obj2js inFile outFile

  inFile  The path to the input file
  outFile The path to the output file (will be overwritten, if exists)

A tool for converting Wavefront (OBJ) files into JavaScript modules that are more convenient for use with to WebGL.
`

main(process.argv.slice(2)).catch(console.error)


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
  const _uvcoords  = []
  const _faces     = []

  const vertices =
  {
    name:      '',
    size:      _size,
    positions: [],
    normals:   [],
    colours:   [],
    uvcoords:  [],
    indices:   [],
  }

  objFileStr.split('\n').forEach(line => {
    if (line.startsWith('v '))
    {
      _positions.push(parseVertex(line))
    }
    else if (line.startsWith('vn '))
    {
      _normals.push(parseNormal(line))
    }
    else if (line.startsWith('vt '))
    {
      _uvcoords.push(parseUVCoord(line))
    }
    else if (line.startsWith('f '))
    {
      _faces.push(parseFace(line))
    }
    else if (line.startsWith('o '))
    {
      vertices.name = parseName(line, 'o ')
    }
    else if (line.startsWith('usemtl '))
    {
      vertices.material = parseName(line, 'usemtl ')
    }
  })

  _faces.forEach(face => {
    face.forEach(component => {
      const [pIdx, uIdx, nIdx] = component

      const position = _positions[pIdx]
      const normal   = _normals  [nIdx]
      const uvcoord  = _uvcoords [uIdx]
      const index    = findIndex(vertices, position, normal, uvcoord)

      if (index !== -1) {
        // pair already added to data structure
        vertices.indices  .push(index)
      }
      else {
        // pair not yet added => we need a new index
        vertices.positions.push(position)
        vertices.normals  .push(normal)
        vertices.uvcoords .push(uvcoord)
        vertices.indices  .push(vertices.positions.length - 1)
      }

      // @todo handle colours, etc
    })
  })

  return vertices
}


function findIndex(vertices, position, normal, uvcoord)
{
  const pCount  = vertices.positions.length
  const pString = JSON.stringify(position)
  const nString = JSON.stringify(normal)
  const uString = JSON.stringify(uvcoord)

  let result = -1

  for (let pIdx=0; pIdx<pCount; pIdx++)
  {
    const found = JSON.stringify(vertices.positions[pIdx]) == pString
               && JSON.stringify(vertices.normals  [pIdx]) == nString
               && JSON.stringify(vertices.uvcoords [pIdx]) == uString

    if (found)
    {
      result = pIdx
      break
    }
  }

  return result
}


function parseName(str, prefix)
{
  const name = str.substring(prefix.length)
  return name
}


function parseComponents({ str, size, prefix })
{
  const components = str
    .substring(prefix.length)
    .split(' ')
    .map(parseFloat)

  if (components.length !== size)
    throw `vertex size != ${size}, got: ${components.length}`

  if (!components.every(c => typeof c === 'number'))
    throw `vertex component parsing failed, got:\n\n\t${components.map(c => typeof c)}`

  return components
}


const parseVertex  = str => parseComponents({ str, size: 3, prefix: 'v '  })
const parseNormal  = str => parseComponents({ str, size: 3, prefix: 'vn ' })
const parseUVCoord = str => parseComponents({ str, size: 2, prefix: 'vt ' })


function parseFace(str, size, prefix='f ')
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
    material,
    positions,
    normals,
    colours,
    uvcoords,
    indices,
    size,
  } = vertices

  const lenStrs = [positions.length, normals.length, uvcoords.length, indices.length].map(String)
  const maxlen  = Math.max(...lenStrs.map(e => e.length), name.length)
  const [vlenStr, nlenStr, ulenStr, ilenStr] = lenStrs.map(str => `${ ' '.repeat(maxlen - str.length) }${ str }`)

  const output = `/*
 * name:     ${ name    }
 * vertices: ${ vlenStr }
 * normals:  ${ nlenStr }
 * uvcoords: ${ ulenStr }
 * indices:  ${ ilenStr }
 */
export const model = {
  name:       "${ name     }",
  material:   "${ material }",
  positions:  [${ positions.flat().join(', ') }],
  normals:    [${ normals  .flat().join(', ') }],
  colours:    [${ colours  .flat().join(', ') }],
  uvcoords:   [${ uvcoords .flat().join(', ') }],
  indices:    [${ indices  .flat().join(', ') }],
  components: ${ size }
}
`
  return output
}
