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
      validation: {
        required: false,
        minLength: 1,
        maxLength: 255,
      },
      styling: {
        fontSize: '14px',
        padding: '8px 12px',
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
      validation: {
        required: true,
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
      },
      styling: {
        fontSize: '14px',
        padding: '8px 12px',
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
      validation: {
        required: false,
        pattern: '^[\\+]?[1-9][\\d]{0,15}$',
      },
      styling: {
        fontSize: '14px',
        padding: '8px 12px',
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
      validation: {
        required: false,
        min: 0,
        max: 999999,
      },
      styling: {
        fontSize: '14px',
        padding: '8px 12px',
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
      validation: {
        required: false,
      },
      styling: {
        fontSize: '14px',
        padding: '8px 12px',
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
      validation: {
        required: false,
        minLength: 1,
        maxLength: 2000,
      },
      styling: {
        fontSize: '14px',
        padding: '8px 12px',
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
      validation: {
        required: false,
      },
      styling: {
        fontSize: '14px',
        padding: '8px 12px',
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
      validation: {
        required: false,
      },
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
      validation: {
        required: false,
      },
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
    icon: '📂',
    category: 'text-content',
    tags: ['layout', 'section', 'grouping', 'organization'],
    defaultProps: {
      label: 'Section Title',
      required: false,
      styling: {
        fontSize: '18px',
        fontWeight: 'bold',
        margin: '16px 0 8px 0',
      },
      properties: {
        description: 'Section description (optional)',
        collapsible: false,
        collapsed: false,
      },
    },
  },
  heading: {
    type: 'heading',
    name: 'Heading',
    description: 'Form title or section heading with customizable styling',
    icon: '📝',
    category: 'text-content',
    tags: ['heading', 'title', 'text', 'formatting'],
    defaultProps: {
      label: 'Form Heading',
      required: false,
      styling: {
        fontSize: '24px',
        fontWeight: 'bold',
        margin: '0 0 16px 0',
      },
      properties: {
        level: 2, // h2
        subtitle: '',
      },
    },
  },
  divider: {
    type: 'divider',
    name: 'Divider Line',
    description: 'Visual separator to organize form sections',
    icon: '➖',
    category: 'layout',
    tags: ['divider', 'separator', 'layout', 'spacing'],
    defaultProps: {
      label: 'Divider',
      required: false,
      styling: {
        borderColor: '#e5e7eb',
        borderWidth: 1,
        margin: '16px 0',
      },
      properties: {
        style: 'solid', // solid, dashed, dotted
        thickness: 1,
        spacing: 16,
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
