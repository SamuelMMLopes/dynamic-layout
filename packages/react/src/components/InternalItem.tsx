'use client'
import { type Item as ItemComponent } from './Item'
import { DynamicLayoutContext } from './DynamicLayoutContext'

import {
  type CSSProperties,
  useMemo,
  type ComponentProps,
  type ReactNode,
  memo,
  useCallback,
  useState,
  type MouseEvent,
} from 'react'
import { type Item } from '@dynamic-layout/core'
import { useContextSelector } from 'use-context-selector'

type InternalItemProps = ComponentProps<typeof ItemComponent> & {
  item: Item
  sliceHeight: number
  sliceWidth: number
  gap: number
}

function InternalItemComponent({ item, sliceHeight, sliceWidth, gap, style, ...props }: InternalItemProps): ReactNode {
  const onDragStart = useContextSelector(DynamicLayoutContext, (context) => context.onDragStart)
  const onDragEnd = useContextSelector(DynamicLayoutContext, (context) => context.onDragEnd)
  const allowDrag = useContextSelector(DynamicLayoutContext, (context) => context.allowDrag)
  const [isDragging, setIsDragging] = useState(false)
  const height = useMemo(() => `${item.height({ sliceHeight, gap })}px`, [gap, item, sliceHeight])
  const width = useMemo(() => `${item.width({ sliceWidth, gap })}px`, [gap, item, sliceWidth])
  const left = useMemo(() => `${item.xAxis({ sliceWidth, gap })}px`, [gap, item, sliceWidth])
  const top = useMemo(() => `${item.yAxis({ sliceHeight, gap })}px`, [gap, item, sliceHeight])
  const mergedStyle: CSSProperties = useMemo(
    () => ({
      ...style,
      '--item-height': height,
      '--item-width': width,
      position: 'absolute',
      height,
      width,
      left,
      top,
      transition:
        'height 125ms linear 125ms,width 125ms linear 0s,top 175ms ease-out,left 175ms ease-out,right 175ms ease-out',
    }),
    [height, left, style, top, width],
  )

  const handleDragStart = useCallback(
    (event: MouseEvent) => {
      onDragStart({ item, event })
    },
    [item, onDragStart],
  )

  const handleDragEnd = useCallback(() => {
    onDragEnd()
    setIsDragging(false)
  }, [onDragEnd])

  return (
    <div
      {...props}
      draggable={allowDrag}
      data-is-dragging={isDragging}
      data-allow-drag={allowDrag}
      style={mergedStyle}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    />
  )
}

export const InternalItem = memo(InternalItemComponent)
