/**
 * Submission Table Component - ArvaForm 2025
 *
 * Advanced data table using TanStack Table v8 with sorting, selection, and pagination
 * Following React 19 and accessibility best practices
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Submission, SubmissionSorting } from '@/types/submission.types';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  ArrowUpDown,
  Calendar,
  Download,
  Eye,
  FileText,
  Mail,
  MoreHorizontal,
  Smartphone,
  User,
} from 'lucide-react';
import { useMemo } from 'react';

interface SubmissionTableProps {
  /** Submissions data */
  submissions: Submission[];
  /** Loading state */
  isLoading: boolean;
  /** Pagination info */
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  /** Current sorting */
  sorting: SubmissionSorting;
  /** Selected submission IDs */
  selectedIds: string[];
  /** Handle submission view */
  onViewSubmission: (submission: Submission) => void;
  /** Handle selection toggle */
  onToggleSelection: (submissionId: string) => void;
  /** Handle sorting change */
  onSortingChange: (sorting: SubmissionSorting) => void;
  /** Handle pagination change */
  onPaginationChange: (page: number, pageSize?: number) => void;
}

/**
 * Format submission status with appropriate styling
 */
function SubmissionStatusBadge({ status }: { status: Submission['status'] }) {
  const variants = {
    new: 'default',
    read: 'secondary',
    archived: 'outline',
    flagged: 'destructive',
  } as const;

  const labels = {
    new: 'New',
    read: 'Read',
    archived: 'Archived',
    flagged: 'Flagged',
  } as const;

  return (
    <Badge variant={variants[status]} className="capitalize">
      {labels[status]}
    </Badge>
  );
}

/**
 * Format device type with icon
 */
function DeviceTypeDisplay({ deviceType }: { deviceType: string }) {
  const icon =
    deviceType === 'mobile' ? Smartphone : deviceType === 'tablet' ? Smartphone : FileText;
  const Icon = icon;

  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3 w-3 text-muted-foreground" />
      <span className="capitalize text-sm">{deviceType}</span>
    </div>
  );
}

/**
 * Main submission table component
 */
export function SubmissionTable({
  submissions,
  isLoading,
  pagination,
  sorting,
  selectedIds,
  onViewSubmission,
  onToggleSelection,
  onSortingChange,
  onPaginationChange,
}: SubmissionTableProps) {
  // Convert sorting to TanStack format
  const tableSorting: SortingState = [
    {
      id: sorting.field,
      desc: sorting.direction === 'desc',
    },
  ];

  // Convert pagination to TanStack format
  const tablePagination: PaginationState = {
    pageIndex: pagination.page - 1,
    pageSize: pagination.limit,
  };

  // Define table columns
  const columns = useMemo<ColumnDef<Submission>[]>(
    () => [
      // Selection column
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => {
              if (value) {
                submissions.forEach((submission) => {
                  if (!selectedIds.includes(submission.id)) {
                    onToggleSelection(submission.id);
                  }
                });
              } else {
                selectedIds.forEach((id) => {
                  if (submissions.find((s) => s.id === id)) {
                    onToggleSelection(id);
                  }
                });
              }
            }}
            aria-label="Select all submissions"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedIds.includes(row.original.id)}
            onCheckedChange={() => onToggleSelection(row.original.id)}
            aria-label={`Select submission ${row.original.id}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      // Status column
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() =>
              onSortingChange({
                field: 'status',
                direction: column.getIsSorted() === 'asc' ? 'desc' : 'asc',
              })
            }
            className="h-8 px-2">
            Status
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => <SubmissionStatusBadge status={row.original.status} />,
      },
      // Submitter column
      {
        id: 'submitter',
        header: 'Submitter',
        cell: ({ row }) => {
          const { submitterInfo } = row.original;
          return (
            <div className="flex items-center gap-2">
              {submitterInfo.isAnonymous ? (
                <User className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Mail className="h-4 w-4 text-muted-foreground" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{submitterInfo.name || 'Anonymous'}</p>
                {submitterInfo.email && (
                  <p className="text-xs text-muted-foreground truncate">{submitterInfo.email}</p>
                )}
              </div>
            </div>
          );
        },
      },
      // Device column
      {
        accessorKey: 'metadata.deviceType',
        header: 'Device',
        cell: ({ row }) => <DeviceTypeDisplay deviceType={row.original.metadata.deviceType} />,
      },
      // Submitted date column
      {
        accessorKey: 'submittedAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() =>
              onSortingChange({
                field: 'submittedAt',
                direction: column.getIsSorted() === 'asc' ? 'desc' : 'asc',
              })
            }
            className="h-8 px-2">
            <Calendar className="mr-2 h-3 w-3" />
            Submitted
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = new Date(row.original.submittedAt);
          return (
            <div className="text-sm">
              <div>{format(date, 'MMM d, yyyy')}</div>
              <div className="text-xs text-muted-foreground">{format(date, 'h:mm a')}</div>
            </div>
          );
        },
      },
      // Files column
      {
        id: 'files',
        header: 'Files',
        cell: ({ row }) => {
          const hasFiles = row.original.files && row.original.files.length > 0;
          return hasFiles ? (
            <div className="flex items-center gap-1 text-sm">
              <FileText className="h-3 w-3" />
              {row.original.files!.length}
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      // Actions column
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewSubmission(row.original)}
              className="h-8 w-8 p-0">
              <Eye className="h-3 w-3" />
              <span className="sr-only">View submission</span>
            </Button>
            {row.original.files && row.original.files.length > 0 && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Download className="h-3 w-3" />
                <span className="sr-only">Download files</span>
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-3 w-3" />
              <span className="sr-only">More actions</span>
            </Button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [submissions, selectedIds, onToggleSelection, onSortingChange, onViewSubmission],
  );

  // Initialize table
  const table = useReactTable({
    data: submissions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    state: {
      sorting: tableSorting,
      pagination: tablePagination,
    },
    pageCount: pagination.totalPages,
  });

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-12">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: pagination.limit }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className="h-8 bg-muted animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={selectedIds.includes(row.original.id) ? 'selected' : undefined}
                  className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No submissions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {pagination.total > 0
            ? `Showing ${(pagination.page - 1) * pagination.limit + 1} to ${Math.min(
                pagination.page * pagination.limit,
                pagination.total,
              )} of ${pagination.total} submissions`
            : 'No submissions'}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPaginationChange(pagination.page - 1)}
            disabled={!pagination.hasPrev || isLoading}>
            Previous
          </Button>
          <span className="text-sm font-medium">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPaginationChange(pagination.page + 1)}
            disabled={!pagination.hasNext || isLoading}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
