import { MakeConstEnumerator } from "../app/scripts/engine/utilities"

describe('Engine/Utilities', function () {

  describe('MakeEnumerator', function () {

    const clsname   = 'MyConstEnum'
    const propNames = [
      'elem0',
      'elem1',
      'elem2',
      'total',
    ]
    const MyConstEnum = MakeConstEnumerator(clsname, propNames)
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

      expect(allReadOnly)
    })

    it('has all properties defined', function () {

      const allPropsDefined =
        propNames.reduce((acc, name) => acc && MyConstEnum.hasOwnProperty(name), true)

      expect(allPropsDefined)
    })

    it('numbers the properties in sequence', function () {

      const allPropsInSequence = propNames
        .reduce((acc, name, index) => acc && (MyConstEnum[name] == index))

      expect(allPropsInSequence)
    })

  })

})
