import { cn } from './utils'

describe('cn utility', () => {
    it('merges tailwind classes correctly', () => {
        // twMerge should resolve conflicts
        expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
    })

    it('handles conditional classes', () => {
        expect(cn('p-4', true && 'mt-2', false && 'bg-white')).toBe('p-4 mt-2')
    })
})
