'use client';

import { cn } from '@/lib/utils';
import { ElementConfig } from '@/types/form-elements.types';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

/**
 * Props for the ElementCard component
 */
interface ElementCardProps {
  config: ElementConfig;
  className?: string;
  showDescription?: boolean;
  size?: 'small' | 'medium' | 'large';
  // onClick?: (config: ElementConfig) => void;
  // onDoubleClick?: (config: ElementConfig) => void;
}

/**
 * Draggable element card that represents a form element in the library
 * Provides visual representation and drag functionality for form elements
 */
export function ElementCard({
  config,
  className = '',
  showDescription = true,
  size = 'medium',
  // onClick,
  // onDoubleClick,
}: ElementCardProps) {
  console.log('🎯 ElementCard render:', config.type);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `element-${config.type}`,
    data: {
      elementType: config.type,
      source: 'library',
      config,
    },
  });

  console.log('🎯 useDraggable state:', {
    isDragging,
    hasListeners: !!listeners,
    listenersKeys: listeners ? Object.keys(listeners) : 'none',
    attributes: attributes ? Object.keys(attributes) : 'none',
  });

  // Calculate card styles based on size
  const sizeClasses = {
    small: 'p-2 min-h-[60px]',
    medium: 'p-3 min-h-[80px]',
    large: 'p-4 min-h-[100px]',
  };

  const iconSizes = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  // Card styling with drag state
  const cardClasses = cn(
    'element-card',
    'bg-white border border-gray-200 rounded-lg shadow-sm',
    'cursor-grab active:cursor-grabbing',
    'hover:border-blue-300 hover:shadow-md',
    'transition-all duration-200 ease-in-out',
    'flex flex-col items-center justify-center text-center',
    'group relative overflow-hidden',
    sizeClasses[size],
    {
      'opacity-50': isDragging,
      'scale-105 shadow-lg border-blue-400': isDragging,
    },
    className,
  );

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  /**
   * Handle card click
   */
  // const handleClick = (event: React.MouseEvent) => {
  //   event.preventDefault();
  //   onClick?.(config);
  // };

  /**
   * Handle card double click
   */
  // const handleDoubleClick = (event: React.MouseEvent) => {
  //   event.preventDefault();
  //   onDoubleClick?.(config);
  // };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cardClasses}
      data-element-type={config.type}
      data-testid={`element-card-${config.type}`}
      data-draggable="true"
      onMouseDown={(e) => {
        console.log('🐭 Mouse down on ElementCard:', config.type, e);
      }}
      // onClick={handleClick}
      // onDoubleClick={handleDoubleClick}
      {...attributes}
      {...listeners}>
      {/* Premium badge */}
      {config.isPremium && (
        <div className="absolute top-1 right-1">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pro
          </span>
        </div>
      )}

      {/* Element icon */}
      <div className={cn('element-icon mb-2', iconSizes[size])}>
        <span role="img" aria-label={config.name}>
          {config.icon}
        </span>
      </div>

      {/* Element name */}
      <div className={cn('element-name font-medium text-gray-900 mb-1', textSizes[size])}>
        {config.name}
      </div>

      {/* Element description */}
      {showDescription && size !== 'small' && (
        <div className={cn('element-description text-gray-600 leading-tight', textSizes[size])}>
          {config.description}
        </div>
      )}

      {/* Element tags (only for large size) */}
      {size === 'large' && config.tags.length > 0 && (
        <div className="element-tags mt-2 flex flex-wrap gap-1">
          {config.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
              {tag}
            </span>
          ))}
          {config.tags.length > 3 && (
            <span className="text-xs text-gray-400">+{config.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Drag indicator */}
      <div className="drag-indicator absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute top-1 left-1">
          <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-gray-400 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Hover overlay with actions */}
      <div className="card-overlay absolute inset-0 bg-blue-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
        <div className="text-xs font-medium text-blue-700">Drag to add</div>
      </div>
    </div>
  );
}

/**
 * Compact element card for smaller spaces
 */
interface CompactElementCardProps {
  config: ElementConfig;
  className?: string;
  onClick?: (config: ElementConfig) => void;
}

export function CompactElementCard({ config, className = '', onClick }: CompactElementCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `compact-element-${config.type}`,
    data: {
      elementType: config.type,
      source: 'library',
      config,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-draggable="true"
      className={cn(
        'compact-element-card',
        'flex items-center p-2 bg-white border border-gray-200 rounded-md',
        'cursor-grab active:cursor-grabbing',
        'hover:border-blue-300 hover:bg-blue-50',
        'transition-all duration-200',
        {
          'opacity-50': isDragging,
        },
        className,
      )}
      onClick={() => onClick?.(config)}
      {...attributes}
      {...listeners}>
      {/* Element icon */}
      <span className="text-lg mr-3" role="img" aria-label={config.name}>
        {config.icon}
      </span>

      {/* Element info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{config.name}</div>
        <div className="text-xs text-gray-500 truncate">{config.description}</div>
      </div>

      {/* Premium indicator */}
      {config.isPremium && (
        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pro
        </span>
      )}
    </div>
  );
}

/**
 * Element card skeleton for loading states
 */
export function ElementCardSkeleton({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'h-[60px]',
    medium: 'h-[80px]',
    large: 'h-[100px]',
  };

  return (
    <div
      className={cn(
        'element-card-skeleton',
        'bg-gray-100 border border-gray-200 rounded-lg',
        'animate-pulse flex flex-col items-center justify-center p-3',
        sizeClasses[size],
      )}>
      <div className="w-6 h-6 bg-gray-300 rounded mb-2" />
      <div className="w-16 h-3 bg-gray-300 rounded mb-1" />
      {size !== 'small' && <div className="w-20 h-2 bg-gray-300 rounded" />}
    </div>
  );
}
