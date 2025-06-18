/**
 * Element Properties Form Component - 2025 Edition
 * Form component for general element configuration
 * with modern controls and real-time validation
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useElementProperties } from '@/hooks/use-element-properties';
import { cn } from '@/lib/utils';
import type { ElementProperties, PropertyPanelTab } from '@/types/element-properties.types';
import { FormElement } from '@/types/form-builder.types';
import { CheckSquare, Copy, Palette, RotateCcw, Settings, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormProvider } from 'react-hook-form';

// Tab-specific components
import { ConditionalLogicForm } from './property-forms/conditional-logic-form';
import { GeneralPropertiesForm } from './property-forms/general-properties-form';
import { StylingPropertiesForm } from './property-forms/styling-properties-form';
import { ValidationPropertiesForm } from './property-forms/validation-properties-form';

interface ElementPropertiesProps {
  className?: string;
  selectedElement: FormElement | null;
  onPropertyChange?: (elementId: string, property: keyof ElementProperties, value: unknown) => void;
  onClose?: () => void;
}

/**
 * Main element properties panel component with tabbed interface
 */
export function ElementProperties({
  className,
  selectedElement,
  onPropertyChange,
  onClose,
}: ElementPropertiesProps) {
  const {
    state,
    currentElement,
    form,
    selectElement,
    setElementProperties,
    setActiveTab,
    updateProperty,
    validateCurrentElement,
    copyProperties,
    resetElementProperties,
    hasUnsavedChanges,
    validationErrors,
  } = useElementProperties();

  // Sync with external selectedElement prop
  useEffect(() => {
    if (selectedElement && selectedElement.id !== state.selectedElementId) {
      const { id, type, label, placeholder, required, validation, styling } = selectedElement;
      const properties: ElementProperties = {
        id: id.toString(),
        elementType: type,
        label,
        placeholder: placeholder || '',
        required: required || false,
        disabled: (selectedElement.properties?.disabled as boolean) || false,
        description: (selectedElement.properties?.description as string) || '',
        validation,
        styling,
      };
      // First, set the properties for the element in the panel's state
      setElementProperties(id.toString(), properties);
      // Then, select the element to make it active
      selectElement(id.toString());
    } else if (!selectedElement && state.selectedElementId) {
      // Deselect if external selection is null
      selectElement(null);
    }
  }, [selectedElement, state.selectedElementId, selectElement, setElementProperties]);

  // Handle property changes and notify parent
  const handlePropertyUpdate = (
    elementId: string,
    property: keyof ElementProperties,
    value: unknown,
  ) => {
    updateProperty(elementId, property, value);
    onPropertyChange?.(elementId, property, value);
  };

  // Validate current element and get validation results
  const validationResult = validateCurrentElement();

  // Tab configuration with icons and badges
  const tabs = [
    {
      id: 'general' as PropertyPanelTab,
      label: 'General',
      icon: Settings,
      badge: Object.keys(validationErrors).filter((key) =>
        ['label', 'placeholder', 'description'].includes(key),
      ).length,
    },
    {
      id: 'validation' as PropertyPanelTab,
      label: 'Validation',
      icon: CheckSquare,
      badge: currentElement?.validation?.length || 0,
    },
    {
      id: 'styling' as PropertyPanelTab,
      label: 'Styling',
      icon: Palette,
      badge: Object.keys(currentElement?.styling || {}).length,
    },
    {
      id: 'conditional' as PropertyPanelTab,
      label: 'Logic',
      icon: Zap,
      badge: currentElement?.conditional ? 1 : 0,
    },
  ];

  // Handle copy properties
  const handleCopyProperties = () => {
    if (currentElement) {
      copyProperties(currentElement.id);
      // Could show a toast notification here
    }
  };

  // Handle reset properties
  const handleResetProperties = () => {
    if (currentElement) {
      resetElementProperties(currentElement.id);
    }
  };

  // Render empty state when no element is selected
  if (!currentElement) {
    return (
      <Card className={cn('w-80 h-full', className)}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Properties</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Select an element to edit its properties</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-80 h-full flex flex-col', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Properties</CardTitle>
          <div className="flex items-center gap-1">
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="text-xs">
                Unsaved
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyProperties}
              title="Copy properties">
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetProperties}
              title="Reset properties">
              <RotateCcw className="h-3 w-3" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} title="Close panel">
                ×
              </Button>
            )}
          </div>
        </div>

        {/* Element info */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Type:</span> {currentElement.elementType}
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">ID:</span> {currentElement.id}
          </div>
        </div>

        {/* Validation summary */}
        {!validationResult.isValid && (
          <Alert variant="destructive" className="py-2">
            <AlertDescription className="text-xs">
              {Object.values(validationResult.errors).flat().length} validation error(s)
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <Separator />

      <div className="flex-1 overflow-hidden">
        <FormProvider {...form}>
          <Tabs
            value={state.activeTab}
            onValueChange={(value) => setActiveTab(value as PropertyPanelTab)}
            className="h-full flex flex-col">
            {/* Tab navigation */}
            <TabsList className="grid grid-cols-4 m-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex flex-col gap-1 p-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Icon className="h-3 w-3" />
                      {tab.badge > 0 && (
                        <Badge variant="secondary" className="h-4 w-4 p-0 text-xs">
                          {tab.badge}
                        </Badge>
                      )}
                    </div>
                    <span className="truncate">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Tab content */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-3 space-y-4">
                  <TabsContent value="general" className="mt-0">
                    <GeneralPropertiesForm
                      elementId={currentElement.id}
                      elementType={currentElement.elementType}
                      properties={currentElement}
                      onPropertyChange={handlePropertyUpdate}
                    />
                  </TabsContent>

                  <TabsContent value="validation" className="mt-0">
                    <ValidationPropertiesForm
                      elementId={currentElement.id}
                      elementType={currentElement.elementType}
                      validationRules={currentElement.validation}
                      onRulesChange={(rules) =>
                        handlePropertyUpdate(currentElement.id, 'validation', rules)
                      }
                    />
                  </TabsContent>

                  <TabsContent value="styling" className="mt-0">
                    <StylingPropertiesForm
                      styling={currentElement.styling}
                      onStylingChange={(styling) =>
                        handlePropertyUpdate(currentElement.id, 'styling', styling)
                      }
                    />
                  </TabsContent>

                  <TabsContent value="conditional" className="mt-0">
                    <ConditionalLogicForm
                      conditionalLogic={currentElement.conditional}
                      onLogicChange={(logic) =>
                        handlePropertyUpdate(currentElement.id, 'conditional', logic)
                      }
                    />
                  </TabsContent>
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </FormProvider>
      </div>
    </Card>
  );
}

/**
 * Property section wrapper with collapsible functionality
 */
interface PropertySectionProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function PropertySection({
  title,
  description,
  icon: Icon,
  children,
  defaultOpen = true,
  className,
}: PropertySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-2 h-auto font-normal">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4" />}
            <div className="text-left">
              <div className="text-sm font-medium">{title}</div>
              {description && <div className="text-xs text-muted-foreground">{description}</div>}
            </div>
          </div>
          <div
            className={cn('transition-transform duration-200', isOpen ? 'rotate-90' : 'rotate-0')}>
            ▶
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-2 pb-2">
        <div className="space-y-3 pt-2">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * Display name for React DevTools
 */
ElementProperties.displayName = 'ElementProperties';
