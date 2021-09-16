import { MakeConstEnumerator } from "../app/scripts/engine/utilities"


describe('Engine/Utilities', function () {

  describe('MakeEnumerator with Array argument', function () {
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

    it('has the correct type', function () {
      expect(MyConstEnum.name).toBe(clsname)
    })

    it('has the correct number of properties', function () {
      let properties = entries.filter(([k,v]) => k != 'name')
      expect(properties.length).toBe(4)
    })

    it('has only readonly properties', function () {
      const allReadOnly = !entries.reduce((acc, entry) => acc || entry.writable, false)
      expect(allReadOnly).toBe(true)
    })

    it('has all properties defined', function () {
      const allPropsDefined =
        properties.reduce((acc, name) => acc && MyConstEnum.hasOwnProperty(name), true)
      expect(allPropsDefined).toBe(true)
    })

    it('numbers the properties in sequence', function () {
      const allPropsInSequence = properties
        .reduce((acc, name, index) => acc && (MyConstEnum[name] == index))
      expect(allPropsInSequence).toBe(true)
    })
  })

  describe('MakeEnumerator with Object argument', function () {
    const clsname   = 'MyConstEnum'
    const properties = {
      'elem0' : 0x1,
      'elem1' : 0x2,
      'elem2' : 0x4,
      'elem3' : 0x8,
    }
    const MyConstEnum = MakeConstEnumerator(clsname, properties)

    it('maintains correct key-value pairs', function () {
      const allPropsInSequence =
        Object.keys(properties).reduce((acc, name, index) => acc && (MyConstEnum[name] === properties[name]))
      expect(allPropsInSequence).toBe(true)
    })
  })
})
