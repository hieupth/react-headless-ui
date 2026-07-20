import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  CardSubtitle,
  CardDescription,
} from '../src/components/Card';
import { useCard } from '../src/hooks';

describe('Card', () => {
  it('renders title, subtitle and children inside an article', () => {
    render(
      <Card title="My Card" subtitle="A subtitle" description="A description">
        <p>Body content</p>
      </Card>
    );
    expect(screen.getByText('My Card')).toBeInTheDocument();
    expect(screen.getByText('A subtitle')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('renders as an article when not interactive', () => {
    render(<Card title="Static">Body</Card>);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('renders as a button and fires onClick when interactive', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Card interactive onClick={onClick}>Clickable card</Card>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('fires onClick via keyboard Enter when interactive', () => {
    const onClick = vi.fn();
    render(<Card interactive onClick={onClick}>Card</Card>);
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled and interactive', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Card interactive disabled onClick={onClick}>Card</Card>);
    // Disabled interactive cards keep role=button but ignore clicks.
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders a footer when provided', () => {
    render(<Card title="T" footer={<span>Footer text</span>}>Body</Card>);
    expect(screen.getByText('Footer text')).toBeInTheDocument();
  });

  it('renders header actions when provided', () => {
    render(
      <Card title="T" actions={<button>Action</button>}>Body</Card>
    );
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('omits the header when no title or actions are present', () => {
    const { container } = render(<Card>Body</Card>);
    expect(container.querySelector('h3')).toBeNull();
  });

  it('toggles selection via onSelectionChange', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <Card interactive onSelectionChange={onSelectionChange}>Selectable</Card>
    );
    await user.click(screen.getByRole('button'));
    expect(onSelectionChange).toHaveBeenCalledWith(true);
  });

  it('uses a custom render function', () => {
    render(
      <Card title="T" render={() => <article data-testid="custom-card">Custom</article>}>Body</Card>
    );
    expect(screen.getByTestId('custom-card')).toBeInTheDocument();
  });

  it('uses custom renderHeader / renderBody / renderFooter', () => {
    render(
      <Card
        title="T"
        footer="F"
        renderHeader={() => <div data-testid="h">H</div>}
        renderBody={() => <div data-testid="b">B</div>}
        renderFooter={() => <div data-testid="f">F2</div>}
      >
        Body
      </Card>
    );
    expect(screen.getByTestId('h')).toBeInTheDocument();
    expect(screen.getByTestId('b')).toBeInTheDocument();
    expect(screen.getByTestId('f')).toBeInTheDocument();
  });
});

describe('Card section components', () => {
  it('CardHeader/CardBody/CardFooter render children', () => {
    render(
      <article>
        <CardHeader><span>H</span></CardHeader>
        <CardBody><span>B</span></CardBody>
        <CardFooter><span>F</span></CardFooter>
      </article>
    );
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
  });

  it('CardTitle/CardSubtitle/CardDescription render text', () => {
    render(
      <>
        <CardTitle>Title</CardTitle>
        <CardSubtitle>Subtitle</CardSubtitle>
        <CardDescription>Description</CardDescription>
      </>
    );
    expect(screen.getByText('Title').tagName).toBe('H3');
    expect(screen.getByText('Subtitle').tagName).toBe('P');
    expect(screen.getByText('Description').tagName).toBe('P');
  });
});

describe('useCard', () => {
  it('computes variant and size classes', () => {
    let result: any;
    const Probe = () => {
      result = useCard({ variant: 'elevated', size: 'lg' });
      return null;
    };
    render(<Probe />);
    expect(result.variantClasses).toContain('shadow-md');
    expect(result.sizeClasses).toContain('p-8');
  });

  it('toggleSelection fires onSelectionChange', () => {
    const onSelectionChange = vi.fn();
    let result: any;
    const Probe = () => {
      result = useCard({ onSelectionChange });
      return null;
    };
    render(<Probe />);
    result.toggleSelection();
    expect(onSelectionChange).toHaveBeenCalledWith(true);
  });

  it('handleClick is a no-op when not interactive', () => {
    const onClick = vi.fn();
    let result: any;
    const Probe = () => {
      result = useCard({ onClick });
      return null;
    };
    render(<Probe />);
    result.handleClick({ preventDefault: () => {} } as any);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards a function ref to the root node', () => {
    const refFn = vi.fn();
    render(<Card ref={refFn}>x</Card>);
    expect(refFn).toHaveBeenCalledWith(expect.objectContaining({ tagName: 'DIV' }));
  });

  it('forwards an object ref to the root node', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<Card ref={ref}>x</Card>);
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('falls back to the "card" id prefix when role is generic/absent', () => {
    const { container } = render(
      <Card role="generic" title="T" description="D">x</Card>
    );
    expect(container.querySelector('#card-title')).not.toBeNull();
    expect(container.querySelector('#card-description')).not.toBeNull();
  });

  it('applies the hover lift classes when hovered on a hoverable card', () => {
    const { container } = render(
      <Card hoverable interactive title="T">x</Card>
    );
    const root = container.firstChild as HTMLElement;
    fireEvent.mouseEnter(root);
    expect((root.className)).toContain('shadow-lg');
  });

  it('applies focus ring classes when an interactive card is focused', () => {
    const { container } = render(
      <Card interactive defaultFocused title="T">x</Card>
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('ring-blue-500');
  });
});
