'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { ElementProperties } from '@/types/element-properties.types';
import { AlignLeft, Info, Type } from 'lucide-react';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { PropertySection } from '../element-properties';

interface GeneralPropertiesFormProps {
  elementId: string;
  elementType: string;
  properties: ElementProperties;
  onPropertyChange: (elementId: string, property: keyof ElementProperties, value: unknown) => void;
}

/**
 * Form component for editing general element properties
 */
export function GeneralPropertiesForm({
  elementId,
  elementType,
  properties,
  onPropertyChange,
}: GeneralPropertiesFormProps) {
  const form = useFormContext();

  const handleFieldChange = useCallback(
    (field: keyof ElementProperties, value: unknown) => {
      form.setValue(field, value, { shouldDirty: true, shouldValidate: true });
      onPropertyChange(elementId, field, value);
    },
    [form, elementId, onPropertyChange],
  );

  const getFieldError = (field: string) => {
    const error = form.formState.errors[field];
    return error?.message?.toString();
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <PropertySection title="Basic Information" description="Core element properties" icon={Info}>
        <div className="space-y-4">
          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label" className="text-sm font-medium">
              Label <span className="text-destructive">*</span>
            </Label>
            <Input
              id="label"
              placeholder="Enter element label"
              value={properties.label || ''}
              onChange={(e) => handleFieldChange('label', e.target.value)}
              className={getFieldError('label') ? 'border-destructive' : ''}
            />
            {getFieldError('label') && (
              <p className="text-sm text-destructive">{getFieldError('label')}</p>
            )}
          </div>

          {/* Placeholder */}
          <div className="space-y-2">
            <Label htmlFor="placeholder" className="text-sm font-medium">
              Placeholder
            </Label>
            <Input
              id="placeholder"
              placeholder="Enter placeholder text"
              value={properties.placeholder || ''}
              onChange={(e) => handleFieldChange('placeholder', e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Optional help text for this field"
              value={properties.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </PropertySection>

      {/* Element Settings */}
      <PropertySection
        title="Element Settings"
        description="Behavior and state options"
        icon={Type}>
        <div className="space-y-4">
          {/* Required */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Required</Label>
              <p className="text-xs text-muted-foreground">Make this field mandatory</p>
            </div>
            <Switch
              checked={properties.required || false}
              onCheckedChange={(checked) => handleFieldChange('required', checked)}
            />
          </div>

          {/* Disabled */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Disabled</Label>
              <p className="text-xs text-muted-foreground">Prevent user interaction</p>
            </div>
            <Switch
              checked={properties.disabled || false}
              onCheckedChange={(checked) => handleFieldChange('disabled', checked)}
            />
          </div>
        </div>
      </PropertySection>

      {/* Element-specific properties */}
      {renderElementSpecificProperties(elementType, properties, handleFieldChange)}

      {/* Advanced */}
      <PropertySection
        title="Advanced"
        description="Custom attributes and CSS"
        icon={AlignLeft}
        defaultOpen={false}>
        <div className="space-y-4">
          {/* Custom CSS Class */}
          <div className="space-y-2">
            <Label htmlFor="className" className="text-sm font-medium">
              CSS Class
            </Label>
            <Input
              id="className"
              placeholder="custom-class another-class"
              value={properties.className || ''}
              onChange={(e) => handleFieldChange('className', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Add custom CSS classes (space-separated)
            </p>
          </div>

          {/* Element ID */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Element ID</Label>
            <Input value={properties.id} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Unique identifier (read-only)</p>
          </div>
        </div>
      </PropertySection>
    </div>
  );
}

/**
 * Render element-specific properties based on element type
 */
function renderElementSpecificProperties(
  elementType: string,
  properties: ElementProperties,
  onChange: (field: keyof ElementProperties, value: unknown) => void,
) {
  switch (elementType) {
    case 'text-input':
    case 'email-input':
      return (
        <PropertySection
          title="Text Input Settings"
          description="Text input specific options"
          icon={Type}>
          <div className="space-y-4">
            {/* Input Type for text inputs */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Input Type</Label>
              <Select
                value={(properties.customAttributes?.inputType as string) || 'text'}
                onValueChange={(value) =>
                  onChange('customAttributes', {
                    ...properties.customAttributes,
                    inputType: value,
                  })
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="password">Password</SelectItem>
                  <SelectItem value="search">Search</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="tel">Telephone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PropertySection>
      );

    case 'number-input':
      return (
        <PropertySection
          title="Number Input Settings"
          description="Numeric input options"
          icon={Type}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Min Value */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Min Value</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={(properties.customAttributes?.min as number) || ''}
                  onChange={(e) =>
                    onChange('customAttributes', {
                      ...properties.customAttributes,
                      min: parseFloat(e.target.value) || undefined,
                    })
                  }
                />
              </div>

              {/* Max Value */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Max Value</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={(properties.customAttributes?.max as number) || ''}
                  onChange={(e) =>
                    onChange('customAttributes', {
                      ...properties.customAttributes,
                      max: parseFloat(e.target.value) || undefined,
                    })
                  }
                />
              </div>
            </div>

            {/* Step */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Step</Label>
              <Input
                type="number"
                placeholder="1"
                value={(properties.customAttributes?.step as number) || ''}
                onChange={(e) =>
                  onChange('customAttributes', {
                    ...properties.customAttributes,
                    step: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">Increment/decrement step value</p>
            </div>
          </div>
        </PropertySection>
      );

    case 'textarea':
      return (
        <PropertySection
          title="Textarea Settings"
          description="Multi-line text options"
          icon={AlignLeft}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Rows */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Rows</Label>
                <Input
                  type="number"
                  placeholder="3"
                  min="1"
                  max="20"
                  value={(properties.customAttributes?.rows as number) || 3}
                  onChange={(e) =>
                    onChange('customAttributes', {
                      ...properties.customAttributes,
                      rows: parseInt(e.target.value) || 3,
                    })
                  }
                />
              </div>

              {/* Cols */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Columns</Label>
                <Input
                  type="number"
                  placeholder="50"
                  min="10"
                  value={(properties.customAttributes?.cols as number) || ''}
                  onChange={(e) =>
                    onChange('customAttributes', {
                      ...properties.customAttributes,
                      cols: parseInt(e.target.value) || undefined,
                    })
                  }
                />
              </div>
            </div>

            {/* Resize */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Resize</Label>
              <Select
                value={(properties.customAttributes?.resize as string) || 'vertical'}
                onValueChange={(value) =>
                  onChange('customAttributes', {
                    ...properties.customAttributes,
                    resize: value,
                  })
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                  <SelectItem value="vertical">Vertical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PropertySection>
      );

    case 'select':
    case 'radio-group':
    case 'checkbox':
      return (
        <PropertySection
          title="Options Settings"
          description="Configure available choices"
          icon={Type}>
          <div className="space-y-4">
            {/* Multiple Selection (for select) */}
            {elementType === 'select' && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Multiple Selection</Label>
                  <p className="text-xs text-muted-foreground">Allow selecting multiple options</p>
                </div>
                <Switch
                  checked={(properties.customAttributes?.multiple as boolean) || false}
                  onCheckedChange={(checked) =>
                    onChange('customAttributes', {
                      ...properties.customAttributes,
                      multiple: checked,
                    })
                  }
                />
              </div>
            )}

            {/* Options configuration would go here */}
            <div className="p-3 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
              Options configuration will be handled in the validation tab
            </div>
          </div>
        </PropertySection>
      );

    default:
      return null;
  }
}

GeneralPropertiesForm.displayName = 'GeneralPropertiesForm';
