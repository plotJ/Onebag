import { Metadata } from 'next'
import OptimizedBackpackSelector from '../components/OptimizedBackpackSelector'

export const metadata: Metadata = {
  title: 'Backpack Selector',
  description: 'Find the perfect backpack for your needs',
}

export default function Home() {
  return <OptimizedBackpackSelector />
}