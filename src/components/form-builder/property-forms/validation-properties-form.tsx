'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { validateValidationRules } from '@/lib/property-forms/property-validations';
import type { ValidationRule, ValidationRuleType } from '@/types/form-builder.types';
import { AlertTriangle, CheckCircle, Plus, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { PropertySection } from '../element-properties';

interface ValidationPropertiesFormProps {
  elementId: string;
  elementType: string;
  validationRules: ValidationRule[];
  onRulesChange: (rules: ValidationRule[]) => void;
}

/**
 * Validation rule type configurations
 */
const VALIDATION_RULE_CONFIGS: Record<
  ValidationRuleType,
  {
    label: string;
    description: string;
    hasValue: boolean;
    valueType: 'text' | 'number' | 'textarea';
    placeholder?: string;
    applicableElements: string[];
  }
> = {
  required: {
    label: 'Required',
    description: 'Field must be filled out',
    hasValue: false,
    valueType: 'text',
    applicableElements: ['*'],
  },
  minLength: {
    label: 'Minimum Length',
    description: 'Minimum number of characters',
    hasValue: true,
    valueType: 'number',
    placeholder: '3',
    applicableElements: ['text-input', 'textarea', 'email-input'],
  },
  maxLength: {
    label: 'Maximum Length',
    description: 'Maximum number of characters',
    hasValue: true,
    valueType: 'number',
    placeholder: '255',
    applicableElements: ['text-input', 'textarea', 'email-input'],
  },
  pattern: {
    label: 'Pattern (Regex)',
    description: 'Regular expression pattern to match',
    hasValue: true,
    valueType: 'text',
    placeholder: '^[A-Za-z]+$',
    applicableElements: ['text-input', 'email-input'],
  },
  email: {
    label: 'Email Format',
    description: 'Must be a valid email address',
    hasValue: false,
    valueType: 'text',
    applicableElements: ['email-input'],
  },
  url: {
    label: 'URL Format',
    description: 'Must be a valid URL',
    hasValue: false,
    valueType: 'text',
    applicableElements: ['text-input'],
  },
  number: {
    label: 'Number Format',
    description: 'Must be a valid number',
    hasValue: false,
    valueType: 'text',
    applicableElements: ['number-input', 'text-input'],
  },
  min: {
    label: 'Minimum Value',
    description: 'Minimum numeric value',
    hasValue: true,
    valueType: 'number',
    placeholder: '0',
    applicableElements: ['number-input'],
  },
  max: {
    label: 'Maximum Value',
    description: 'Maximum numeric value',
    hasValue: true,
    valueType: 'number',
    placeholder: '100',
    applicableElements: ['number-input'],
  },
  custom: {
    label: 'Custom Function',
    description: 'Custom JavaScript validation function',
    hasValue: true,
    valueType: 'textarea',
    placeholder: 'function(value) { return value.length > 0; }',
    applicableElements: ['*'],
  },
};

/**
 * Form component for editing validation rules
 */
export function ValidationPropertiesForm({
  elementId: _elementId,
  elementType,
  validationRules,
  onRulesChange,
}: ValidationPropertiesFormProps) {
  const [selectedRuleType, setSelectedRuleType] = useState<ValidationRuleType>('required');

  // Get applicable validation rules for current element type
  const applicableRules = Object.entries(VALIDATION_RULE_CONFIGS).filter(
    ([, config]) =>
      config.applicableElements.includes('*') || config.applicableElements.includes(elementType),
  );

  // Validate current rules
  const validationResult = validateValidationRules(elementType, validationRules);

  const handleAddRule = useCallback(() => {
    const config = VALIDATION_RULE_CONFIGS[selectedRuleType];
    if (!config) return;

    // Check if rule already exists
    const existingRule = validationRules.find((rule) => rule.type === selectedRuleType);
    if (existingRule) {
      // Update existing rule
      const updatedRules = validationRules.map((rule) =>
        rule.type === selectedRuleType ? { ...rule, enabled: true } : rule,
      );
      onRulesChange(updatedRules);
      return;
    }

    // Create new rule
    const newRule: ValidationRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: selectedRuleType,
      value: config.hasValue ? (config.valueType === 'number' ? 0 : '') : undefined,
      message: `${config.label} validation failed`,
      enabled: true,
    };

    onRulesChange([...validationRules, newRule]);
  }, [selectedRuleType, validationRules, onRulesChange]);

  const handleRemoveRule = useCallback(
    (ruleId: string) => {
      onRulesChange(validationRules.filter((rule) => rule.id !== ruleId));
    },
    [validationRules, onRulesChange],
  );

  const handleUpdateRule = useCallback(
    (ruleId: string, updates: Partial<ValidationRule>) => {
      const updatedRules = validationRules.map((rule) =>
        rule.id === ruleId ? { ...rule, ...updates } : rule,
      );
      onRulesChange(updatedRules);
    },
    [validationRules, onRulesChange],
  );

  const getUsedRuleTypes = () => {
    return new Set(validationRules.map((rule) => rule.type));
  };

  return (
    <div className="space-y-6">
      {/* Add New Rule */}
      <PropertySection
        title="Add Validation Rule"
        description="Configure how this field should be validated"
        icon={Plus}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                value={selectedRuleType}
                onValueChange={(value) => setSelectedRuleType(value as ValidationRuleType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select validation rule" />
                </SelectTrigger>
                <SelectContent>
                  {applicableRules.map(([type, config]) => (
                    <SelectItem
                      key={type}
                      value={type}
                      disabled={getUsedRuleTypes().has(type as ValidationRuleType)}>
                      <div className="flex items-center justify-between w-full">
                        <span>{config.label}</span>
                        {getUsedRuleTypes().has(type as ValidationRuleType) && (
                          <Badge variant="secondary" className="ml-2">
                            Added
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddRule} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {VALIDATION_RULE_CONFIGS[selectedRuleType] && (
            <p className="text-xs text-muted-foreground">
              {VALIDATION_RULE_CONFIGS[selectedRuleType].description}
            </p>
          )}
        </div>
      </PropertySection>

      {/* Validation Summary */}
      {!validationResult.isValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <div className="space-y-1">
              {Object.entries(validationResult.errors).map(([key, errors]) => (
                <div key={key}>
                  {errors.map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {validationResult.warnings && Object.keys(validationResult.warnings).length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <div className="space-y-1">
              {Object.entries(validationResult.warnings).map(([key, warnings]) => (
                <div key={key}>
                  {warnings.map((warning, index) => (
                    <div key={index}>⚠ {warning}</div>
                  ))}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Rules */}
      <PropertySection
        title={`Validation Rules (${validationRules.length})`}
        description="Currently configured validation rules"
        icon={CheckCircle}>
        {validationRules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No validation rules configured</p>
            <p className="text-xs">Add rules above to validate user input</p>
          </div>
        ) : (
          <div className="space-y-3">
            {validationRules.map((rule) => (
              <ValidationRuleCard
                key={rule.id}
                rule={rule}
                config={VALIDATION_RULE_CONFIGS[rule.type]}
                onUpdate={(updates) => handleUpdateRule(rule.id, updates)}
                onRemove={() => handleRemoveRule(rule.id)}
              />
            ))}
          </div>
        )}
      </PropertySection>

      {/* Quick Templates */}
      <PropertySection
        title="Quick Templates"
        description="Common validation patterns"
        defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const templates: Omit<ValidationRule, 'id'>[] = [
                { type: 'required', enabled: true, message: 'This field is required' },
              ];
              const newRules = [...validationRules];
              templates.forEach((template) => {
                if (!newRules.find((r) => r.type === template.type)) {
                  newRules.push({
                    ...template,
                    id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  });
                }
              });
              onRulesChange(newRules);
            }}>
            Required Only
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const templates: Omit<ValidationRule, 'id'>[] = [
                { type: 'required', enabled: true, message: 'This field is required' },
                { type: 'minLength', value: 3, enabled: true, message: 'Minimum 3 characters' },
                { type: 'maxLength', value: 50, enabled: true, message: 'Maximum 50 characters' },
              ];
              const newRules = [...validationRules];
              templates.forEach((template) => {
                if (!newRules.find((r) => r.type === template.type)) {
                  newRules.push({
                    ...template,
                    id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  });
                }
              });
              onRulesChange(newRules);
            }}>
            Text Length
          </Button>
        </div>
      </PropertySection>
    </div>
  );
}

/**
 * Individual validation rule card component
 */
interface ValidationRuleCardProps {
  rule: ValidationRule;
  config: (typeof VALIDATION_RULE_CONFIGS)[ValidationRuleType];
  onUpdate: (updates: Partial<ValidationRule>) => void;
  onRemove: () => void;
}

function ValidationRuleCard({ rule, config, onUpdate, onRemove }: ValidationRuleCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {config.label}
            <Switch checked={rule.enabled} onCheckedChange={(enabled) => onUpdate({ enabled })} />
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove} className="h-6 w-6 p-0">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Rule Value */}
        {config.hasValue && (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Value</Label>
            {config.valueType === 'textarea' ? (
              <Textarea
                value={(rule.value as string) || ''}
                onChange={(e) => onUpdate({ value: e.target.value })}
                placeholder={config.placeholder}
                rows={3}
                className="text-xs"
              />
            ) : (
              <Input
                type={config.valueType}
                value={rule.value?.toString() || ''}
                onChange={(e) => {
                  const value =
                    config.valueType === 'number'
                      ? parseFloat(e.target.value) || 0
                      : e.target.value;
                  onUpdate({ value });
                }}
                placeholder={config.placeholder}
                className="text-xs"
              />
            )}
          </div>
        )}

        {/* Error Message */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Error Message</Label>
          <Input
            value={rule.message || ''}
            onChange={(e) => onUpdate({ message: e.target.value })}
            placeholder="Custom error message"
            className="text-xs"
          />
        </div>

        {/* Rule Description */}
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </CardContent>
    </Card>
  );
}

ValidationPropertiesForm.displayName = 'ValidationPropertiesForm';
