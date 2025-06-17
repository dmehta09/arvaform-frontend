# Form Builder - Drag-and-Drop Infrastructure

This module implements the core drag-and-drop infrastructure for the ArvaForm form builder using @dnd-kit library with full TypeScript support and accessibility compliance.

## Architecture Overview

The form builder consists of several key components that work together to provide a smooth drag-and-drop experience:

### Core Components

1. **FormBuilder** (`form-builder.tsx`) - Main container component
2. **FormBuilderDndContext** (`dnd-context.tsx`) - DnD context provider
3. **DropZone Components** (`drop-zone.tsx`) - Drop target areas
4. **Type Definitions** (`types/form-builder.types.ts`) - TypeScript interfaces
5. **Custom Sensors** (`lib/dnd/sensors.ts`) - Input device handling
6. **Collision Detection** (`lib/dnd/collision-detection.ts`) - Drop positioning

### State Management

The form builder uses the `useFormBuilder` hook (`hooks/use-form-builder.ts`) which provides:

- Form element CRUD operations
- Undo/redo functionality
- Version history management
- Auto-save capabilities
- Canvas operations (zoom, pan, grid)

## Implementation Details

### TypeScript Interfaces

```typescript
interface FormElement {
  id: UniqueIdentifier;
  type: FormElementType;
  label: string;
  position: ElementPosition;
  properties: Record<string, unknown>;
  validation: ValidationRule[];
  styling: ElementStyling;
}

interface FormBuilderState {
  elements: FormElement[];
  selectedElementId: UniqueIdentifier | null;
  canvasSize: CanvasSize;
  zoom: number;
  isDirty: boolean;
  history: FormBuilderHistory;
}
```

### Drag-and-Drop Flow

1. **Drag Start**: Element is picked up from library or canvas
2. **Drag Over**: Visual feedback shows valid drop zones
3. **Collision Detection**: Calculates precise drop position
4. **Drop**: Element is added/moved to new position
5. **State Update**: Form state is updated with new element arrangement

### Accessibility Features

- Keyboard navigation support
- Screen reader announcements
- Focus management
- ARIA attributes for all interactive elements

## Usage Example

```tsx
import { FormBuilder } from '@/components/form-builder/form-builder';

function FormBuilderPage() {
  const handleFormChange = (elements: FormElement[]) => {
    console.log('Form updated:', elements);
  };

  const handleElementSelected = (elementId: string) => {
    console.log('Element selected:', elementId);
  };

  return (
    <FormBuilder
      formId="form-123"
      onFormChange={handleFormChange}
      onElementSelected={handleElementSelected}
    />
  );
}
```

## Component Structure

```
form-builder/
├── form-builder.tsx          # Main container
├── dnd-context.tsx          # DnD context provider
├── drop-zone.tsx            # Drop zones
├── element-library.tsx      # Element sidebar (to be implemented)
├── form-canvas.tsx          # Canvas area (to be implemented)
├── property-panel.tsx       # Properties panel (to be implemented)
└── README.md               # This documentation
```

## Next Steps

The following components are planned for future tasks:

1. **Element Library** (E2-T004) - Sidebar with draggable elements
2. **Form Canvas** (E2-T005) - Main editing area with visual feedback
3. **Basic Form Elements** (E2-T006) - Text, email, select, etc.
4. **Property Panel** (E2-T007) - Element configuration interface
5. **Form Preview** (E2-T008) - Real-time form preview
6. **Auto-save & Undo/Redo** (E2-T010) - Advanced editing features

## Performance Considerations

- Uses React.memo for expensive re-renders
- Optimized collision detection algorithms
- Efficient state updates with proper dependencies
- Lazy loading for large element libraries

## Browser Support

- Modern browsers with ES2020+ support
- Touch devices (mobile/tablet)
- Keyboard navigation
- Screen readers

## Known Limitations

- Some TypeScript strict mode warnings remain
- Element library not yet implemented
- Property panel placeholder only
- Preview mode not functional

## Contributing

When adding new features:

1. Follow the established TypeScript patterns
2. Add proper accessibility attributes
3. Update type definitions
4. Add comprehensive documentation
5. Test with keyboard and screen readers
