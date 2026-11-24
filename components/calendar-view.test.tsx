import { fireEvent, render, screen, within } from '@testing-library/react'
import CalendarView from './calendar-view'

test('selects a date and navigates by day, week and month', () => {
  const onDateChange = jest.fn()
  render(<CalendarView date="2026-11-24" today="2026-11-24" onDateChange={onDateChange}
    onAdd={jest.fn()} onMove={jest.fn()} items={new Map()} agenda={<p>Selected day</p>} />)
  expect(screen.getByRole('button', { name: 'Week' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: /Tuesday, November 24, 2026/ })).toHaveAttribute('aria-current', 'date')
  fireEvent.click(screen.getByRole('button', { name: 'Previous week' }))
  expect(onDateChange).toHaveBeenLastCalledWith('2026-11-17')
  fireEvent.click(screen.getByRole('button', { name: 'Day' }))
  fireEvent.click(screen.getByRole('button', { name: 'Next day' }))
  expect(onDateChange).toHaveBeenLastCalledWith('2026-11-25')
  fireEvent.click(screen.getByRole('button', { name: 'Month' }))
  expect(screen.getByRole('heading', { name: 'November 2026' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Next month' }))
  expect(onDateChange).toHaveBeenLastCalledWith('2026-12-01')
  expect(screen.getByText('Selected day')).toBeInTheDocument()
})

test('drops only the dragged activity on a new day and keeps same-day activities independently selectable', () => {
  const onDateChange = jest.fn()
  const onMove = jest.fn()
  const select = jest.fn()
  const otherSelect = jest.fn()
  const items = new Map([['2026-11-24', [
    { id: 'gi', title: 'Morning Gi', category: 'bjj_gi' as const, movable: true, select },
    { id: 'lifting', title: 'Lift', category: 'strength' as const, movable: true, select: otherSelect },
  ]]])
  render(<CalendarView date="2026-11-24" today="2026-11-24" onDateChange={onDateChange}
    onAdd={jest.fn()} onMove={onMove} items={items} agenda={null} />)
  const source = screen.getByRole('button', { name: 'Morning Gi' })
  fireEvent.click(source)
  expect(select).toHaveBeenCalledTimes(1)
  expect(otherSelect).not.toHaveBeenCalled()
  const dataTransfer = { getData: jest.fn().mockReturnValue('gi'), setData: jest.fn() }
  fireEvent.dragStart(source, { dataTransfer })
  expect(dataTransfer.setData).toHaveBeenCalledWith('application/x-bjj-activity', 'gi')
  const dates = screen.getByLabelText('Week dates')
  const target = within(dates).getByRole('button', { name: /Wednesday, November 25, 2026/ })
  fireEvent.drop(target, { dataTransfer })
  expect(onMove).toHaveBeenCalledWith('gi', '2026-11-25')
})
