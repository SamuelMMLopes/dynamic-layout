export class Item {
  private constructor(
    readonly id: string,
    readonly startColumn: number,
    readonly endColumn: number,
    readonly startRow: number,
    readonly endRow: number,
    readonly filledColumns: number,
    readonly filledRows: number,
  ) {
    Object.freeze(this)
  }

  static create({ id, startColumn, startRow, filledColumns, filledRows }: Item.CreateInput): Item {
    const endColumn = startColumn + filledColumns - 1
    const endRow = startRow + filledRows - 1
    return new Item(id, startColumn, endColumn, startRow, endRow, filledColumns, filledRows)
  }

  height({ sliceHeight, gap }: Item.HeightInput): number {
    const sliceHeightWithGap = sliceHeight + gap
    const height = this.filledRows * sliceHeightWithGap
    return height - gap
  }

  width({ sliceWidth, gap }: Item.WidthInput): number {
    const sliceWidthWithGap = sliceWidth + gap
    const width = this.filledColumns * sliceWidthWithGap
    return width - gap
  }

  xAxis({ sliceWidth, gap }: Item.XAxisInput): number {
    const sliceWidthWithGap = sliceWidth + gap
    return (this.startColumn - 1) * sliceWidthWithGap
  }

  yAxis({ sliceHeight, gap }: Item.YAxisInput): number {
    const sliceHeightWithGap = sliceHeight + gap
    return (this.startRow - 1) * sliceHeightWithGap
  }

  hasCollision(itemToCompare: Item): boolean {
    if (itemToCompare.id === this.id) return false
    return (
      this.startColumn <= itemToCompare.endColumn &&
      itemToCompare.startColumn <= this.endColumn &&
      this.startRow <= itemToCompare.endRow &&
      itemToCompare.startRow <= this.endRow
    )
  }

  toObject(): Item.ToObjectOutput {
    return {
      id: this.id,
      filledColumns: this.filledColumns,
      filledRows: this.filledRows,
      startColumn: this.startColumn,
      startRow: this.startRow,
    }
  }
}

export namespace Item {
  export type CreateInput = {
    id: string
    startColumn: number
    startRow: number
    filledColumns: number
    filledRows: number
  }

  export type HeightInput = {
    sliceHeight: number
    gap: number
  }

  export type WidthInput = {
    sliceWidth: number
    gap: number
  }

  export type XAxisInput = {
    sliceWidth: number
    gap: number
  }

  export type YAxisInput = {
    sliceHeight: number
    gap: number
  }

  export type ToObjectOutput = {
    id: string
    startColumn: number
    startRow: number
    filledColumns: number
    filledRows: number
  }
}
