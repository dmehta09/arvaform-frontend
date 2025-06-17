/**
 * Form Creation Modal Component
 *
 * Provides a modal interface for creating new forms with validation,
 * template selection, and form configuration options.
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateForm } from '@/hooks/use-forms';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Form validation schema
const createFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Form title is required')
    .max(100, 'Form title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

type CreateFormData = z.infer<typeof createFormSchema>;

interface FormCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FormCreationModal({ open, onOpenChange }: FormCreationModalProps) {
  const router = useRouter();
  const createFormMutation = useCreateForm();

  const form = useForm<CreateFormData>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const isLoading = createFormMutation.isPending;

  const onSubmit = async (data: CreateFormData) => {
    try {
      const newForm = await createFormMutation.mutateAsync(data);

      // Reset form and close modal
      form.reset();
      onOpenChange(false);

      // Navigate to form builder
      router.push(`/form-builder/${newForm.id}`);
    } catch (error) {
      console.error('Failed to create form:', error);
      // Error handling is managed by the mutation
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        form.reset();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create New Form
          </DialogTitle>
          <DialogDescription>
            Give your form a name and description to get started. You can always change these later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Form Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Contact Form, Survey, Registration..."
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>Give your form a clear, descriptive title</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this form is for..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description to help you remember what this form is for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Form
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
