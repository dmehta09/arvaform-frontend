/**
 * Date Picker Components
 *
 * Date picker and date range picker components using React Day Picker
 * with Shadcn UI styling and accessibility features.
 */

'use client';

import { addDays, format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// ============================================================================
// Date Picker Component
// ============================================================================

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
  disabled = false,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus />
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// Date Range Picker Component
// ============================================================================

interface DatePickerWithRangeProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  numberOfMonths?: number;
}

export function DatePickerWithRange({
  value,
  onChange,
  placeholder = 'Pick a date range',
  className,
  disabled = false,
  numberOfMonths = 2,
}: DatePickerWithRangeProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !value && 'text-muted-foreground',
            )}
            disabled={disabled}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, 'LLL dd, y')} - {format(value.to, 'LLL dd, y')}
                </>
              ) : (
                format(value.from, 'LLL dd, y')
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={numberOfMonths}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ============================================================================
// Date Range Picker with Presets
// ============================================================================

interface DatePickerWithPresetsProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  className?: string;
  disabled?: boolean;
}

export function DatePickerWithPresets({
  value,
  onChange,
  className,
  disabled = false,
}: DatePickerWithPresetsProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);

  React.useEffect(() => {
    setDate(value);
  }, [value]);

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    onChange?.(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[300px] justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
              </>
            ) : (
              format(date.from, 'LLL dd, y')
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Preset Options */}
          <div className="border-r p-3">
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start font-normal"
                onClick={() =>
                  handleDateChange({
                    from: new Date(),
                    to: new Date(),
                  })
                }>
                Today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start font-normal"
                onClick={() =>
                  handleDateChange({
                    from: addDays(new Date(), -1),
                    to: new Date(),
                  })
                }>
                Yesterday
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start font-normal"
                onClick={() =>
                  handleDateChange({
                    from: addDays(new Date(), -7),
                    to: new Date(),
                  })
                }>
                Last 7 days
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start font-normal"
                onClick={() =>
                  handleDateChange({
                    from: addDays(new Date(), -30),
                    to: new Date(),
                  })
                }>
                Last 30 days
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start font-normal"
                onClick={() =>
                  handleDateChange({
                    from: addDays(new Date(), -90),
                    to: new Date(),
                  })
                }>
                Last 3 months
              </Button>
            </div>
          </div>

          {/* Calendar */}
          <div className="p-3">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateChange}
              numberOfMonths={2}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DatePickerWithRange;
