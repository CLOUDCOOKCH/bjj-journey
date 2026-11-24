import { fireEvent, render, screen } from '@testing-library/react'
import { MonthlyChart } from './monthly-chart'

test('changes the range and opens the selected month in the planner', () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  render(<MonthlyChart data={months.map((month, index) => ({
    month,
    date: `2026-${String(index + 1).padStart(2, '0')}-01`,
    sessions: month === 'Jan' ? 3 : month === 'Aug' ? 1 : 0,
  }))} />)

  expect(screen.getByRole('button', { name: 'Last 6 months' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByText('session in the last 6 months', { exact: false })).toHaveTextContent('1 session in the last 6 months')

  fireEvent.click(screen.getByRole('button', { name: 'Last 3 months' }))
  expect(screen.getByText('No sessions in the last 3 months.')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Log a mat session' })).toHaveAttribute('href', '/start-training')

  fireEvent.click(screen.getByRole('button', { name: 'Last 12 months' }))
  expect(screen.getByRole('button', { name: 'Last 12 months' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByText('sessions in the last 12 months', { exact: false })).toHaveTextContent('4 sessions in the last 12 months')
  expect(screen.getByRole('link', { name: 'Jan, 3 mat sessions. Open calendar' })).toHaveAttribute('href', '/calendar?date=2026-01-01&view=month')
})
