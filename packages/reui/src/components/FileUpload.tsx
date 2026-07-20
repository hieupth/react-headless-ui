/**
 * File Upload renderer component.
 * Provides visual representation for file upload components with drag-and-drop.
 */

import React, { forwardRef, useRef } from 'react';
import { useFileUpload } from '../hooks';
import type { UseFileUploadProps } from '../hooks';

/**
 * File Upload component props
 */
export interface FileUploadProps extends UseFileUploadProps {
  /** Upload area size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Upload area variant */
  variant?: 'outline' | 'filled' | 'ghost';
  /** Show file list */
  showFileList?: boolean;
  /** Show upload progress */
  showProgress?: boolean;
  /** Custom upload button text */
  uploadText?: string;
  /** Custom drag text */
  dragText?: string;
  /** Custom browse button text */
  browseText?: string;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * File Upload component
 */
export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(
  ({
    size = 'md',
    variant = 'outline',
    showFileList = true,
    showProgress = false,
    uploadText = 'Upload files',
    dragText = 'Drag and drop files here',
    browseText = 'Browse files',
    className = '',
    style,
    ...props
  }: FileUploadProps, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {
      state,
      handlers,
      attributes
    } = useFileUpload(props);

    // `FileUploadProps` inherits `[key: string]: unknown` index signatures via
    // SemanticProps/FocusableProps, which widen the destructured locals above to
    // `unknown`/`{}`. Re-bind to the declared prop types so JSX stays typed.
    const sizeVariant: 'sm' | 'md' | 'lg' = size;
    const variantName: 'outline' | 'filled' | 'ghost' = variant;
    const showFileListFlag: boolean = showFileList;
    const showProgressFlag: boolean = showProgress;
    const uploadLabel: string = uploadText;
    const dragLabel: string = dragText;
    const browseLabel: string = browseText;
    const classNameStr: string = className;
    const styleProps: React.CSSProperties | undefined = style;
    const multipleFlag: boolean | undefined = props.multiple;
    const acceptTypes: string | undefined = props.accept;
    const disabledFlag: boolean | undefined = props.disabled;
    const requiredFlag: boolean | undefined = props.required;
    const maxSizeBytes: number | undefined = props.maxSize;
    const maxFilesCount: number | undefined = props.maxFiles;

    // Size classes
    const sizeClasses = {
      sm: 'p-4 text-sm',
      md: 'p-8 text-base',
      lg: 'p-12 text-lg'
    };

    // Variant classes
    const variantClasses = {
      outline: 'border-2 border-dashed border-gray-300 hover:border-gray-400',
      filled: 'border-0 bg-gray-50 hover:bg-gray-100',
      ghost: 'border-0 hover:bg-gray-50'
    };

    // State classes
    const stateClasses = `
      ${state.isDragging ? 'border-blue-500 bg-blue-50' : ''}
      ${state.error ? 'border-red-500 bg-red-50' : ''}
      ${state.disabled ? 'opacity-60 cursor-not-allowed' : ''}
      ${state.focused ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
    `;

    const uploadClasses = `
      relative flex flex-col items-center justify-center
      rounded-lg transition-all duration-200 cursor-pointer
      ${sizeClasses[sizeVariant]}
      ${variantClasses[variantName]}
      ${stateClasses}
      ${disabledFlag ? 'cursor-not-allowed' : 'hover:border-blue-500'}
      ${classNameStr}
    `;

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatFileType = (file: File) => {
      const extension = file.name.split('.').pop()?.toUpperCase();
      const type = file.type.split('/')[0].toUpperCase();
      return extension || type || 'Unknown';
    };

    const handleFileInputClick = () => {
      if (!disabledFlag) {
        fileInputRef.current?.click();
      }
    };

    const handleRemoveFile = (index: number) => {
      handlers.handleFileRemove(index);
    };

    return (
      <div
        ref={ref}
        className={`file-upload-container ${classNameStr}`}
        style={styleProps}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple={multipleFlag}
          accept={acceptTypes}
          disabled={disabledFlag}
          required={requiredFlag}
          className="hidden"
          onChange={(e) => handlers.handleFileSelect(e.target.files)}
          onFocus={handlers.handleFocus}
          onBlur={handlers.handleBlur}
          onKeyDown={handlers.handleKeyDown}
        />

        {/* Upload Area */}
        <div
          className={uploadClasses}
          onClick={handleFileInputClick}
          onDragOver={handlers.handleDragOver}
          onDragLeave={handlers.handleDragLeave}
          onDrop={handlers.handleDrop}
          {...attributes}
          role="button"
          tabIndex={disabledFlag ? -1 : 0}
          aria-label="Upload files"
          aria-describedby={state.error ? 'file-upload-error' : undefined}
          aria-disabled={disabledFlag}
          aria-required={requiredFlag}
        >
          {/* Upload Icon */}
          <div className="mb-4">
            {state.isDragging ? (
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            ) : (
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>

          {/* Upload Text */}
          <div className="text-center">
            <p className={`font-medium ${state.disabled ? 'text-gray-400' : 'text-gray-700'}`}>
              {state.isDragging ? 'Drop files here' : uploadLabel}
            </p>
            <p className={`text-sm mt-2 ${state.disabled ? 'text-gray-400' : 'text-gray-500'}`}>
              {dragLabel}
            </p>
            <p className={`text-sm mt-1 ${state.disabled ? 'text-gray-400' : 'text-blue-600'}`}>
              {browseLabel}
            </p>
          </div>

          {/* Requirements */}
          {(maxSizeBytes || maxFilesCount || acceptTypes) && (
            <div className="text-xs text-gray-500 mt-4 text-center">
              {maxSizeBytes && (
                <p>Maximum file size: {formatFileSize(maxSizeBytes)}</p>
              )}
              {maxFilesCount && multipleFlag && (
                <p>Maximum files: {maxFilesCount}</p>
              )}
              {acceptTypes && (
                <p>Accepted types: {acceptTypes}</p>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {state.error && (
          <div id="file-upload-error" className="mt-2 text-sm text-red-600" role="alert">
            {state.error}
          </div>
        )}

        {/* File List */}
        {showFileListFlag && state.files.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              Files ({state.files.length})
            </h4>
            <div className="space-y-2">
              {state.files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  role="listitem"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {/* File Icon */}
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileType(file)} • {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600 rounded"
                    onClick={() => handleRemoveFile(index)}
                    aria-label={`Remove ${file.name}`}
                    disabled={disabledFlag}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Indicator (placeholder) — showProgress prop is accepted but
            the progress UI is intentionally disabled (feature not yet wired up). */}
        {/* reason: dead block — original `showProgressFlag && false && (...)` could never render. */}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';

export default FileUpload;