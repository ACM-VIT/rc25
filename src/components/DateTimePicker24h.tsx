'use client'

import { DatePicker } from "@nextui-org/react"
import { parseDateTime, CalendarDateTime, type DateValue } from "@internationalized/date"

interface DateTimePicker24hProps {
  date: Date
  onDateChange: (date: Date) => void
  label?: string
}

const DateTimePicker24h = ({ date, onDateChange, label }: DateTimePicker24hProps) => {
  const toDateValue = (date: Date): DateValue => {
    return parseDateTime(
      date.toISOString().slice(0, 19) // Format: YYYY-MM-DDTHH:mm:ss
    )
  }

  // Convert DateValue back to JavaScript Date
  const fromDateValue = (value: DateValue): Date => {
    if (value instanceof CalendarDateTime) {
      return new Date(value.toString())
    }
    return new Date(value.toString())
  }

  return (
    <DatePicker
      value={toDateValue(date)}
      onChange={(value) => value && onDateChange(fromDateValue(value))}
      hideTimeZone
      showMonthAndYearPickers
      className="w-full font-sans text-base"
      variant="bordered"
      aria-label={label || "Date and time picker"}
      size="md"
    />
  )
}

export default DateTimePicker24h