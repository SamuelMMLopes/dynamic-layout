import { Item } from './item'
import { Occupancies } from './occupancies'

export type LayoutMode = 'fixed' | 'horizontallyResponsive'

export class Layout {
  private readonly occupancies: Occupancies

  private constructor(
    readonly mode: LayoutMode,
    readonly sliceHeight: number,
    readonly sliceWidth: number,
    readonly gap: number,
    private readonly minTotalColumns: number,
    private readonly minTotalRows: number,
    private readonly widthOfVisibleArea: number,
    readonly items: Item[],
  ) {
    this.occupancies = new Occupancies(this.items, this.sliceWidth)
    Object.freeze(this)
  }

  static create({
    mode,
    sliceHeight,
    sliceWidth: rawSliceWidth = 0,
    gap,
    totalColumns,
    totalRows,
    availableWidth = 0,
    widthOfVisibleArea,
    items = [],
  }: Layout.CreateInput): Layout {
    if (mode === 'fixed' && !rawSliceWidth) throw new Error('Invalid layout')
    if (mode === 'horizontallyResponsive' && !availableWidth) throw new Error('Invalid layout')
    const sliceWidth = mode === 'fixed' ? rawSliceWidth : availableWidth / totalColumns
    const { itemsWithDefinedOccupancy, itemsWithUndefinedOccupancy } = items.reduce<{
      itemsWithDefinedOccupancy: Item[]
      itemsWithUndefinedOccupancy: Layout.AddItemInput[]
    }>(
      (result, { startColumn, startRow, ...item }) => {
        if (startColumn !== undefined && startRow !== undefined) {
          result.itemsWithDefinedOccupancy.push(Item.create({ ...item, startColumn, startRow }))
          return result
        }
        result.itemsWithUndefinedOccupancy.push(item)
        return result
      },
      { itemsWithDefinedOccupancy: [], itemsWithUndefinedOccupancy: [] },
    )
    const layout = new Layout(
      mode,
      sliceHeight,
      sliceWidth,
      gap,
      totalColumns,
      totalRows,
      widthOfVisibleArea,
      itemsWithDefinedOccupancy,
    )
    return itemsWithUndefinedOccupancy.reduce((layoutWithAllItems, item) => layoutWithAllItems.addItem(item), layout)
  }

  get totalColumns(): number {
    return Math.max(this.occupancies.lastFilledColumn + 3, this.minTotalColumns)
  }

  get totalRows(): number {
    return Math.max(this.occupancies.lastFilledRow + 3, this.minTotalRows)
  }

  height(): number {
    return (this.sliceHeight + this.gap) * this.totalRows
  }

  width(): number {
    return (this.sliceWidth + this.gap) * this.totalColumns
  }

  addItem({ id, startColumn, startRow, filledColumns, filledRows }: Layout.AddItemInput): Layout {
    const previouslyAddedItem = this.items.find((item) => item.id === id) !== undefined
    if (previouslyAddedItem) return this
    if (!startColumn || !startRow) {
      const { startColumn: nextStartColumn, startRow: nextStartRow } = this.occupancies.nextSlot({
        filledColumns,
        filledRows,
        widthOfVisibleArea: this.widthOfVisibleArea,
      })
      return new Layout(
        this.mode,
        this.sliceHeight,
        this.sliceWidth,
        this.gap,
        this.totalColumns,
        this.totalRows,
        this.widthOfVisibleArea,
        [
          ...this.items,
          Item.create({ id, startColumn: nextStartColumn, startRow: nextStartRow, filledColumns, filledRows }),
        ],
      )
    }
    return new Layout(
      this.mode,
      this.sliceHeight,
      this.sliceWidth,
      this.gap,
      this.totalColumns,
      this.totalRows,
      this.widthOfVisibleArea,
      [...this.items, Item.create({ id, startColumn, startRow, filledColumns, filledRows })],
    )
  }

  applyAutoPosition(): Layout {
    const rawItemsWithoutPositions: Layout.AddItemInput[] = this.items.map((item) => ({
      id: item.id,
      filledColumns: item.filledColumns,
      filledRows: item.filledRows,
    }))
    return Layout.create({
      mode: this.mode,
      sliceHeight: this.sliceHeight,
      sliceWidth: this.sliceWidth,
      gap: this.gap,
      totalColumns: this.minTotalColumns,
      totalRows: this.minTotalRows,
      widthOfVisibleArea: this.widthOfVisibleArea,
      items: rawItemsWithoutPositions,
    })
  }

  private columnsToMove({
    currentMouseXAxis,
    lastMouseXAxis,
    currentScrollXAxis,
    lastScrollXAxis,
  }: Layout.ColumnsToMoveInput): number {
    const deltaXAxis = currentMouseXAxis - lastMouseXAxis
    const xAxisToMove = deltaXAxis + (currentScrollXAxis - lastScrollXAxis)
    return Math.round(xAxisToMove / (this.sliceWidth + this.gap))
  }

  private rowsToMove({
    currentMouseYAxis,
    lastMouseYAxis,
    currentScrollYAxis,
    lastScrollYAxis,
  }: Layout.RowsToMoveInput): number {
    const deltaYAxis = currentMouseYAxis - lastMouseYAxis
    const yAxisToMove = deltaYAxis + (currentScrollYAxis - lastScrollYAxis)
    return Math.round(yAxisToMove / (this.sliceHeight + this.gap))
  }

  moveItem({
    itemToMove,
    currentMouseAxes,
    lastMouseAxes,
    currentScrollAxes,
    lastScrollAxes,
  }: Layout.MoveItemInput): Layout {
    const columnsToMove = this.columnsToMove({
      currentMouseXAxis: currentMouseAxes.xAxis,
      lastMouseXAxis: lastMouseAxes.xAxis,
      currentScrollXAxis: currentScrollAxes.xAxis,
      lastScrollXAxis: lastScrollAxes.xAxis,
    })
    const newStartColumn = itemToMove.startColumn + columnsToMove
    const rowsToMove = this.rowsToMove({
      currentMouseYAxis: currentMouseAxes.yAxis,
      lastMouseYAxis: lastMouseAxes.yAxis,
      currentScrollYAxis: currentScrollAxes.yAxis,
      lastScrollYAxis: lastScrollAxes.yAxis,
    })
    const newStartRow = itemToMove.startRow + rowsToMove
    if (newStartColumn < 1 || newStartRow < 1) return this
    const itemMoved = Item.create({ ...itemToMove, startColumn: newStartColumn, startRow: newStartRow })
    const collisions = this.items.filter((item) => item.hasCollision(itemMoved))
    if (collisions.length > 0) return this
    const itemsWithoutItemToMove = this.items.filter((item) => item.id !== itemToMove.id)
    return new Layout(
      this.mode,
      this.sliceHeight,
      this.sliceWidth,
      this.gap,
      this.minTotalColumns,
      this.minTotalRows,
      this.widthOfVisibleArea,
      [...itemsWithoutItemToMove, itemMoved],
    )
  }
}

export namespace Layout {
  export type CreateInput = {
    mode: LayoutMode
    sliceHeight: number
    sliceWidth?: number
    gap: number
    totalColumns: number
    totalRows: number
    availableWidth?: number
    widthOfVisibleArea: number
    items?: AddItemInput[]
  }

  export type AddItemInput = {
    id: string
    startColumn?: number
    startRow?: number
    filledColumns: number
    filledRows: number
  }

  export type ColumnsToMoveInput = {
    currentMouseXAxis: number
    lastMouseXAxis: number
    currentScrollXAxis: number
    lastScrollXAxis: number
  }

  export type RowsToMoveInput = {
    currentMouseYAxis: number
    lastMouseYAxis: number
    currentScrollYAxis: number
    lastScrollYAxis: number
  }

  export type Axes = {
    xAxis: number
    yAxis: number
  }

  export type MoveItemInput = {
    itemToMove: Item
    currentMouseAxes: Axes
    lastMouseAxes: Axes
    currentScrollAxes: Axes
    lastScrollAxes: Axes
  }
}
