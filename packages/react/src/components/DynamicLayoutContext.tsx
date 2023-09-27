'use client'
import { type Item, Layout } from '@dynamic-layout/core'
import { useRef, type ReactNode, type RefObject, useState, useCallback, type MouseEvent, useEffect } from 'react'
import { createContext } from 'use-context-selector'

type OnDragStartInput = {
  item: Item
  event: MouseEvent
}

type DynamicLayoutContextType = {
  layout: Layout
  isDragging: boolean
  allowDrag: boolean
  viewportRef: RefObject<HTMLDivElement>
  onDragStart: (input: OnDragStartInput) => void
  onDrag: (event: MouseEvent) => void
  onDragEnd: () => void
  applyAutoPosition: () => void
}

export const DynamicLayoutContext = createContext({} as DynamicLayoutContextType)

type ItemSettings = {
  id: string
  startColumn?: number
  startRow?: number
  filledColumns: number
  filledRows: number
}

type LayoutMode = 'fixed' | 'horizontallyResponsive'

type Settings = {
  mode: LayoutMode
  sliceHeight: number
  sliceWidth?: number
  gap: number
  totalColumns: number
  totalRows: number
  availableWidth?: number
  widthOfVisibleArea: number
  items?: ItemSettings[]
}

type DynamicLayoutProviderProps = {
  settings: Settings
  allowDrag?: boolean
  onLayoutChange?: (layout: Layout.ToObjectOutput) => void
  children: ReactNode
}

export function DynamicLayoutProvider({
  settings,
  allowDrag = false,
  onLayoutChange = () => {},
  children,
}: DynamicLayoutProviderProps): ReactNode {
  const [layout, setLayout] = useState(Layout.create(settings))
  const [isDragging, setIsDragging] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const lastMouseAxes = useRef<Layout.Axes | null>(null)
  const lastScrollAxes = useRef<Layout.Axes | null>(null)
  const itemBeingDragged = useRef<Item | null>(null)

  useEffect(() => {
    setLayout(Layout.create(settings))
  }, [settings])

  const onDragStart = useCallback(
    ({ item, event }: OnDragStartInput) => {
      if (viewportRef.current === null || !allowDrag) return
      event.stopPropagation()
      setIsDragging(true)
      itemBeingDragged.current = item
      lastMouseAxes.current = {
        xAxis: event.clientX,
        yAxis: event.clientY,
      }
      lastScrollAxes.current = {
        xAxis: viewportRef.current.scrollLeft,
        yAxis: viewportRef.current.scrollTop,
      }
    },
    [allowDrag],
  )

  const canDrag = useCallback(() => {
    if (
      !allowDrag ||
      itemBeingDragged.current === null ||
      lastMouseAxes.current === null ||
      lastScrollAxes.current === null
    ) {
      return false
    }
    return true
  }, [allowDrag])

  const onDrag = useCallback(
    (event: MouseEvent) => {
      if (!canDrag) return
      event.stopPropagation()
      const newLayout = layout.moveItem({
        itemToMove: itemBeingDragged.current as Item,
        currentMouseAxes: {
          xAxis: event.clientX,
          yAxis: event.clientY,
        },
        lastMouseAxes: lastMouseAxes.current as Layout.Axes,
        currentScrollAxes: {
          xAxis: viewportRef.current!.scrollLeft,
          yAxis: viewportRef.current!.scrollTop,
        },
        lastScrollAxes: lastScrollAxes.current as Layout.Axes,
      })
      if (newLayout !== layout) setLayout(newLayout)
    },
    [canDrag, layout],
  )

  const onDragEnd = useCallback(() => {
    if (!allowDrag) return
    setIsDragging(false)
    itemBeingDragged.current = null
    lastMouseAxes.current = null
    lastScrollAxes.current = null
    onLayoutChange(layout.toObject())
  }, [allowDrag, layout, onLayoutChange])

  const applyAutoPosition = useCallback(() => {
    setLayout((previousLayout) => {
      const newLayout = previousLayout.applyAutoPosition()
      onLayoutChange(newLayout.toObject())
      return newLayout
    })
  }, [onLayoutChange])

  return (
    <DynamicLayoutContext.Provider
      value={{
        layout,
        isDragging,
        allowDrag,
        viewportRef,
        onDragStart,
        onDrag,
        onDragEnd,
        applyAutoPosition,
      }}
    >
      {children}
    </DynamicLayoutContext.Provider>
  )
}
