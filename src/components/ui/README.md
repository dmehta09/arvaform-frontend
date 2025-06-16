# ArvaForm UI Components

This directory contains the ShadCN/UI components integrated with our custom ArvaForm design system. All components are built with accessibility, responsiveness, and modern design principles in mind.

## Available Components

### Form Components

- **Button** - Various button styles and states
- **Input** - Text input fields with validation support
- **Label** - Accessible form labels
- **Textarea** - Multi-line text input
- **Select** - Dropdown selection component
- **Checkbox** - Checkbox input with custom styling
- **Radio Group** - Radio button groups
- **Switch** - Toggle switch component
- **Form** - Form wrapper with validation support

### Layout Components

- **Card** - Content containers with header, content, and footer
- **Dialog** - Modal dialogs and overlays
- **Sheet** - Slide-out panels
- **Popover** - Contextual popup content
- **Tooltip** - Hover information displays

### Display Components

- **Badge** - Status and category indicators
- **Avatar** - User profile images and fallbacks
- **Progress** - Progress bars and indicators
- **Slider** - Range input sliders

### Navigation Components

- **Dropdown Menu** - Context menus and dropdowns
- **Alert Dialog** - Confirmation and alert dialogs

### Theme Components

- **Theme Toggle** - Switch between light, dark, and system themes
- **Theme Provider** - Context provider for theme management

## Usage Examples

### Basic Button

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="md">
  Click me
</Button>;
```

### Form with Validation

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="Enter your email" />
  </div>
  <Button type="submit">Submit</Button>
</div>;
```

### Card Layout

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
</Card>;
```

### Theme Toggle

```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Full theme toggle with dropdown
<ThemeToggle />;

// Simple toggle between light/dark
import { SimpleThemeToggle } from '@/components/ui/theme-toggle';
<SimpleThemeToggle />;
```

### Theme Provider Setup

```tsx
import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

## Design System Integration

All components are integrated with our custom ArvaForm design system:

- **Colors**: Uses CSS custom properties for consistent theming
- **Typography**: Follows our typography scale and font families
- **Spacing**: Uses consistent spacing tokens
- **Shadows**: Premium shadow effects for elevation
- **Animations**: Smooth transitions and micro-interactions
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA attributes
- **Dark Mode**: Seamless theme switching with system preference detection

## Theme System

The theme system provides:

- **Light Theme**: Clean, modern light interface
- **Dark Theme**: Eye-friendly dark interface
- **System Theme**: Automatically follows OS preference
- **Persistent Storage**: Theme preference saved across sessions
- **Smooth Transitions**: Animated theme switching
- **No Flash**: Prevents theme flash on page load

## Utility Functions

The components work seamlessly with our utility functions in `@/lib/utils`:

- `cn()` - Class name combination utility
- `focusRing()` - Consistent focus styling
- `transition()` - Animation utilities
- `shadow()` - Elevation effects
- `responsive()` - Mobile-first responsive classes

## Customization

Components can be customized through:

1. **CSS Variables** - Modify colors and spacing in `globals.css`
2. **Tailwind Classes** - Override styles with additional classes
3. **Component Props** - Use built-in variant and size props
4. **Theme Configuration** - Modify `tailwind.config.ts` for global changes

## Accessibility Features

- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management
- ARIA attributes
- Semantic HTML structure
- Theme preference respect (prefers-color-scheme)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Demo

Visit `/components-demo` to see all components in action with interactive examples, including the theme toggle functionality.
