'use client'
import { Slot } from '@radix-ui/react-slot'
import { type ComponentProps, type ReactNode } from 'react'
import { useContextSelector } from 'use-context-selector'
import { DynamicLayoutContext } from './DynamicLayoutContext'

type AutoPositionProps = ComponentProps<'button'> & {
  asChild?: boolean
  children: ReactNode
}

export function AutoPosition({ asChild = false, children }: AutoPositionProps): ReactNode {
  const applyAutoPosition = useContextSelector(DynamicLayoutContext, (context) => context.applyAutoPosition)
  const Component = asChild ? Slot : 'button'

  return <Component onClick={applyAutoPosition}>{children}</Component>
}
