/**
 * File Upload hook following Flutter patterns.
 * Provides composable behavior for file upload components.
 */

import { useState, useCallback, useMemo } from 'react';
import { useSemanticMixin } from '../mixins/SemanticMixin';
import { useFocusableMixin } from '../mixins/FocusableMixin';
import type { SemanticProps } from '../contracts/SemanticContract';
import type { FocusableProps } from '../contracts/ComponentContract';

/**
 * Props for useFileUpload hook
 */
export interface UseFileUploadProps extends
  SemanticProps,
  FocusableProps {
  /** Current file value */
  value?: File | File[] | null;
  /** Default value when uncontrolled */
  defaultValue?: File | File[] | null;
  /** Whether multiple files are allowed */
  multiple?: boolean;
  /** Whether directory upload is supported */
  directory?: boolean;
  /** Accepted file types */
  accept?: string;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Minimum file size in bytes */
  minSize?: number;
  /** Maximum number of files (for multiple upload) */
  maxFiles?: number;
  /** Whether upload is disabled */
  disabled?: boolean;
  /** Whether upload is required */
  required?: boolean;
  /** Whether to capture from camera */
  capture?: boolean | 'user' | 'environment';
  /** Custom validation function */
  validate?: (file: File) => boolean | string;
  /** Change handler */
  onChange?: (files: File | File[] | null) => void;
  /** Error handler */
  onError?: (error: string, file?: File) => void;
  /** Drag over handler */
  onDragOver?: (event: React.DragEvent) => void;
  /** Drag leave handler */
  onDragLeave?: (event: React.DragEvent) => void;
  /** Drop handler */
  onDrop?: (event: React.DragEvent) => void;
  /** Browse handler */
  onBrowse?: () => void;
}

/**
 * File Upload component state
 */
export interface FileUploadState {
  /** Current files */
  files: File[];
  /** Whether component is disabled */
  disabled: boolean;
  /** Whether component is focused */
  focused: boolean;
  /** Whether component is dragging over */
  isDragging: boolean;
  /** Current error message */
  error?: string;
  /** Whether upload is valid */
  isValid: boolean;
  /** Whether upload is required */
  required: boolean;
  /** Whether component is empty */
  isEmpty: boolean;
}

/**
 * File Upload handlers
 */
export interface FileUploadHandlers {
  /** Handle file selection */
  handleFileSelect: (files: FileList | null) => void;
  /** Handle drag over */
  handleDragOver: (event: React.DragEvent) => void;
  /** Handle drag leave */
  handleDragLeave: (event: React.DragEvent) => void;
  /** Handle drop */
  handleDrop: (event: React.DragEvent) => void;
  /** Handle click to browse */
  handleClickBrowse: () => void;
  /** Handle focus */
  handleFocus: (event: React.FocusEvent) => void;
  /** Handle blur */
  handleBlur: (event: React.FocusEvent) => void;
  /** Handle key down */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Handle clear */
  handleClear: () => void;
  /** Handle file remove */
  handleFileRemove: (index: number) => void;
}

/**
 * Composable file upload hook using Flutter-style mixins
 * @param props - File upload configuration
 * @returns File upload state, handlers, and attributes
 */
export function useFileUpload(props: UseFileUploadProps = {}) {
  const {
    value: controlledValue,
    defaultValue = null,
    multiple = false,
    directory = false,
    accept,
    maxSize,
    minSize,
    maxFiles,
    disabled = false,
    required = false,
    capture,
    validate,
    onChange,
    onError,
    onDragOver,
    onDragLeave,
    onDrop,
    onBrowse,
    defaultFocused = false,
    focusable = true,
    focusStrategy = 'auto',
    role = 'button',
    label,
    labelledBy,
    describedBy,
    ...semanticProps
  } = props;

  // State management
  const [focused, setFocused] = useState(defaultFocused);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Determine if component is controlled or uncontrolled
  const isControlled = controlledValue !== undefined;
  const controlledFiles = useMemo(() => {
    if (controlledValue === null) return [];
    if (controlledValue === undefined) return [];
    return Array.isArray(controlledValue) ? controlledValue : [controlledValue];
  }, [controlledValue]);

  const [internalFiles, setInternalFiles] = useState<File[]>(() => {
    if (defaultValue === null) return [];
    if (defaultValue === undefined) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  });

  const files = isControlled ? controlledFiles : internalFiles;

  // Validation function
  const validateFile = useCallback((file: File) => {
    // Check file size
    if (maxSize && file.size > maxSize) {
      return `File size exceeds maximum of ${maxSize} bytes`;
    }

    if (minSize && file.size < minSize) {
      return `File size is below minimum of ${minSize} bytes`;
    }

    // Check file type
    if (accept) {
      const acceptTypes = accept.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const fileType = file.type;

      const isAccepted = acceptTypes.some(acceptType => {
        if (acceptType.startsWith('.')) {
          return fileExtension === acceptType.toLowerCase();
        } else if (acceptType.includes('/')) {
          return fileType === acceptType || fileType.startsWith(acceptType.split('/')[0] + '/');
        } else {
          return fileType === acceptType;
        }
      });

      if (!isAccepted) {
        return `File type ${fileType} is not accepted`;
      }
    }

    // Custom validation
    if (validate) {
      const customResult = validate(file);
      if (typeof customResult === 'string') {
        return customResult;
      } else if (customResult === false) {
        return 'File validation failed';
      }
    }

    return true; // Valid
  }, [maxSize, minSize, accept, validate]);

  // Compose file upload state
  const state = useMemo(() => ({
    files,
    disabled,
    focused,
    isDragging,
    error,
    isValid: !error && (files.length > 0 || !required),
    required,
    isEmpty: files.length === 0
  }), [files, disabled, focused, isDragging, error, required]);

  // Event handlers
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (disabled) return;

    try {
      if (!selectedFiles || selectedFiles.length === 0) {
        const newFiles: File[] = [];
        if (!isControlled) {
          setInternalFiles(newFiles);
        }
        onChange?.(multiple ? newFiles : (newFiles[0] || null));
        setError(undefined);
        return;
      }

      const filesArray = Array.from(selectedFiles);
      let processedFiles: File[] = filesArray;

      // Validate each file
      const errors: string[] = [];
      const validFiles: File[] = [];

      for (const file of filesArray) {
        const validationResult = validateFile(file);
        if (validationResult === true) {
          validFiles.push(file);
        } else {
          errors.push(`${file.name}: ${validationResult}`);
        }
      }

      // Apply file limits
      if (maxFiles && validFiles.length > maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        processedFiles = validFiles.slice(0, maxFiles);
      } else {
        processedFiles = validFiles;
      }

      // Handle multiple vs single
      const finalFiles = multiple ? [...files, ...processedFiles] : processedFiles;

      // Check max files limit again for multiple mode
      if (multiple && maxFiles && finalFiles.length > maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        processedFiles = finalFiles.slice(0, maxFiles);
      } else {
        processedFiles = finalFiles;
      }

      // Update state
      if (!isControlled) {
        setInternalFiles(processedFiles);
      }
      onChange?.(multiple ? processedFiles : (processedFiles[0] || null));

      // Set error or clear
      if (errors.length > 0) {
        const errorMessage = errors.join('; ');
        setError(errorMessage);
        onError?.(errorMessage);
      } else {
        setError(undefined);
      }
    } catch (err) {
      const errorMessage = 'Failed to process files';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [disabled, validateFile, multiple, maxFiles, required, isControlled, onChange, onError]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    if (disabled) return;

    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
    onDragOver?.(event);
  }, [disabled, onDragOver]);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    if (disabled) return;

    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    onDragLeave?.(event);
  }, [disabled, onDragLeave]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    if (disabled) return;

    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    onDrop?.(event);

    const droppedFiles = event.dataTransfer.files;
    handleFileSelect(droppedFiles);
  }, [disabled, handleFileSelect, onDrop]);

  const handleClickBrowse = useCallback(() => {
    if (disabled) return;
    onBrowse?.();
  }, [disabled, onBrowse]);

  const handleClear = useCallback(() => {
    if (disabled || required) return;
    handleFileSelect(null);
  }, [disabled, required, handleFileSelect]);

  // Compose mixins for file upload behavior
  const focusableMixin = useFocusableMixin({
    defaultFocused,
    focusable: focusable && !disabled,
    focusStrategy
  });

  const semantic = useSemanticMixin({
    role,
    label,
    labelledBy,
    describedBy: error || describedBy,
    ...semanticProps
  });

  // Event handlers that depend on mixins (defined after mixins)
  const handleFileRemove = useCallback((index: number) => {
    if (disabled) return;

    const newFiles = files.filter((_, i) => i !== index);
    if (!isControlled) {
      setInternalFiles(newFiles);
    }
    onChange?.(multiple ? newFiles : (newFiles[0] || null));
    setError(undefined);
  }, [disabled, files, multiple, isControlled, onChange]);

  const handleFocus = useCallback((event: React.FocusEvent) => {
    if (!focusable || disabled) return;

    setFocused(true);
    focusableMixin.handleFocus?.(event);
  }, [focusable, disabled, focusableMixin]);

  const handleBlur = useCallback((event: React.FocusEvent) => {
    setFocused(false);
    focusableMixin.handleBlur?.(event);
  }, [focusableMixin]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!focusable || disabled) return;

    // Handle Space/Enter to trigger file browser
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleClickBrowse();
      return;
    }

    // Handle Escape to clear files
    if (event.key === 'Escape' && files.length > 0 && !required) {
      event.preventDefault();
      handleFileSelect(null);
      return;
    }

    // Delegate to focusable mixin for standard navigation
    focusableMixin.handleKeyDown?.(event);
  }, [focusable, disabled, handleClickBrowse, files.length, required, handleFileSelect, focusableMixin]);

  // Generate semantic attributes
  const semanticAttributes = useMemo(() => ({
    ...semantic,
    'aria-disabled': disabled,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-busy': false,
    'data-disabled': disabled,
    'data-focused': focused,
    'data-dragging': isDragging,
    'data-empty': state.isEmpty,
    'data-multiple': multiple,
    'data-error': !!error,
    tabIndex: focusable && !disabled ? 0 : -1,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown
  }), [semantic, disabled, required, error, focused, isDragging, state.isEmpty, multiple, handleFocus, handleBlur, handleKeyDown]);

  return {
    state,
    handlers: {
      handleFileSelect,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleClickBrowse,
      handleFocus,
      handleBlur,
      handleKeyDown,
      handleClear,
      handleFileRemove
    },
    attributes: semanticAttributes
  };
}

// Export types for external use
export type { UseFileUploadProps, FileUploadState, FileUploadHandlers };