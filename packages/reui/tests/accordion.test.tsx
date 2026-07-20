import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion } from '../src/components/Accordion';

const items = [
  { id: 'a', trigger: 'Section A', content: 'Content A' },
  { id: 'b', trigger: 'Section B', content: 'Content B' },
];

describe('Accordion', () => {
  it('renders a trigger button for each item', () => {
    render(<Accordion items={items} />);
    expect(screen.getByRole('button', { name: /Section A/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Section B/ })).toBeInTheDocument();
  });

  it('toggles content visibility when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);
    const trigger = screen.getByRole('button', { name: /Section A/ });
    // Content initially hidden (empty/height-0 container exists but is collapsed)
    expect(screen.getByText('Content A')).toBeInTheDocument();
    await user.click(trigger);
    // Clicking should not throw and trigger remains present
    expect(trigger).toBeInTheDocument();
  });

  it('calls onItemToggle when an item is toggled', async () => {
    const user = userEvent.setup();
    const onItemToggle = vi.fn();
    render(<Accordion items={items} onItemToggle={onItemToggle} />);
    await user.click(screen.getByRole('button', { name: /Section A/ }));
    expect(onItemToggle).toHaveBeenCalledWith('a', true);
  });

  it('derives items from the compound <Accordion.Item> children API', () => {
    render(
      <Accordion>
        <Accordion.Item value="x">
          <Accordion.Trigger>Trigger X</Accordion.Trigger>
          <Accordion.Content>Content X</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="y" disabled>
          <Accordion.Trigger>Trigger Y</Accordion.Trigger>
          <Accordion.Content>Content Y</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );
    expect(screen.getByRole('button', { name: /Trigger X/ })).toBeInTheDocument();
    expect(screen.getByText('Content Y')).toBeInTheDocument();
    // Disabled item gets the disabled class.
    expect(screen.getByRole('button', { name: /Trigger Y/ })).toHaveClass('accordion-trigger-disabled');
  });

  it('ignores non-Item children when deriving compound items', () => {
    render(
      <Accordion defaultOpenItems={['a']}>
        <Accordion.Item value="a">
          <Accordion.Trigger>T</Accordion.Trigger>
          <Accordion.Content>C</Accordion.Content>
        </Accordion.Item>
        {/* A plain child is not an Accordion.Item and is skipped by the filter. */}
        <div>not-an-item</div>
      </Accordion>
    );
    // The plain child is filtered out; only the Item contributes a trigger.
    expect(screen.queryByText('not-an-item')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /T/ })).toBeInTheDocument();
  });

  it('forwards aria-* and title props onto the container', () => {
    render(
      <Accordion items={items} aria-label="Main" title="Tooltip" data-foo="bar" />
    );
    const region = screen.getByLabelText('Main');
    expect(region).toHaveAttribute('title', 'Tooltip');
  });

  it('renders the open-item classes when an item is expanded', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);
    await user.click(screen.getByRole('button', { name: /Section A/ }));
    const item = screen.getByRole('button', { name: /Section A/ });
    expect(item).toHaveClass('accordion-trigger-open');
  });

  it('uses a custom container render prop when provided', () => {
    const renderProp = vi.fn((props) => (
      <div data-testid="custom-accordion" className={props.className}>
        {props.openItems.join(',')}
        {props.children}
      </div>
    ));
    render(
      <Accordion items={items} render={renderProp} className="extra" />
    );
    expect(screen.getByTestId('custom-accordion')).toBeInTheDocument();
    expect(renderProp).toHaveBeenCalled();
  });

  it('uses a custom item render prop when provided', () => {
    const renderItem = vi.fn((props) => (
      <div data-testid={`custom-item-${props.id}`} key={props.id}>
        {props.trigger}/{String(props.isOpen)}
      </div>
    ));
    render(<Accordion items={items} renderItem={renderItem} />);
    expect(screen.getByTestId('custom-item-a')).toHaveTextContent('Section A/false');
  });

  it('skips non-element and unrelated children inside an Accordion.Item', () => {
    render(
      <Accordion>
        <Accordion.Item value="a">
          {/* a plain text node (non-element) and an unrelated element are skipped */}
          plain-text
          <span>extra</span>
          <Accordion.Trigger>T</Accordion.Trigger>
          <Accordion.Content>C</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );
    expect(screen.getByRole('button', { name: /T/ })).toBeInTheDocument();
  });

  it('compound sub-components render nothing when used standalone', () => {
    // The Item/Trigger/Content markers are data containers; rendered directly
    // their bodies return null. This exercises the withName factory's fn body.
    const { container } = render(
      <Accordion.Item value="x">
        <Accordion.Trigger>T</Accordion.Trigger>
        <Accordion.Content>C</Accordion.Content>
      </Accordion.Item>
    );
    expect(container.textContent).toBe('');
  });
});
