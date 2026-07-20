import { describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { useSemanticMixin, type SemanticMixinProps } from '../src/mixins/SemanticMixin';

type Attributes = Record<string, any>;

/** Harness so the hook runs inside React's render lifecycle. */
function Harness({ props, onResult }: { props: SemanticMixinProps; onResult?: (a: Attributes) => void }) {
  const attributes = useSemanticMixin(props);
  onResult?.(attributes);
  return <div {...attributes} data-testid="node" />;
}

function capture(props: SemanticMixinProps): Attributes {
  let captured: Attributes | null = null;
  render(<Harness props={props} onResult={(a) => (captured = a)} />);
  if (!captured) throw new Error('attributes not captured');
  return captured;
}

describe('useSemanticMixin', () => {
  afterEach(() => cleanup());

  it('returns an empty object for default props (role generic is omitted)', () => {
    const attributes = capture({});
    expect(attributes.role).toBeUndefined();
    expect(attributes['aria-label']).toBeUndefined();
    expect(attributes['aria-disabled']).toBeUndefined();
    expect(attributes['aria-required']).toBeUndefined();
  });

  it('omits role when role is generic', () => {
    const attributes = capture({ role: 'generic' });
    expect(attributes.role).toBeUndefined();
  });

  it('sets role when a non-generic role is provided', () => {
    const attributes = capture({ role: 'button' });
    expect(attributes.role).toBe('button');
  });

  it('maps label to aria-label', () => {
    const attributes = capture({ label: 'Save' });
    expect(attributes['aria-label']).toBe('Save');
  });

  it('omits aria-label when label is empty/undefined', () => {
    const attributes = capture({ label: undefined });
    expect(attributes['aria-label']).toBeUndefined();
  });

  it('maps labelledBy to aria-labelledby', () => {
    const attributes = capture({ labelledBy: 'title-id' });
    expect(attributes['aria-labelledby']).toBe('title-id');
  });

  it('maps describedBy to aria-describedby', () => {
    const attributes = capture({ describedBy: 'desc-id' });
    expect(attributes['aria-describedby']).toBe('desc-id');
  });

  it('sets aria-expanded for both true and false', () => {
    expect(capture({ expanded: true })['aria-expanded']).toBe(true);
    expect(capture({ expanded: false })['aria-expanded']).toBe(false);
    expect(capture({})['aria-expanded']).toBeUndefined();
  });

  it('sets aria-selected for both true and false', () => {
    expect(capture({ selected: true })['aria-selected']).toBe(true);
    expect(capture({ selected: false })['aria-selected']).toBe(false);
    expect(capture({})['aria-selected']).toBeUndefined();
  });

  it('sets aria-disabled only when disabled is true', () => {
    expect(capture({ disabled: true })['aria-disabled']).toBe(true);
    expect(capture({ disabled: false })['aria-disabled']).toBeUndefined();
    expect(capture({})['aria-disabled']).toBeUndefined();
  });

  it('sets aria-required only when required is true', () => {
    expect(capture({ required: true })['aria-required']).toBe(true);
    expect(capture({ required: false })['aria-required']).toBeUndefined();
  });

  it('maps hasPopup boolean true to aria-haspopup', () => {
    expect(capture({ hasPopup: true })['aria-haspopup']).toBe(true);
    expect(capture({ hasPopup: false })['aria-haspopup']).toBe(false);
    expect(capture({})['aria-haspopup']).toBeUndefined();
  });

  it('maps hasPopup string variants to aria-haspopup', () => {
    expect(capture({ hasPopup: 'menu' })['aria-haspopup']).toBe('menu');
    expect(capture({ hasPopup: 'listbox' })['aria-haspopup']).toBe('listbox');
    expect(capture({ hasPopup: 'tree' })['aria-haspopup']).toBe('tree');
    expect(capture({ hasPopup: 'grid' })['aria-haspopup']).toBe('grid');
    expect(capture({ hasPopup: 'dialog' })['aria-haspopup']).toBe('dialog');
  });

  it('maps live to aria-live', () => {
    expect(capture({ live: 'off' })['aria-live']).toBe('off');
    expect(capture({ live: 'polite' })['aria-live']).toBe('polite');
    expect(capture({ live: 'assertive' })['aria-live']).toBe('assertive');
    expect(capture({})['aria-live']).toBeUndefined();
  });

  it('forwards pass-through attributes (aria-*, data-*) untouched', () => {
    const attributes = capture({
      'aria-hidden': true,
      'data-testid': 'node-x',
      id: 'foo',
      custom: 123,
    });
    expect(attributes['aria-hidden']).toBe(true);
    expect(attributes['data-testid']).toBe('node-x');
    expect(attributes.id).toBe('foo');
    expect(attributes.custom).toBe(123);
  });

  it('combines all known fields and pass-through props together', () => {
    const attributes = capture({
      role: 'checkbox',
      label: 'Accept',
      labelledBy: 'l',
      describedBy: 'd',
      expanded: false,
      selected: true,
      disabled: true,
      required: true,
      hasPopup: 'dialog',
      live: 'polite',
      'data-foo': 'bar',
    });
    expect(attributes).toMatchObject({
      role: 'checkbox',
      'aria-label': 'Accept',
      'aria-labelledby': 'l',
      'aria-describedby': 'd',
      'aria-expanded': false,
      'aria-selected': true,
      'aria-disabled': true,
      'aria-required': true,
      'aria-haspopup': 'dialog',
      'aria-live': 'polite',
      'data-foo': 'bar',
    });
  });

  it('memoizes the returned object across re-renders when props are stable', () => {
    let first: Attributes | null = null;
    let second: Attributes | null = null;
    const props = { role: 'button', label: 'Go' } as const;
    const { rerender } = render(
      <Harness props={props} onResult={(a) => (first = a)} />,
    );
    rerender(<Harness props={props} onResult={(a) => (second = a)} />);
    expect(second).toBe(first);
  });
});
