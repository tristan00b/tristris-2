import { Tag } from "../app/engine/ecs/Tag"

describe('Tag', function () {

  const MyTag = class extends Tag {}
  const myTag = new MyTag

  describe('Tag.isTag', function () {
    it('is a tag', function () {
      expect(Tag.isTag).toBe(true)
    })
  })

  describe('MyTag.constructor', function () {
    it('produces an instance of Tag', function () {
      expect(myTag instanceof Tag).toBe(true)
    })

    it('produces an instacne of Tag', function () {
      expect(myTag instanceof Tag).toBe(true)
    })
  })

  describe('MyTag.name', function () {
    it('has correct name', function () {
      expect(MyTag.name).toBe('MyTag')
      expect(myTag.constructor.name).toBe('MyTag')
    })
  })

  describe('MyTag.isTag', function () {
    it('is a tag component', function () {
      expect(MyTag.isTag).toBe(true)
      expect(myTag.isTag).toBe(true)
    })
  })
})
