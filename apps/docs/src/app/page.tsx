'use client'
import { useState, type ReactNode } from 'react'
import { DynamicLayout } from '@dynamic-layout/react'

export default function Home(): ReactNode {
  const [settings] = useState({
    mode: 'fixed' as const,
    sliceHeight: 85,
    sliceWidth: 85,
    gap: 5,
    totalColumns: 10,
    totalRows: 10,
    widthOfVisibleArea: 1000,
    items: [
      {
        id: '1',
        startColumn: 1,
        startRow: 1,
        filledColumns: 2,
        filledRows: 2,
      },
      {
        id: '2',
        filledColumns: 5,
        filledRows: 2,
      },
      {
        id: '3',
        filledColumns: 5,
        filledRows: 2,
      },
      {
        id: '4',
        filledColumns: 5,
        filledRows: 2,
      },
      {
        id: '5',
        filledColumns: 5,
        filledRows: 2,
      },
    ],
  })

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <DynamicLayout.Root settings={settings} allowDrag>
        <DynamicLayout.AutoPosition>AutoSize</DynamicLayout.AutoPosition>
        <DynamicLayout.Viewport className="h-[800px] w-[1000px] overflow-scroll">
          <DynamicLayout.Area className="bg-square">
            <DynamicLayout.Item id="1" className="bg-red-500">
              1
            </DynamicLayout.Item>
            <DynamicLayout.Item id="2" className="bg-red-500">
              2
            </DynamicLayout.Item>
            <DynamicLayout.Item id="3" className="bg-red-500">
              3
            </DynamicLayout.Item>
            <DynamicLayout.Item id="4" className="bg-red-500">
              4
            </DynamicLayout.Item>
            <DynamicLayout.Item id="5" className="bg-red-500">
              5
            </DynamicLayout.Item>
          </DynamicLayout.Area>
        </DynamicLayout.Viewport>
      </DynamicLayout.Root>
    </div>
  )
}
