/**
 * Submission View Modal - ArvaForm 2025
 *
 * Detailed submission viewing modal with file downloads and metadata display
 * Following React 19 patterns and WCAG 2.1 AA accessibility guidelines
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Submission } from '@/types/submission.types';
import { format } from 'date-fns';
import { Calendar, Download, FileText, Globe, Mail, Monitor, Smartphone, User } from 'lucide-react';

interface SubmissionViewModalProps {
  /** Submission to display */
  submission: Submission;
  /** Is modal open */
  isOpen: boolean;
  /** Handle modal close */
  onClose: () => void;
}

/**
 * Format device type with appropriate icon
 */
function DeviceIcon({ deviceType }: { deviceType: string }) {
  switch (deviceType) {
    case 'mobile':
      return <Smartphone className="h-4 w-4" />;
    case 'tablet':
      return <Smartphone className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
}

/**
 * Render submission data fields
 */
function SubmissionData({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-3">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="grid grid-cols-3 gap-3">
          <div className="font-medium text-sm capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </div>
          <div className="col-span-2 text-sm">
            {typeof value === 'string' || typeof value === 'number'
              ? String(value)
              : Array.isArray(value)
                ? value.join(', ')
                : JSON.stringify(value)}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Main submission view modal component
 */
export function SubmissionViewModal({ submission, isOpen, onClose }: SubmissionViewModalProps) {
  const submissionDate = new Date(submission.submittedAt);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Submission Details</span>
            <Badge variant={submission.status === 'new' ? 'default' : 'secondary'}>
              {submission.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Submitted {format(submissionDate, 'PPP')} at {format(submissionDate, 'p')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Submitter Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                Submitter Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">
                    {submission.submitterInfo.name || 'Anonymous'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {submission.submitterInfo.email || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Form Data */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Form Data
              </h3>
              <SubmissionData data={submission.data} />
            </div>

            {/* Files */}
            {submission.files && submission.files.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Attached Files
                  </h3>
                  <div className="space-y-2">
                    {submission.files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4" />
                          <div>
                            <p className="text-sm font-medium">{file.originalName}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Metadata */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Metadata
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <DeviceIcon deviceType={submission.metadata.deviceType} />
                    Device
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {submission.metadata.deviceType}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Completion Time
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {submission.metadata.completionTime} seconds
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">IP Address</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {submission.metadata.ipAddress}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">User Agent</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {submission.metadata.userAgent}
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            {submission.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3">Admin Notes</h3>
                  <p className="text-sm text-muted-foreground">{submission.notes}</p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="default">
            <Mail className="h-4 w-4 mr-2" />
            Contact Submitter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
