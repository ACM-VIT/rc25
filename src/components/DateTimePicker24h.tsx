'use client'

import { DatePicker } from "@nextui-org/react"
import { parseDateTime } from "@internationalized/date"
import type { ComponentProps } from "react"

interface DateTimePicker24hProps {
  date: Date
  onDateChange: (date: Date) => void
  label?: string
}

type PickerValue = NonNullable<ComponentProps<typeof DatePicker>["value"]>

const DateTimePicker24h = ({ date, onDateChange, label }: DateTimePicker24hProps) => {
  const toDateValue = (date: Date): PickerValue =>
    parseDateTime(date.toISOString().slice(0, 19)) as unknown as PickerValue

  // Convert DateValue back to JavaScript Date
  const fromDateValue = (value: PickerValue): Date => {
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
