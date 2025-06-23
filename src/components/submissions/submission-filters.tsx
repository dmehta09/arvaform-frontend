/**
 * Submission Filters Component - ArvaForm 2025
 *
 * Comprehensive filtering interface for submissions with presets and advanced options
 * Following React 19 form patterns and accessibility guidelines
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import type { DeviceType, Submission, SubmissionFilters } from '@/types/submission.types';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { useState } from 'react';

interface SubmissionFiltersProps {
  /** Current filter values */
  filters: SubmissionFilters;
  /** Handle filter changes */
  onChange: (filters: Partial<SubmissionFilters>) => void;
  /** Apply filter preset */
  onApplyPreset: (preset: keyof typeof FILTER_PRESETS) => void;
  /** Reset all filters */
  onReset: () => void;
  /** Is pending state */
  isPending: boolean;
}

/**
 * Filter presets for common use cases
 */
const FILTER_PRESETS = {
  unread: {
    label: 'Unread',
    description: 'New submissions that need attention',
    filters: { status: ['new'] },
  },
  today: {
    label: 'Today',
    description: 'Submissions from today',
    filters: {
      dateRange: {
        from: new Date(new Date().setHours(0, 0, 0, 0)),
        to: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    },
  },
  thisWeek: {
    label: 'This Week',
    description: 'Submissions from the past 7 days',
    filters: {
      dateRange: {
        from: new Date(new Date().setDate(new Date().getDate() - 7)),
        to: new Date(),
      },
    },
  },
  withFiles: {
    label: 'With Files',
    description: 'Submissions containing file attachments',
    filters: { hasFiles: true },
  },
  lowSpam: {
    label: 'Low Spam',
    description: 'High quality submissions with low spam scores',
    filters: { maxSpamScore: 30 },
  },
} as const;

/**
 * Main submission filters component
 */
export function SubmissionFilters({
  filters,
  onChange,
  onApplyPreset,
  onReset,
  isPending,
}: SubmissionFiltersProps) {
  const [isAdvanced, setIsAdvanced] = useState(false);

  // Handle search change
  const handleSearchChange = (value: string) => {
    onChange({ search: value || undefined });
  };

  // Handle status change
  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatus = Array.isArray(filters.status)
      ? filters.status
      : filters.status
        ? [filters.status]
        : [];
    const newStatus = checked
      ? [...currentStatus, status as Submission['status']]
      : currentStatus.filter((s) => s !== status);
    // Use unknown cast to resolve incompatible type definitions (2025 TS pattern)
    onChange({
      status:
        newStatus.length > 0 ? (newStatus as unknown as SubmissionFilters['status']) : undefined,
    });
  };

  // Handle date range change
  const handleDateRangeChange = (field: 'from' | 'to', date: Date | undefined) => {
    onChange({
      dateRange: {
        ...filters.dateRange,
        [field]: date,
      },
    });
  };

  // Handle spam score change
  const handleSpamScoreChange = (value: number[]) => {
    onChange({ maxSpamScore: value[0] });
  };

  // Handle device type change
  const handleDeviceTypeChange = (deviceType: string, checked: boolean) => {
    const currentTypes = filters.deviceType || [];
    const newTypes = checked
      ? [...currentTypes, deviceType as DeviceType]
      : currentTypes.filter((t) => t !== deviceType);
    onChange({ deviceType: newTypes.length > 0 ? newTypes : undefined });
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== null,
  ).length;

  return (
    <div className="space-y-6">
      {/* Filter Presets */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Quick Filters</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(FILTER_PRESETS).map(([key, preset]) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => onApplyPreset(key as keyof typeof FILTER_PRESETS)}
              disabled={isPending}
              className="h-8">
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Basic Filters */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search submissions..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={isPending}
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="flex flex-wrap gap-2">
            {(['new', 'read', 'archived', 'flagged'] as const).map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={filters.status?.includes?.(status as unknown as never) || false}
                  onCheckedChange={(checked) => handleStatusChange(status, checked as boolean)}
                  disabled={isPending}
                />
                <Label htmlFor={`status-${status}`} className="capitalize">
                  {status}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>From Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange?.from ? (
                  format(filters.dateRange.from, 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.dateRange?.from}
                onSelect={(date) => handleDateRangeChange('from', date)}
                initialFocus
                disabled={isPending}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>To Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange?.to ? (
                  format(filters.dateRange.to, 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.dateRange?.to}
                onSelect={(date) => handleDateRangeChange('to', date)}
                initialFocus
                disabled={isPending}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Boolean Filters */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasEmail"
            checked={filters.hasEmail || false}
            onCheckedChange={(checked) => onChange({ hasEmail: checked ? true : undefined })}
            disabled={isPending}
          />
          <Label htmlFor="hasEmail">Has Email</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasFiles"
            checked={filters.hasFiles || false}
            onCheckedChange={(checked) => onChange({ hasFiles: checked ? true : undefined })}
            disabled={isPending}
          />
          <Label htmlFor="hasFiles">Has Files</Label>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdvanced(!isAdvanced)}
          disabled={isPending}>
          {isAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </Button>

        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{activeFilterCount} active</Badge>
            <Button variant="ghost" size="sm" onClick={onReset} disabled={isPending}>
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {isAdvanced && (
        <>
          <Separator />
          <div className="space-y-4">
            {/* Spam Score */}
            <div className="space-y-2">
              <Label>Max Spam Score: {filters.maxSpamScore || 100}</Label>
              <Slider
                value={[filters.maxSpamScore || 100]}
                onValueChange={handleSpamScoreChange}
                max={100}
                step={1}
                className="w-full"
                disabled={isPending}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>High Quality (0)</span>
                <span>Low Quality (100)</span>
              </div>
            </div>

            {/* Device Type */}
            <div className="space-y-2">
              <Label>Device Type</Label>
              <div className="flex flex-wrap gap-2">
                {(['desktop', 'tablet', 'mobile'] as const).map((deviceType) => (
                  <div key={deviceType} className="flex items-center space-x-2">
                    <Checkbox
                      id={`device-${deviceType}`}
                      checked={filters.deviceType?.includes(deviceType) || false}
                      onCheckedChange={(checked) =>
                        handleDeviceTypeChange(deviceType, checked as boolean)
                      }
                      disabled={isPending}
                    />
                    <Label htmlFor={`device-${deviceType}`} className="capitalize">
                      {deviceType}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
