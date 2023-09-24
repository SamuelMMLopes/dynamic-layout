import { Layout } from '@/entities'

describe('Layout', () => {
  let inputForLayoutCreation: Layout.CreateInput

  beforeAll(() => {
    inputForLayoutCreation = {
      mode: 'fixed',
      sliceHeight: 85,
      sliceWidth: 85,
      gap: 5,
      totalColumns: 10,
      totalRows: 10,
    }
  })

  it('should return an error when trying to create an invalid fixed layout', () => {
    expect(() => Layout.create({ ...inputForLayoutCreation, sliceWidth: undefined })).toThrow(
      new Error('Invalid layout'),
    )
  })

  it('should calculate the slice width when creating the horizontally responsive layout', () => {
    const rawLayout = {
      mode: 'horizontallyResponsive',
      gap: 5,
      totalColumns: 10,
      totalRows: 10,
      sliceHeight: 85,
      availableWidth: 500,
    } as const
    const layout = Layout.create(rawLayout)
    expect(layout.sliceWidth).toBe(50)
  })

  it('should return a new layout with the added item', () => {
    const layout = Layout.create(inputForLayoutCreation)
    const rawItem = {
      id: 'any_id',
      startColumn: 1,
      startRow: 1,
      filledColumns: 2,
      filledRows: 2,
    }
    const layoutWithAddedItem = layout.addItem({ ...rawItem, widthOfVisibleArea: 500 })
    expect(layoutWithAddedItem.items).toHaveLength(1)
  })
})
