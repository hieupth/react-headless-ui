/**
 * Dialog renderer component using headless useDialog hook.
 * Provides styled modal dialog with focus trap and accessibility.
 */

import React, { forwardRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDialog } from '../hooks';
import { Button } from './Button';
import type { UseDialogProps } from '../hooks';

/**
 * Strips a `[key: string]: unknown` index signature from `T`, keeping only its
 * explicitly-declared (literal-keyed) members. The mixin prop interfaces that
 * `UseDialogProps` extends each carry such an index signature; when inherited,
 * it causes every destructured named prop binding to widen to `unknown`. This
 * rebuilds the prop type from the named fields only so bindings stay typed.
 */
type WithNamedKeysOnly<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K];
};

export interface DialogProps extends WithNamedKeysOnly<UseDialogProps> {
  /** Dialog content */
  children?: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Dialog title */
  title?: string;
  /** Dialog description */
  description?: string;
  /** Dialog footer content */
  footer?: React.ReactNode;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Show close button */
  showCloseButton?: boolean;
  /** Custom render function */
  render?: (props: DialogRenderProps) => React.ReactElement;
  /** Custom overlay render function */
  renderOverlay?: (props: DialogOverlayRenderProps) => React.ReactElement;
  /** Custom content render function */
  renderContent?: (props: DialogContentRenderProps) => React.ReactElement;
}

export interface DialogRenderProps {
  /** Computed class names */
  className: string;
  /** Dialog state */
  open: boolean;
  focused: boolean;
  focusTrapped: boolean;
  /** Event handlers */
  openDialog: () => void;
  closeDialog: () => void;
  confirm: () => void;
  cancel: () => void;
  handleOverlayClick: (event: React.MouseEvent) => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Semantic attributes */
  semanticAttributes: Record<string, any>;
  overlayAttributes: Record<string, any>;
  titleAttributes: Record<string, any>;
  descriptionAttributes: Record<string, any>;
  /** References */
  dialogRef: React.RefObject<HTMLDivElement | null>;
  overlayRef: React.RefObject<HTMLDivElement | null>;
  /** Children */
  children: React.ReactNode;
}

export interface DialogOverlayRenderProps {
  /** Overlay attributes */
  attributes: Record<string, any>;
  /** Reference */
  ref: React.RefObject<HTMLDivElement | null>;
  /** Click handler */
  onClick: (event: React.MouseEvent) => void;
}

export interface DialogContentRenderProps {
  /** Content attributes */
  attributes: Record<string, any>;
  /** Reference */
  ref: React.RefObject<HTMLDivElement | null>;
  /** Children content */
  children: React.ReactNode;
}

/**
 * Styled dialog component with comprehensive behavior.
 * Uses headless hook for all logic and accessibility.
 */
export const Dialog = forwardRef<HTMLDivElement, DialogProps>(({
  className,
  style,
  title,
  description,
  footer,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showCloseButton = true,
  render,
  renderOverlay,
  renderContent,
  onConfirm,
  onCancel,
  children,
  ...dialogProps
}, ref) => {
  const dialog = useDialog({
    ...dialogProps,
    onConfirm,
    onCancel
  });

  // Default overlay render
  const defaultOverlayRender = (props: DialogOverlayRenderProps) => {
    return (
      <div
        ref={props.ref}
        {...props.attributes}
        className="dialog-overlay"
      />
    );
  };

  // Default content render
  const defaultContentRender = (props: DialogContentRenderProps) => {
    return (
      <div
        ref={props.ref}
        {...props.attributes}
        className={`dialog-content ${className || ''}`}
        style={style}
      >
        {title && (
          <div className="dialog-header">
            <h2 {...dialog.titleAttributes} className="dialog-title">
              {title}
            </h2>
            {showCloseButton && (
              <button
                className="dialog-close-button"
                aria-label="Close dialog"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        )}

        {description && (
          <p {...dialog.descriptionAttributes} className="dialog-description">
            {description}
          </p>
        )}

        <div className="dialog-body">
          {children}
        </div>

        {footer && (
          <div className="dialog-footer">
            {footer}
          </div>
        )}

        {!footer && (onConfirm || onCancel) && (
          <div className="dialog-actions">
            {onCancel && (
              <Button
                className="dialog-button dialog-button-cancel"
                onPress={dialog.cancel}
              >
                {cancelText}
              </Button>
            )}
            {onConfirm && (
              <Button
                className="dialog-button dialog-button-confirm"
                onPress={dialog.confirm}
              >
                {confirmText}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Default render function
  const defaultRender = (props: DialogRenderProps) => {
    if (!props.open) {
      return null;
    }

    return createPortal(
      <div className="dialog-portal">
        {renderOverlay ? renderOverlay({
          attributes: props.overlayAttributes,
          ref: props.overlayRef,
          onClick: props.handleOverlayClick
        }) : defaultOverlayRender({
          attributes: props.overlayAttributes,
          ref: props.overlayRef,
          onClick: props.handleOverlayClick
        })}

        {renderContent ? renderContent({
          attributes: props.semanticAttributes,
          ref: props.dialogRef,
          children
        }) : defaultContentRender({
          attributes: props.semanticAttributes,
          ref: props.dialogRef,
          children
        })}
      </div>,
      document.body
    );
  };

  // Render props
  const renderProps: DialogRenderProps = {
    className: className || '',
    open: dialog.open,
    focused: dialog.focused,
    focusTrapped: dialog.focusTrapped,
    openDialog: dialog.openDialog,
    closeDialog: dialog.closeDialog,
    confirm: dialog.confirm,
    cancel: dialog.cancel,
    handleOverlayClick: dialog.handleOverlayClick,
    handleKeyDown: dialog.handleKeyDown,
    semanticAttributes: dialog.semanticAttributes,
    overlayAttributes: dialog.overlayAttributes,
    titleAttributes: dialog.titleAttributes,
    descriptionAttributes: dialog.descriptionAttributes,
    dialogRef: dialog.dialogRef,
    overlayRef: dialog.overlayRef,
    children
  };

  // Use custom render if provided, otherwise use default render
  if (render) {
    return render(renderProps);
  }

  return defaultRender(renderProps);
});

Dialog.displayName = 'Dialog';