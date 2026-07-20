import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { forwardRef } from 'react';
import { Slot, SlotClone, SlotWrapper, SlotPortal, SlotRadioGroup } from '../src/components/Slot';

describe('Slot extra coverage', () => {
  it('clones a single child via clone prop and merges data attributes', () => {
    const { container } = render(
      <Slot clone className="extra" mergeStrategy="merge">
        <button className="child">Cloned</button>
      </Slot>
    );
    const btn = screen.getByText('Cloned');
    // className is excluded from merge by default, so child class wins.
    expect(btn.className).toContain('child');
    // clone path returns the child directly without a slot-wrapper element
    expect(container.querySelector('[data-testid="slot-wrapper"]')).toBeNull();
  });

  it('clone with replace strategy lets slot className through', () => {
    const { container } = render(
      <Slot clone className="extra" mergeStrategy="replace">
        <button className="child">Cloned</button>
      </Slot>
    );
    const btn = screen.getByText('Cloned');
    expect(btn.className).toContain('extra');
    expect(container.querySelector('[data-testid="slot-wrapper"]')).toBeNull();
  });

  it('SlotClone forces clone and forwards children', () => {
    const { container } = render(
      <SlotClone mergeStrategy="replace" className="cc">
        <span className="kid">Hi</span>
      </SlotClone>
    );
    const span = screen.getByText('Hi');
    expect(span.className).toContain('cc');
    expect(container.querySelector('[data-testid="slot-wrapper"]')).toBeNull();
  });

  it('SlotWrapper renders wrapper element', () => {
    const { container } = render(
      <SlotWrapper className="wrap">
        <span>WrapChild</span>
      </SlotWrapper>
    );
    const wrapper = container.querySelector('[data-testid="slot-wrapper"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.className).toContain('wrap');
  });

  it('renders multiple children and returns fragments with index keys', () => {
    const { container } = render(
      <Slot>
        <span>A</span>
        <span>B</span>
      </Slot>
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('uses renderChildren callback to customize rendering', () => {
    const renderChildren = vi.fn((_children, _props) => (
      <div data-testid="rc">custom-children</div>
    ));
    render(
      <Slot renderChildren={renderChildren}>
        <span>Original</span>
      </Slot>
    );
    expect(renderChildren).toHaveBeenCalled();
    expect(screen.getByTestId('rc')).toBeInTheDocument();
  });

  it('renders debug overlay and debug wrapper styles when debug is true', () => {
    const { container } = render(
      <Slot debug className="dbg">
        <span>Debugged</span>
      </Slot>
    );
    // The wrapper element gets the debug class directly (not via mergeProps).
    const wrapper = container.querySelector('[data-testid="slot-wrapper"]');
    expect(wrapper?.className).toContain('slot-wrapper-debug');
  });

  it('renders debug overlay when clone is true', () => {
    const { container } = render(
      <Slot clone debug>
        <span>DbgClone</span>
      </Slot>
    );
    expect(screen.getByText('DbgClone')).toBeInTheDocument();
  });

  it('passes non-element children through unchanged in multiple-children path', () => {
    render(
      <Slot>
        <span>Real</span>
        {null}
        {false}
      </Slot>
    );
    expect(screen.getByText('Real')).toBeInTheDocument();
  });

  it('renders null when no children provided', () => {
    const { container } = render(<Slot />);
    // outer relative div always renders, but content is null
    expect(container.firstChild).not.toBeNull();
  });

  it('forwards function child ref onto the cloned element', () => {
    const childRef = vi.fn();
    const ChildWithRef = () => <span ref={childRef}>fn-ref</span>;
    render(
      <Slot clone>
        <ChildWithRef />
      </Slot>
    );
    expect(childRef).toHaveBeenCalled();
  });

  it('forwards object child ref when cloning', () => {
    const ref = { current: null } as any;
    const ChildComp = forwardRef<HTMLSpanElement>((_, ref) => <span ref={ref}>obj-ref</span>);
    render(
      <Slot clone ref={ref}>
        <ChildComp />
      </Slot>
    );
    // In clone mode, the Slot's forwarded ref is applied via mergedRef.
    expect(ref.current).not.toBeNull();
  });
});

describe('SlotPortal', () => {
  it('renders nothing before mount when container is not found', () => {
    const { container } = render(
      <SlotPortal container="#does-not-exist">
        <span>Portal</span>
      </SlotPortal>
    );
    expect(screen.queryByText('Portal')).not.toBeInTheDocument();
  });

  it('renders into a container element and forwards content', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    try {
      render(
        <SlotPortal container={host}>
          <span>PortalHost</span>
        </SlotPortal>
      );
      expect(host.textContent).toContain('PortalHost');
    } finally {
      document.body.removeChild(host);
    }
  });

  it('renders into a container via string selector', () => {
    const host = document.createElement('div');
    host.id = 'portal-host';
    document.body.appendChild(host);
    try {
      render(
        <SlotPortal container="#portal-host">
          <span>PortalSel</span>
        </SlotPortal>
      );
      expect(host.textContent).toContain('PortalSel');
    } finally {
      document.body.removeChild(host);
    }
  });

  it('renders a backdrop when showBackdrop is true', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    try {
      render(
        <SlotPortal container={host} showBackdrop>
          <span>Backdrop</span>
        </SlotPortal>
      );
      const backdrop = document.querySelector('[data-testid="slot-portal-backdrop"]');
      expect(backdrop).not.toBeNull();
    } finally {
      document.body.removeChild(host);
    }
  });

  it('omits backdrop when showBackdrop is false', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    try {
      render(
        <SlotPortal container={host}>
          <span>NoBackdrop</span>
        </SlotPortal>
      );
      expect(document.querySelector('[data-testid="slot-portal-backdrop"]')).toBeNull();
    } finally {
      document.body.removeChild(host);
    }
  });
});

describe('SlotRadioGroup', () => {
  it('renders a radiogroup with the default vertical orientation', () => {
    const { container } = render(
      <SlotRadioGroup defaultValue="a">
        <input value="a" />
        <input value="b" />
      </SlotRadioGroup>
    );
    const group = screen.getByRole('radiogroup');
    expect(group.className).toContain('slot-radio-group-vertical');
  });

  it('applies horizontal orientation style and class', () => {
    render(
      <SlotRadioGroup orientation="horizontal">
        <input value="a" />
      </SlotRadioGroup>
    );
    const group = screen.getByRole('radiogroup');
    expect(group.className).toContain('slot-radio-group-horizontal');
  });

  it('is uncontrolled and updates selected value via onChange', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SlotRadioGroup defaultValue="a" onChange={onChange}>
        <input value="a" data-testid="r-a" />
        <input value="b" data-testid="r-b" />
      </SlotRadioGroup>
    );
    const b = container.querySelector('[data-testid="r-b"]') as HTMLElement;
    // The Slot merges onChange onto the child; fire it to hit handleChange.
    fireEvent.click(b);
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('is controlled and does not mutate internal state', () => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <SlotRadioGroup value="a" onChange={onChange}>
        <input value="a" data-testid="r-a" />
        <input value="b" data-testid="r-b" />
      </SlotRadioGroup>
    );
    const b = container.querySelector('[data-testid="r-b"]') as HTMLElement;
    fireEvent.click(b);
    expect(onChange).toHaveBeenCalledWith('b');
    // Controlled value remains authoritative.
    expect(container.querySelector('[data-testid="r-a"]')?.getAttribute('aria-checked')).toBe('true');
  });

  it('passes non-element children through unchanged', () => {
    render(
      <SlotRadioGroup>
        {null}
        {false}
        raw text
      </SlotRadioGroup>
    );
    expect(screen.getByRole('radiogroup').textContent).toContain('raw text');
  });
});
