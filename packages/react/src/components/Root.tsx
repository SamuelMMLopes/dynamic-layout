'use client'
import { DynamicLayoutProvider } from './DynamicLayoutContext'

import { type ReactNode, type ComponentProps } from 'react'

type RootProps = ComponentProps<typeof DynamicLayoutProvider>

export function Root(props: RootProps): ReactNode {
  return <DynamicLayoutProvider {...props} />
}
