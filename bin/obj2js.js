#!/usr/bin/env -S node

import * as fs from 'fs/promises'
import { constants } from 'fs'


const usage = `obj2js

usage: obj2js [-y | --flip-y] inFile outFile

  -y|--flip-y  Invert the y-component of uv-coordinates
  inFile       The path to the input file
  outFile      The path to the output file (will be overwritten, if exists)

A tool for converting Wavefront (OBJ) files into JavaScript modules that are more convenient for use with to WebGL.

N.B. the following assumptions are made:
  - vertex data has been pre-triangulated (there are 3 vertices per face)
  - there are 3 components per vertex position, and normal
  - there are 2 components per uv-coordinate (if they are included in the obj file)
`

main(process.argv.slice(2)).catch(console.error)


async function main(args)
{
  if (args.length < 2) throw new Error(usage)

  const flipY = args[0] === '--flip-y' || args[0] === '-y'

  const [ipath, opath] = args.slice(1)

  const input  = await fs.readFile(ipath, 'utf8')
  const parsed = parseWavefrontObject(input, flipY)
  const output = convertToFileString(parsed)

  await fs.writeFile(opath, output)
}


function parseWavefrontObject(objFileStr, flipY)
{
  const _positions = []
  const _normals   = []
  const _uvcoords  = []
  const _colours   = []
  const _faces     = []

  const vertices =
  {
    name:      '',
    positions: [],
    normals:   [],
    uvcoords:  [],
    colours:   [],
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
      const uv = parseUVCoord(line)
      _uvcoords.push([uv[0], flipY ? -uv[1]: uv[1]])
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
    throw `vertex component parsing failed (expected component type to be 'number', got: [${components.map(c => typeof c).join(', ')}])`

  return components
}


const parseVertex  = str => parseComponents({ str, size: 3, prefix: 'v '  })
const parseNormal  = str => parseComponents({ str, size: 3, prefix: 'vn ' })
const parseUVCoord = str => parseComponents({ str, size: 2, prefix: 'vt ' })


function parseFace(str, size=3, prefix='f ')
{
  const components = str
    .substring(prefix.length)
    .split(' ')
    .map(f => f.split('/')
               .map(i => i ? parseInt(i) : 0)
               .map(i => i-1))

  if (components.length !== size)
    throw new Error(`faces must be triangulated prior to using this tool (expected ${size} components per face, got: ${components.length})`)

  if (!components.every(c => c.every(i => typeof i === 'number')))
    throw new Error(`face component parsing failed (expected component type to be 'number', got: [${components.map(c => c.map(i => typeof i)).join(', ')}])`)

  return components
}


function convertToFileString(vertices)
{
  const {
    name,
    material,
    positions,
    normals,
    uvcoords,
    colours,
    indices,
  } = vertices

  const lenStrs = [positions.length, normals.length, uvcoords.length, colours.length, indices.length].map(String)
  const maxlen  = Math.max(...lenStrs.map(e => e.length), name.length)
  const [vlenStr, nlenStr, ulenStr, clenStr, ilenStr] = lenStrs.map(str => `${ ' '.repeat(maxlen - str.length) }${ str }`)

  const output = `/*
 * name:     ${ name    }
 * vertices: ${ vlenStr }
 * normals:  ${ nlenStr }
 * uvcoords: ${ ulenStr }
 * colours:  ${ clenStr }
 * indices:  ${ ilenStr }
 */
export const model = {
  name:       "${ name     }",
  material:   "${ material }",
  positions:  [${ positions.flat().join(', ') }],
  normals:    [${ normals  .flat().join(', ') }],
  uvcoords:   [${ uvcoords .flat().join(', ') }],
  colours:    [${ colours  .flat().join(', ') }],
  indices:    [${ indices  .flat().join(', ') }],
}
`
  return output
}
