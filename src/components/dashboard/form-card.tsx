/**
 * Form Card Component
 *
 * Displays individual form items in the dashboard with preview thumbnails,
 * status indicators, analytics, and action menus.
 * Supports both grid and list view modes.
 */

'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteForm, useDuplicateForm, useToggleFormPublish } from '@/hooks/use-forms';
import type { FormListItem } from '@/types/form.types';
import { format } from 'date-fns';
import {
  BarChart3,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  MoreHorizontal,
  Share2,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface FormCardProps {
  form: FormListItem;
  viewMode: 'grid' | 'list';
}

export function FormCard({ form, viewMode }: FormCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteFormMutation = useDeleteForm();
  const duplicateFormMutation = useDuplicateForm();
  const togglePublishMutation = useToggleFormPublish();

  const isLoading =
    deleteFormMutation.isPending ||
    duplicateFormMutation.isPending ||
    togglePublishMutation.isPending;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'archived':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFormMutation.mutateAsync(form.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete form:', error);
    }
  };

  const handleDuplicate = async () => {
    try {
      await duplicateFormMutation.mutateAsync({
        formId: form.id,
        data: { title: `${form.title} (Copy)` },
      });
    } catch (error) {
      console.error('Failed to duplicate form:', error);
    }
  };

  const handleTogglePublish = async () => {
    try {
      await togglePublishMutation.mutateAsync({
        formId: form.id,
        publish: !form.isPublished,
      });
    } catch (error) {
      console.error('Failed to toggle form publish status:', error);
    }
  };

  const handleShare = () => {
    // In a real app, this would copy the form's public URL to clipboard
    navigator.clipboard.writeText(`${window.location.origin}/forms/${form.id}`);
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <Link href={`/form-builder/${form.id}`}>
                    <h3 className="font-semibold text-lg hover:text-primary transition-colors truncate">
                      {form.title}
                    </h3>
                  </Link>
                  {form.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {form.description}
                    </p>
                  )}
                </div>
                <Badge className={getStatusColor(form.status)}>{form.status}</Badge>
              </div>

              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {form.submissions} submissions
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {form.views} views
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  {form.conversionRate.toFixed(1)}% conversion
                </div>
                <div>Updated {format(new Date(form.updatedAt), 'MMM d, yyyy')}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Button asChild variant="outline" size="sm">
                <Link href={`/forms/${form.id}/analytics`}>
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Analytics
                </Link>
              </Button>

              <Button asChild variant="outline" size="sm">
                <Link href={`/form-builder/${form.id}`}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={isLoading}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleTogglePublish}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {form.isPublished ? 'Unpublish' : 'Publish'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getStatusColor(form.status)}>{form.status}</Badge>
                {form.isPublished && (
                  <Badge variant="outline" className="text-xs">
                    Published
                  </Badge>
                )}
              </div>

              <Link href={`/form-builder/${form.id}`}>
                <CardTitle className="hover:text-primary transition-colors cursor-pointer line-clamp-2">
                  {form.title}
                </CardTitle>
              </Link>

              {form.description && (
                <CardDescription className="mt-2 line-clamp-2">{form.description}</CardDescription>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isLoading}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/form-builder/${form.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleTogglePublish}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {form.isPublished ? 'Unpublish' : 'Publish'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Form Preview Thumbnail */}
          <Link href={`/form-builder/${form.id}`}>
            <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center hover:bg-muted/80 transition-colors cursor-pointer">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </Link>

          {/* Analytics */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <div className="font-medium">{form.submissions}</div>
              <div className="text-muted-foreground text-xs">Submissions</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{form.views}</div>
              <div className="text-muted-foreground text-xs">Views</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{form.conversionRate.toFixed(1)}%</div>
              <div className="text-muted-foreground text-xs">Conversion</div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-4 text-xs text-muted-foreground text-center">
            Updated {format(new Date(form.updatedAt), 'MMM d, yyyy')}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{form.title}&quot;? This action cannot be
              undone. All form data and submissions will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteFormMutation.isPending}>
              {deleteFormMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
