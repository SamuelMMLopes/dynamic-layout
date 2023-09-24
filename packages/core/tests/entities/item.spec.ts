import { Item } from '@/entities'

describe('Item', () => {
  let inputForItemCreation: Item.CreateInput

  beforeAll(() => {
    inputForItemCreation = {
      id: 'any_id',
      startColumn: 1,
      startRow: 1,
      filledColumns: 2,
      filledRows: 2,
    }
  })

  it('should calculate the end column and end row according to the input data', () => {
    const item = Item.create(inputForItemCreation)
    expect(item.endColumn).toBe(2)
    expect(item.endRow).toBe(2)
  })

  it('should return true when verifying if there is a collision and it exists', () => {
    const item = Item.create(inputForItemCreation)
    const itemToCompare = Item.create({ ...inputForItemCreation, id: 'any_id_2', startColumn: 2 })
    expect(item.hasCollision(itemToCompare)).toBeTruthy()
  })

  it('should return false when verifying if there is a collision and it does not exists', () => {
    const item = Item.create(inputForItemCreation)
    const itemToCompare = Item.create({ ...inputForItemCreation, id: 'any_id_2', startColumn: 3 })
    expect(item.hasCollision(itemToCompare)).toBeFalsy()
  })
})
