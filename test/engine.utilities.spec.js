import { MakeConstEnumerator } from "../app/scripts/engine/utilities"


describe('Engine/Utilities', () => {

  describe('MakeEnumerator with Array argument', () => {
    const clsname   = 'MyConstEnum'
    const properties = [
      'elem0',
      'elem1',
      'elem2',
      'total',
    ]
    const MyConstEnum = MakeConstEnumerator(clsname, properties)
    const descriptors = Object.getOwnPropertyDescriptors(MyConstEnum)
    const entries     = Object.entries(descriptors)

    it('has the correct type', () => {
      expect(MyConstEnum.name).toBe(clsname)
    })

    it('has the correct number of properties', () => {
      let properties = entries.filter(([k,v]) => k != 'name')
      expect(properties.length).toBe(4)
    })

    it('has only readonly properties', () => {
      const allReadOnly = !entries.reduce((acc, entry) => acc || entry.writable, false)
      expect(allReadOnly).toBe(true)
    })

    it('has all properties defined', () => {
      const allPropsDefined =
        properties.reduce((acc, name) => acc && MyConstEnum.hasOwnProperty(name), true)
      expect(allPropsDefined).toBe(true)
    })

    it('numbers the properties in sequence', () => {
      const allPropsInSequence =
        properties.reduce((acc, name, index) => acc && (MyConstEnum[name] == index))
      expect(allPropsInSequence).toBe(true)
    })

    it('works with the spread operator', () => {
      const spread = () => [...MyConstEnum]

      expect(spread).not.toThrow()
      expect([...MyConstEnum]).toEqual(expect.arrayContaining([0, 1, 2, 3]))
    })
  })

  describe('MakeEnumerator with Object argument', () => {
    const clsname   = 'MyConstEnum'
    const properties = {
      'elem0' : 0x1,
      'elem1' : 0x2,
      'elem2' : 0x4,
      'elem3' : 0x8,
    }
    const MyConstEnum = MakeConstEnumerator(clsname, properties)

    it('maintains correct key-value pairs', () => {
      const allPropsInSequence =
        Object.keys(properties).reduce((acc, name, index) => acc && (MyConstEnum[name] === properties[name]))
      expect(allPropsInSequence).toBe(true)
    })

    it('works with the spread operator', () => {
      const spread = () => [...MyConstEnum]
      const expected = Object.values(properties)

      expect(spread).not.toThrow()
      expect([...MyConstEnum]).toEqual(expect.arrayContaining(expected))
    })
  })
})
