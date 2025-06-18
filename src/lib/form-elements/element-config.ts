import { FormElementType } from '@/types/form-builder.types';
import { ElementConfig } from '@/types/form-elements.types';

/**
 * Default element configurations for the form builder library
 * Each element includes metadata, default properties, and categorization
 */
export const ELEMENT_CONFIGS: Record<FormElementType, ElementConfig> = {
  text: {
    type: 'text',
    name: 'Text Input',
    description: 'Single-line text input for names, titles, and short responses',
    icon: '📝',
    category: 'basic-inputs',
    tags: ['input', 'text', 'basic', 'required'],
    defaultProps: {
      label: 'Text Input',
      placeholder: 'Enter text...',
      required: false,
      validation: [
        {
          id: 'required',
          type: 'required',
          enabled: false,
          message: 'This field is required.',
        },
        {
          id: 'minLength',
          type: 'minLength',
          value: 1,
          enabled: true,
          message: 'Must be at least 1 character.',
        },
        {
          id: 'maxLength',
          type: 'maxLength',
          value: 255,
          enabled: true,
          message: 'Cannot exceed 255 characters.',
        },
      ],
      styling: {
        fontSize: '14px',
        padding: { top: '8px', right: '12px', bottom: '8px', left: '12px' },
      },
      properties: {
        autocomplete: 'off',
        spellcheck: true,
      },
    },
  },
  email: {
    type: 'email',
    name: 'Email Address',
    description: 'Email input with built-in validation and formatting',
    icon: '✉️',
    category: 'basic-inputs',
    tags: ['input', 'email', 'validation', 'required'],
    defaultProps: {
      label: 'Email Address',
      placeholder: 'Enter your email address...',
      required: true,
      validation: [
        {
          id: 'required',
          type: 'required',
          enabled: true,
          message: 'Email is required.',
        },
        {
          id: 'email',
          type: 'email',
          enabled: true,
          message: 'Please enter a valid email address.',
        },
      ],
      styling: {
        fontSize: '14px',
        padding: { top: '8px', right: '12px', bottom: '8px', left: '12px' },
      },
      properties: {
        autocomplete: 'email',
      },
    },
  },
  phone: {
    type: 'phone',
    name: 'Phone Number',
    description: 'Phone number input with formatting and validation',
    icon: '📞',
    category: 'basic-inputs',
    tags: ['input', 'phone', 'validation', 'formatting'],
    defaultProps: {
      label: 'Phone Number',
      placeholder: 'Enter your phone number...',
      required: false,
      validation: [
        {
          id: 'pattern',
          type: 'pattern',
          value: '^[\\+]?[1-9][\\d]{0,15}$',
          enabled: true,
          message: 'Please enter a valid phone number.',
        },
      ],
      styling: {
        fontSize: '14px',
        padding: { top: '8px', right: '12px', bottom: '8px', left: '12px' },
      },
      properties: {
        autocomplete: 'tel',
        format: 'international',
      },
    },
  },
  number: {
    type: 'number',
    name: 'Number Input',
    description: 'Numeric input with min/max validation and step controls',
    icon: '🔢',
    category: 'basic-inputs',
    tags: ['input', 'number', 'validation', 'numeric'],
    defaultProps: {
      label: 'Number',
      placeholder: 'Enter a number...',
      required: false,
      validation: [
        { id: 'min', type: 'min', value: 0, enabled: true },
        { id: 'max', type: 'max', value: 999999, enabled: true },
      ],
      styling: {
        fontSize: '14px',
        padding: { top: '8px', right: '12px', bottom: '8px', left: '12px' },
      },
      properties: {
        step: 1,
        allowDecimal: true,
      },
    },
  },
  date: {
    type: 'date',
    name: 'Date Picker',
    description: 'Date selection with calendar interface and validation',
    icon: '📅',
    category: 'basic-inputs',
    tags: ['input', 'date', 'calendar', 'validation'],
    defaultProps: {
      label: 'Date',
      placeholder: 'Select a date...',
      required: false,
      validation: [],
      styling: {
        fontSize: '14px',
        padding: { top: '8px', right: '12px', bottom: '8px', left: '12px' },
      },
      properties: {
        format: 'YYYY-MM-DD',
        minDate: null,
        maxDate: null,
        showCalendar: true,
      },
    },
  },
  textarea: {
    type: 'textarea',
    name: 'Text Area',
    description: 'Multi-line text input for longer responses and comments',
    icon: '📄',
    category: 'text-content',
    tags: ['input', 'textarea', 'multiline', 'text'],
    defaultProps: {
      label: 'Text Area',
      placeholder: 'Enter your response...',
      required: false,
      validation: [
        {
          id: 'minLength',
          type: 'minLength',
          value: 1,
          enabled: true,
        },
        {
          id: 'maxLength',
          type: 'maxLength',
          value: 2000,
          enabled: true,
        },
      ],
      styling: {
        fontSize: '14px',
        padding: { top: '8px', right: '12px', bottom: '8px', left: '12px' },
      },
      properties: {
        rows: 4,
        cols: 50,
        resize: 'vertical',
        spellcheck: true,
      },
    },
  },
  dropdown: {
    type: 'dropdown',
    name: 'Dropdown Select',
    description: 'Single or multiple selection from predefined options',
    icon: '▼',
    category: 'selection',
    tags: ['select', 'dropdown', 'options', 'choice'],
    defaultProps: {
      label: 'Select Option',
      placeholder: 'Choose an option...',
      required: false,
      validation: [],
      styling: {
        fontSize: '14px',
        padding: { top: '8px', right: '12px', bottom: '8px', left: '12px' },
      },
      properties: {
        options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
          { value: 'option3', label: 'Option 3' },
        ],
        multiple: false,
        searchable: false,
      },
    },
  },
  radio: {
    type: 'radio',
    name: 'Radio Buttons',
    description: 'Single selection from multiple exclusive options',
    icon: '🔘',
    category: 'selection',
    tags: ['radio', 'selection', 'options', 'exclusive'],
    defaultProps: {
      label: 'Choose One',
      required: false,
      validation: [],
      styling: {
        fontSize: '14px',
      },
      properties: {
        options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
          { value: 'option3', label: 'Option 3' },
        ],
        layout: 'vertical',
      },
    },
  },
  checkbox: {
    type: 'checkbox',
    name: 'Checkboxes',
    description: 'Multiple selection from available options',
    icon: '☑️',
    category: 'selection',
    tags: ['checkbox', 'selection', 'options', 'multiple'],
    defaultProps: {
      label: 'Select All That Apply',
      required: false,
      validation: [],
      styling: {
        fontSize: '14px',
      },
      properties: {
        options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
          { value: 'option3', label: 'Option 3' },
        ],
        layout: 'vertical',
        minSelections: 0,
        maxSelections: null,
      },
    },
  },
  section: {
    type: 'section',
    name: 'Section Header',
    description: 'Group related fields with a descriptive section header',
    icon: '📦',
    category: 'layout',
    tags: ['layout', 'section', 'group', 'header'],
    defaultProps: {
      label: 'Section Title',
      required: false,
      validation: [],
      styling: {
        padding: { top: '16px', right: '16px', bottom: '16px', left: '16px' },
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        borderWidth: '1px',
        borderColor: '#e5e7eb',
      },
      properties: {
        collapsible: false,
        defaultOpen: true,
        subtitle: 'A short description for this section',
      },
    },
  },
  heading: {
    type: 'heading',
    name: 'Heading',
    description: 'Display a heading to structure your form',
    icon: 'H1',
    category: 'text-content',
    tags: ['text', 'heading', 'title', 'header'],
    defaultProps: {
      label: 'Main Heading',
      required: false,
      validation: [],
      styling: {
        fontSize: '24px',
        fontWeight: 'bold',
        margin: { top: '16px', bottom: '8px' },
      },
      properties: {
        level: 1, // h1
      },
    },
  },
  divider: {
    type: 'divider',
    name: 'Divider',
    description: 'Visually separate sections of your form',
    icon: '—',
    category: 'layout',
    tags: ['layout', 'divider', 'separator', 'line'],
    defaultProps: {
      label: '',
      required: false,
      validation: [],
      styling: {
        borderWidth: '1px',
        borderColor: '#e0e0e0',
        margin: { top: '16px', bottom: '16px' },
      },
      properties: {
        orientation: 'horizontal',
        style: 'solid',
      },
    },
  },
};

/**
 * Get element configuration by type
 */
export function getElementConfig(elementType: FormElementType): ElementConfig | undefined {
  return ELEMENT_CONFIGS[elementType];
}

/**
 * Get all element configurations
 */
export function getAllElementConfigs(): ElementConfig[] {
  return Object.values(ELEMENT_CONFIGS);
}

/**
 * Get element configurations by category
 */
export function getElementConfigsByCategory(categoryId: string): ElementConfig[] {
  return getAllElementConfigs().filter((config) => config.category === categoryId);
}

/**
 * Search element configurations
 */
export function searchElementConfigs(query: string): ElementConfig[] {
  const searchTerm = query.toLowerCase().trim();

  if (!searchTerm) {
    return getAllElementConfigs();
  }

  return getAllElementConfigs().filter((config) => {
    const matchesName = config.name.toLowerCase().includes(searchTerm);
    const matchesDescription = config.description.toLowerCase().includes(searchTerm);
    const matchesTags = config.tags.some((tag) => tag.toLowerCase().includes(searchTerm));

    return matchesName || matchesDescription || matchesTags;
  });
}

/**
 * Get popular element configurations
 */
export function getPopularElementConfigs(): ElementConfig[] {
  // Return most commonly used elements
  const popularTypes: FormElementType[] = ['text', 'email', 'textarea', 'dropdown', 'checkbox'];
  return popularTypes.map((type) => ELEMENT_CONFIGS[type]).filter(Boolean);
}

/**
 * Get advanced element configurations
 */
export function getAdvancedElementConfigs(): ElementConfig[] {
  return getAllElementConfigs().filter((config) => config.isAdvanced);
}
