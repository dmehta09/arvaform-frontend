'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { validateConditionalLogic } from '@/lib/property-forms/property-validations';
import { AlertCircle, Eye, EyeOff, Plus, X, Zap } from 'lucide-react';
import { useCallback, useState } from 'react';
import { PropertySection } from '../element-properties';

interface ConditionalLogicFormProps {
  elementId: string;
  conditionalLogic?: {
    showIf?: string;
    hideIf?: string;
    requiredIf?: string;
  };
  onLogicChange: (logic: { showIf?: string; hideIf?: string; requiredIf?: string }) => void;
}

/**
 * Conditional logic rule types
 */
const CONDITION_TYPES = [
  {
    value: 'showIf',
    label: 'Show If',
    icon: Eye,
    description: 'Show element when condition is true',
  },
  {
    value: 'hideIf',
    label: 'Hide If',
    icon: EyeOff,
    description: 'Hide element when condition is true',
  },
  {
    value: 'requiredIf',
    label: 'Required If',
    icon: AlertCircle,
    description: 'Make element required when condition is true',
  },
] as const;

/**
 * Common condition patterns
 */
const CONDITION_TEMPLATES = [
  {
    name: 'Field equals value',
    template: '${fieldId} === "value"',
    description: 'Show when another field equals a specific value',
  },
  {
    name: 'Field not empty',
    template: '${fieldId} !== ""',
    description: 'Show when another field is not empty',
  },
  {
    name: 'Field is checked',
    template: '${fieldId} === true',
    description: 'Show when a checkbox is checked',
  },
  {
    name: 'Multiple conditions',
    template: '${fieldId1} === "value" && ${fieldId2} !== ""',
    description: 'Show when multiple conditions are met',
  },
];

/**
 * Form component for editing conditional logic
 */
export function ConditionalLogicForm({
  conditionalLogic = {},
  onLogicChange,
}: Omit<ConditionalLogicFormProps, 'elementId'>) {
  const [selectedConditionType, setSelectedConditionType] = useState<
    'showIf' | 'hideIf' | 'requiredIf'
  >('showIf');

  // Mock available form elements (in a real implementation, this would come from the form context)
  const availableElements = ['field1', 'field2', 'field3', 'checkbox1', 'select1'];

  // Validate conditional logic
  const validationResult = validateConditionalLogic(
    conditionalLogic as Record<string, unknown>,
    availableElements,
  );

  const handleConditionChange = useCallback(
    (conditionType: 'showIf' | 'hideIf' | 'requiredIf', value: string) => {
      const updatedLogic = {
        ...conditionalLogic,
        [conditionType]: value || undefined,
      };
      onLogicChange(updatedLogic);
    },
    [conditionalLogic, onLogicChange],
  );

  const handleRemoveCondition = useCallback(
    (conditionType: 'showIf' | 'hideIf' | 'requiredIf') => {
      const updatedLogic = { ...conditionalLogic };
      delete updatedLogic[conditionType];
      onLogicChange(updatedLogic);
    },
    [conditionalLogic, onLogicChange],
  );

  const hasAnyConditions = Object.values(conditionalLogic).some((condition) => condition);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <PropertySection
        title="Conditional Logic"
        description="Control element behavior based on other form fields"
        icon={Zap}>
        <div className="space-y-4">
          {!hasAnyConditions && (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No conditional rules configured</p>
              <p className="text-xs">Add rules below to control element behavior</p>
            </div>
          )}

          {hasAnyConditions && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Active Rules</Label>
              <div className="space-y-2">
                {Object.entries(conditionalLogic).map(([type, condition]) => {
                  if (!condition) return null;
                  const config = CONDITION_TYPES.find((c) => c.value === type);
                  if (!config) return null;

                  const Icon = config.icon;
                  return (
                    <Card key={type}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2 flex-1">
                            <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{config.label}</div>
                              <div className="text-xs text-muted-foreground mb-2">
                                {config.description}
                              </div>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {condition}
                              </code>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemoveCondition(type as 'showIf' | 'hideIf' | 'requiredIf')
                            }
                            className="h-6 w-6 p-0">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </PropertySection>

      {/* Add/Edit Conditions */}
      <PropertySection
        title="Add Conditional Rule"
        description="Create new condition or edit existing ones"
        icon={Plus}>
        <div className="space-y-4">
          {/* Condition Type Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Rule Type</Label>
            <Select
              value={selectedConditionType}
              onValueChange={(value) =>
                setSelectedConditionType(value as 'showIf' | 'hideIf' | 'requiredIf')
              }>
              <SelectTrigger>
                <SelectValue placeholder="Select condition type" />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Condition Expression */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Condition Expression</Label>
            <Textarea
              placeholder="Enter JavaScript expression (e.g., ${field1} === 'value')"
              value={conditionalLogic[selectedConditionType] || ''}
              onChange={(e) => handleConditionChange(selectedConditionType, e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Use ${'{fieldId}'} to reference other form fields. Supports JavaScript expressions.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                const currentExpression = conditionalLogic[selectedConditionType] || '';
                if (currentExpression.trim()) {
                  handleConditionChange(selectedConditionType, currentExpression);
                }
              }}
              disabled={!conditionalLogic[selectedConditionType]?.trim()}>
              Save Rule
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleConditionChange(selectedConditionType, '')}
              disabled={!conditionalLogic[selectedConditionType]}>
              Clear
            </Button>
          </div>
        </div>
      </PropertySection>

      {/* Condition Templates */}
      <PropertySection
        title="Quick Templates"
        description="Common conditional logic patterns"
        defaultOpen={false}>
        <div className="space-y-3">
          {CONDITION_TEMPLATES.map((template, index) => (
            <Card key={index} className="cursor-pointer hover:bg-muted/50">
              <CardContent
                className="p-3"
                onClick={() => {
                  handleConditionChange(selectedConditionType, template.template);
                }}>
                <div className="space-y-2">
                  <div className="text-sm font-medium">{template.name}</div>
                  <div className="text-xs text-muted-foreground">{template.description}</div>
                  <code className="text-xs bg-muted px-2 py-1 rounded block">
                    {template.template}
                  </code>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PropertySection>

      {/* Available Fields Reference */}
      <PropertySection
        title="Available Fields"
        description="Fields you can reference in conditions"
        defaultOpen={false}>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {availableElements.map((fieldId) => (
              <div
                key={fieldId}
                className="p-2 bg-muted rounded text-xs font-mono cursor-pointer hover:bg-muted/80"
                onClick={() => {
                  const currentExpression = conditionalLogic[selectedConditionType] || '';
                  const newExpression = currentExpression + `\${${fieldId}}`;
                  handleConditionChange(selectedConditionType, newExpression);
                }}>
                ${'{' + fieldId + '}'}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Click on a field ID to add it to your condition expression.
          </p>
        </div>
      </PropertySection>

      {/* Expression Testing */}
      <PropertySection
        title="Test Expression"
        description="Test your conditions with sample values"
        defaultOpen={false}>
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Expression testing will be available in a future update. For now, ensure your
              expressions use valid JavaScript syntax.
            </AlertDescription>
          </Alert>

          <div className="p-3 bg-muted rounded">
            <div className="text-xs font-medium mb-2">Tips for writing conditions:</div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Use === for equality comparisons</li>
              <li>• Use && for AND conditions, || for OR conditions</li>
              <li>• Use parentheses to group complex conditions</li>
              <li>• String values should be in quotes: &quot;value&quot;</li>
              <li>• Boolean values: true or false</li>
            </ul>
          </div>
        </div>
      </PropertySection>

      {/* Validation Errors */}
      {!validationResult.isValid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <div className="space-y-1">
              {Object.entries(validationResult.errors).map(([key, errors]) => (
                <div key={key}>
                  <strong>{key}:</strong> {errors.join(', ')}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

ConditionalLogicForm.displayName = 'ConditionalLogicForm';
