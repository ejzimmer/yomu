import './ReviewForecast.css'
import { useLiveQuery } from 'dexie-react-hooks'
import { BrushStroke } from '../components/BrushStroke'
import type { ForecastDay } from '../review/buildReviewForecast'
import { loadReviewForecast } from '../review/loadReviewForecast'

export function ReviewForecast() {
  const forecast = useLiveQuery(loadReviewForecast)
  if (!forecast) return null

  const busiestDayCount = Math.max(1, ...forecast.days.map((day) => day.count))

  return (
    <section className="review-forecast" aria-label="Review forecast">
      <div className="next-day">
        <span className="count">+{forecast.nextDayCount}</span>
        <span className="label">next 24 hours</span>
      </div>
      <ol className="days">
        {forecast.days.map((day) => (
          <li key={day.date.toString()}>
            <ForecastDayRow day={day} share={day.count / busiestDayCount} />
          </li>
        ))}
      </ol>
    </section>
  )
}

interface ForecastDayRowProps {
  day: ForecastDay
  share: number
}

function ForecastDayRow({ day, share }: ForecastDayRowProps) {
  const summary = (
    <>
      <span className="weekday">{day.date.toLocaleString(undefined, { weekday: 'short' })}</span>
      <span className="bar" style={{ width: `${share * 100}%` }}>
        {day.count > 0 && <BrushStroke />}
      </span>
      <span className="added">+{day.count}</span>
      <span className="total">{day.total}</span>
    </>
  )

  if (day.hours.length === 0) return <div className="day">{summary}</div>

  return (
    <details>
      <summary className="day">{summary}</summary>
      <ol className="hours">
        {day.hours.map((hour) => (
          <li key={hour.start.toString()}>
            <span className="time">{hour.start.toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>
            <span className="added">+{hour.count}</span>
          </li>
        ))}
      </ol>
    </details>
  )
}
