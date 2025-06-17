/**
 * Mock Form Card Component
 *
 * Displays individual form items in the dashboard with mock data.
 * This component extends the regular FormCard with additional UI elements
 * to showcase the design without needing real API mutations.
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
import type { FormListItemExtended } from '@/lib/mock-data';
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

interface MockFormCardProps {
  form: FormListItemExtended;
  viewMode: 'grid' | 'list';
}

export function MockFormCard({ form, viewMode }: MockFormCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    // Mock delay for demo
    setTimeout(() => {
      console.log('Mock: Form deleted', form.id);
      setShowDeleteDialog(false);
      setIsLoading(false);
    }, 1000);
  };

  const handleDuplicate = async () => {
    setIsLoading(true);
    // Mock delay for demo
    setTimeout(() => {
      console.log('Mock: Form duplicated', form.id);
      setIsLoading(false);
    }, 1000);
  };

  const handleTogglePublish = async () => {
    setIsLoading(true);
    // Mock delay for demo
    setTimeout(() => {
      console.log('Mock: Form publish toggled', form.id);
      setIsLoading(false);
    }, 1000);
  };

  const handleShare = () => {
    // Mock share functionality
    const mockUrl = `${window.location.origin}/forms/${form.id}`;
    navigator.clipboard.writeText(mockUrl);
    console.log('Mock: Form URL copied to clipboard', mockUrl);
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
                  {/* Tags */}
                  {form.tags && form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {form.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {form.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{form.tags.length - 3}
                        </Badge>
                      )}
                    </div>
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

  // Grid view
  return (
    <>
      <Card className="hover:shadow-md transition-shadow group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <Badge className={`${getStatusColor(form.status)} mb-2`}>{form.status}</Badge>
              <Link href={`/form-builder/${form.id}`}>
                <CardTitle className="text-lg hover:text-primary transition-colors line-clamp-2">
                  {form.title}
                </CardTitle>
              </Link>
              {form.description && (
                <CardDescription className="line-clamp-2 mt-1">{form.description}</CardDescription>
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
          {/* Tags */}
          {form.tags && form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {form.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {form.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{form.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{form.submissions}</div>
              <div className="text-xs text-muted-foreground">Submissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{form.views}</div>
              <div className="text-xs text-muted-foreground">Views</div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="text-center mb-4">
            <div className="text-lg font-semibold text-green-600">
              {form.conversionRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Conversion Rate</div>
          </div>

          {/* Last Updated */}
          <div className="text-xs text-muted-foreground text-center mb-4">
            Updated {format(new Date(form.updatedAt), 'MMM d, yyyy')}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/form-builder/${form.id}`}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/forms/${form.id}/analytics`}>
                <BarChart3 className="h-4 w-4 mr-1" />
                Stats
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{form.title}&rdquo;? This action cannot be
              undone and will permanently delete the form and all its submissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground">
              {isLoading ? 'Deleting...' : 'Delete Form'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
