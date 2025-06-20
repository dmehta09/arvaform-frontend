/**
 * Form Builder Commands - 2025 Edition
 * Concrete implementations of commands for form builder operations
 *
 * Features:
 * - Type-safe command implementations
 * - Optimized serialization for network transmission
 * - Command merging for performance optimization
 * - Comprehensive undo/redo support
 */

import {
  ElementPosition,
  FormBuilderState,
  FormElement,
  FormElementType,
} from '@/types/form-builder.types';
import { UniqueIdentifier } from '@dnd-kit/core';
import { Command, CommandType, SerializedCommand, generateCommandId } from './command-manager';

/**
 * Base abstract command class with common functionality
 */
abstract class BaseCommand implements Command {
  readonly id: string;
  readonly timestamp: number;
  readonly metadata?: Record<string, unknown>;

  constructor(
    public readonly type: CommandType,
    public readonly description: string,
    metadata?: Record<string, unknown>,
  ) {
    this.id = generateCommandId();
    this.timestamp = Date.now();
    this.metadata = metadata;
  }

  abstract execute(state: FormBuilderState): FormBuilderState;
  abstract undo(state: FormBuilderState): FormBuilderState;
  abstract serialize(): SerializedCommand;

  /**
   * Default implementation - most commands cannot merge
   */
  canMergeWith(_command: Command): boolean {
    return false;
  }

  /**
   * Default implementation - throws error for non-mergeable commands
   */
  mergeWith(_command: Command): Command {
    throw new Error(`Command type ${this.type} does not support merging`);
  }

  /**
   * Utility method to clone state for immutable updates
   */
  protected cloneState(state: FormBuilderState): FormBuilderState {
    return {
      ...state,
      elements: [...state.elements.map((el) => ({ ...el }))],
      history: { ...state.history },
    };
  }

  /**
   * Utility method to find element by ID
   */
  protected findElement(elements: FormElement[], id: UniqueIdentifier): FormElement | undefined {
    return elements.find((el) => el.id === id);
  }

  /**
   * Utility method to find element index by ID
   */
  protected findElementIndex(elements: FormElement[], id: UniqueIdentifier): number {
    return elements.findIndex((el) => el.id === id);
  }
}

/**
 * Command to add a new element to the form
 */
export class AddElementCommand extends BaseCommand {
  private generatedElementId?: UniqueIdentifier;

  constructor(
    private elementType: FormElementType,
    private position: ElementPosition,
    private elementId?: UniqueIdentifier,
    metadata?: Record<string, unknown>,
  ) {
    super('add-element', `Add ${elementType} element`, metadata);
  }

  execute(state: FormBuilderState): FormBuilderState {
    const newState = this.cloneState(state);

    const elementId =
      this.elementId || `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.generatedElementId = elementId;

    const newElement: FormElement = {
      id: elementId,
      type: this.elementType,
      label: this.getDefaultLabel(this.elementType),
      placeholder: this.getDefaultPlaceholder(this.elementType),
      required: false,
      validation: [],
      styling: {},
      position: this.position,
      properties: {},
    };

    newState.elements.push(newElement);
    newState.selectedElementId = newElement.id;

    console.log(`➕ Added element: ${newElement.type} (${newElement.id})`);
    return newState;
  }

  undo(state: FormBuilderState): FormBuilderState {
    const newState = this.cloneState(state);
    const elementId = this.generatedElementId || this.elementId;
    const elementIndex = this.findElementIndex(newState.elements, elementId!);

    if (elementIndex !== -1) {
      newState.elements.splice(elementIndex, 1);
      newState.selectedElementId = undefined;
      console.log(`➖ Removed element: ${this.elementType} (${elementId})`);
    }

    return newState;
  }

  serialize(): SerializedCommand {
    return {
      id: this.id,
      type: this.type,
      timestamp: this.timestamp,
      description: this.description,
      data: {
        elementType: this.elementType,
        position: this.position,
        elementId: this.generatedElementId || this.elementId,
      },
      metadata: this.metadata,
    };
  }

  private getDefaultLabel(type: FormElementType): string {
    const labels: Record<FormElementType, string> = {
      text: 'Text Input',
      email: 'Email Address',
      phone: 'Phone Number',
      number: 'Number',
      date: 'Date',
      textarea: 'Text Area',
      dropdown: 'Dropdown',
      radio: 'Radio Group',
      checkbox: 'Checkbox',
      section: 'Section',
      heading: 'Heading',
      divider: 'Divider',
      file: 'File Upload',
    };
    return labels[type] || 'Form Field';
  }

  private getDefaultPlaceholder(type: FormElementType): string | undefined {
    const placeholders: Partial<Record<FormElementType, string>> = {
      text: 'Enter text...',
      email: 'Enter email address...',
      phone: 'Enter phone number...',
      number: 'Enter number...',
      textarea: 'Enter your message...',
    };
    return placeholders[type];
  }
}

/**
 * Command to remove an element from the form
 */
export class RemoveElementCommand extends BaseCommand {
  private removedElement?: FormElement;

  constructor(
    private elementId: UniqueIdentifier,
    metadata?: Record<string, unknown>,
  ) {
    super('remove-element', `Remove element ${elementId}`, metadata);
  }

  execute(state: FormBuilderState): FormBuilderState {
    const elementIndex = state.elements.findIndex((el) => el.id === this.elementId);

    if (elementIndex === -1) {
      throw new Error(`Element with ID ${this.elementId} not found`);
    }

    const elementToRemove = state.elements[elementIndex];
    if (!elementToRemove) {
      throw new Error(`Element at index ${elementIndex} is undefined`);
    }

    // Store the removed element for undo
    this.removedElement = { ...elementToRemove };

    console.log(`🗑️ Removed element: ${this.removedElement.type} (${this.elementId})`);

    return {
      ...state,
      elements: state.elements.filter((_, index) => index !== elementIndex),
      selectedElementId:
        state.selectedElementId === this.elementId ? undefined : state.selectedElementId,
    };
  }

  undo(state: FormBuilderState): FormBuilderState {
    if (!this.removedElement) {
      throw new Error('Cannot undo remove - element data not found');
    }

    const newState = this.cloneState(state);
    newState.elements.push({ ...this.removedElement });
    newState.selectedElementId = this.removedElement.id;

    console.log(`↩️ Restored element: ${this.removedElement.type} (${this.elementId})`);
    return newState;
  }

  serialize(): SerializedCommand {
    return {
      id: this.id,
      type: this.type,
      timestamp: this.timestamp,
      description: this.description,
      data: {
        elementId: this.elementId,
        removedElement: this.removedElement,
      },
      metadata: this.metadata,
    };
  }

  override canMergeWith(_command: Command): boolean {
    // Remove commands cannot be merged
    return false;
  }

  override mergeWith(_command: Command): Command {
    // Not applicable for remove commands
    return this;
  }
}

/**
 * Command to move an element to a new position
 */
export class MoveElementCommand extends BaseCommand {
  private previousPosition?: ElementPosition;

  constructor(
    private elementId: UniqueIdentifier,
    private newPosition: ElementPosition,
    metadata?: Record<string, unknown>,
  ) {
    super('move-element', `Move element ${elementId}`, metadata);
  }

  execute(state: FormBuilderState): FormBuilderState {
    const newState = this.cloneState(state);
    const element = this.findElement(newState.elements, this.elementId);

    if (element) {
      this.previousPosition = { ...element.position };
      element.position = { ...this.newPosition };
      console.log(`📍 Moved element: ${element.type} (${this.elementId})`);
    }

    return newState;
  }

  undo(state: FormBuilderState): FormBuilderState {
    if (!this.previousPosition) {
      throw new Error('Cannot undo move - previous position not found');
    }

    const newState = this.cloneState(state);
    const element = this.findElement(newState.elements, this.elementId);

    if (element) {
      element.position = { ...this.previousPosition };
      console.log(`⏪ Restored element position: ${element.type} (${this.elementId})`);
    }

    return newState;
  }

  serialize(): SerializedCommand {
    return {
      id: this.id,
      type: this.type,
      timestamp: this.timestamp,
      description: this.description,
      data: {
        elementId: this.elementId,
        newPosition: this.newPosition,
        previousPosition: this.previousPosition,
      },
      metadata: this.metadata,
    };
  }

  /**
   * Move commands can be merged if they target the same element
   */
  override canMergeWith(command: Command): boolean {
    if (command.type !== 'move-element') return false;

    const moveCommand = command as MoveElementCommand;
    return moveCommand.elementId === this.elementId;
  }

  /**
   * Merge with another move command for the same element
   */
  override mergeWith(command: Command): Command {
    if (!this.canMergeWith(command)) {
      throw new Error('Cannot merge incompatible commands');
    }

    const moveCommand = command as MoveElementCommand;

    // Create a new merged command that moves from original position to final position
    const merged = new MoveElementCommand(this.elementId, moveCommand.newPosition, {
      ...this.metadata,
      merged: true,
    });

    // Preserve the original starting position
    merged.previousPosition = this.previousPosition;

    return merged;
  }
}

/**
 * Command to update element properties
 */
export class UpdateElementPropertiesCommand extends BaseCommand {
  private previousProperties?: Record<string, unknown>;

  constructor(
    private elementId: UniqueIdentifier,
    private newProperties: Record<string, unknown>,
    metadata?: Record<string, unknown>,
  ) {
    super('update-element-properties', `Update element ${elementId} properties`, metadata);
  }

  execute(state: FormBuilderState): FormBuilderState {
    const newState = this.cloneState(state);
    const element = this.findElement(newState.elements, this.elementId);

    if (element) {
      this.previousProperties = { ...element.properties };
      element.properties = { ...element.properties, ...this.newProperties };
      console.log(`⚙️ Updated element properties: ${element.type} (${this.elementId})`);
    }

    return newState;
  }

  undo(state: FormBuilderState): FormBuilderState {
    if (!this.previousProperties) {
      throw new Error('Cannot undo properties update - previous properties not found');
    }

    const newState = this.cloneState(state);
    const element = this.findElement(newState.elements, this.elementId);

    if (element) {
      element.properties = { ...this.previousProperties };
      console.log(`🔄 Restored element properties: ${element.type} (${this.elementId})`);
    }

    return newState;
  }

  serialize(): SerializedCommand {
    return {
      id: this.id,
      type: this.type,
      timestamp: this.timestamp,
      description: this.description,
      data: {
        elementId: this.elementId,
        newProperties: this.newProperties,
        previousProperties: this.previousProperties,
      },
      metadata: this.metadata,
    };
  }

  /**
   * Property update commands can be merged if they target the same element
   */
  override canMergeWith(command: Command): boolean {
    return (
      command instanceof UpdateElementPropertiesCommand &&
      command.elementId === this.elementId &&
      Date.now() - command.timestamp < 1000 // 1 second window
    );
  }

  /**
   * Merge with another property update command for the same element
   */
  override mergeWith(command: Command): Command {
    if (!(command instanceof UpdateElementPropertiesCommand)) {
      return this;
    }

    return new UpdateElementPropertiesCommand(
      this.elementId,
      { ...this.previousProperties, ...command.previousProperties },
      { ...this.newProperties, ...command.newProperties },
    );
  }
}

/**
 * Command to update form-level properties
 */
export class UpdateFormPropertiesCommand extends BaseCommand {
  private previousFormProperties?: { title?: string; description?: string };

  constructor(
    private newFormProperties: { title?: string; description?: string },
    metadata?: Record<string, unknown>,
  ) {
    super('update-form-properties', 'Update form properties', metadata);
  }

  execute(state: FormBuilderState): FormBuilderState {
    const newState = this.cloneState(state);

    this.previousFormProperties = {
      title: newState.title,
      description: newState.description,
    };

    if (this.newFormProperties.title !== undefined) {
      newState.title = this.newFormProperties.title;
    }

    if (this.newFormProperties.description !== undefined) {
      newState.description = this.newFormProperties.description;
    }

    console.log('📝 Updated form properties');
    return newState;
  }

  undo(state: FormBuilderState): FormBuilderState {
    if (!this.previousFormProperties) {
      throw new Error('Cannot undo form properties update - previous properties not found');
    }

    const newState = this.cloneState(state);

    if (this.previousFormProperties.title !== undefined) {
      newState.title = this.previousFormProperties.title;
    }

    if (this.previousFormProperties.description !== undefined) {
      newState.description = this.previousFormProperties.description;
    }

    console.log('🔄 Restored form properties');
    return newState;
  }

  serialize(): SerializedCommand {
    return {
      id: this.id,
      type: this.type,
      timestamp: this.timestamp,
      description: this.description,
      data: {
        newFormProperties: this.newFormProperties,
        previousFormProperties: this.previousFormProperties,
      },
      metadata: this.metadata,
    };
  }

  /**
   * Form property updates can be merged
   */
  override canMergeWith(command: Command): boolean {
    return (
      command instanceof UpdateFormPropertiesCommand && Date.now() - command.timestamp < 1000 // 1 second window
    );
  }

  /**
   * Merge with another form properties update command
   */
  override mergeWith(command: Command): Command {
    if (!(command instanceof UpdateFormPropertiesCommand)) {
      return this;
    }

    return new UpdateFormPropertiesCommand(
      { ...this.previousFormProperties, ...command.previousFormProperties },
      { ...this.newFormProperties, ...command.newFormProperties },
    );
  }
}

/**
 * Utility functions for command creation
 */
export const Commands = {
  addElement: (
    type: FormElementType,
    position: ElementPosition,
    metadata?: Record<string, unknown>,
  ) => new AddElementCommand(type, position, undefined, metadata),

  removeElement: (id: UniqueIdentifier, metadata?: Record<string, unknown>) =>
    new RemoveElementCommand(id, metadata),

  moveElement: (
    id: UniqueIdentifier,
    position: ElementPosition,
    metadata?: Record<string, unknown>,
  ) => new MoveElementCommand(id, position, metadata),

  updateElementProperties: (
    id: UniqueIdentifier,
    properties: Record<string, unknown>,
    metadata?: Record<string, unknown>,
  ) => new UpdateElementPropertiesCommand(id, properties, metadata),

  updateFormProperties: (
    properties: { title?: string; description?: string },
    metadata?: Record<string, unknown>,
  ) => new UpdateFormPropertiesCommand(properties, metadata),
};
