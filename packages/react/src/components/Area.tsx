'use client'
import { DynamicLayoutContext } from './DynamicLayoutContext'
import { InternalItem } from './InternalItem'

import { type CSSProperties, useMemo, type ComponentProps, type ReactNode, Children, type ReactElement } from 'react'
import { useContextSelector } from 'use-context-selector'

type AreaProps = ComponentProps<'div'> & {
  children: ReactElement | ReactElement[]
}

export function Area({ style, ...props }: AreaProps): ReactNode {
  const layout = useContextSelector(DynamicLayoutContext, (context) => context.layout)
  const allowDrag = useContextSelector(DynamicLayoutContext, (context) => context.allowDrag)
  const isDragging = useContextSelector(DynamicLayoutContext, (context) => context.isDragging)
  const onDrag = useContextSelector(DynamicLayoutContext, (context) => context.onDrag)
  const mergedStyle: CSSProperties = useMemo(
    () => ({
      ...style,
      position: 'relative',
      height: `${layout.height()}px`,
      width: `${layout.width()}px`,
    }),
    [layout, style],
  )

  const children = useMemo(() => {
    return Children.map(props.children, (child) => {
      const item = layout.items.find((item) => item.id === child.props.id)
      if (item === undefined) return null
      return (
        <InternalItem
          {...child.props}
          item={item}
          sliceHeight={layout.sliceHeight}
          sliceWidth={layout.sliceWidth}
          gap={layout.gap}
        />
      )
    })
  }, [layout.gap, layout.items, layout.sliceHeight, layout.sliceWidth, props.children])

  return (
    <div {...props} style={mergedStyle} data-allow-drag={allowDrag} data-is-dragging={isDragging} onDragOver={onDrag}>
      {children}
    </div>
  )
}
