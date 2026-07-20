import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Separator } from '../src/components/Separator';
import { useSeparator } from '../src/hooks';

describe('Separator', () => {
  it('renders a horizontal separator by default', () => {
    const { container } = render(<Separator />);
    expect(container.firstChild).not.toBeNull();
    expect(container.querySelector('.separator-horizontal')).not.toBeNull();
  });

  it('renders content separators with children text', () => {
    render(<Separator>Section</Separator>);
    expect(screen.getByText('Section')).toBeInTheDocument();
  });

  it('renders an <hr> element for a plain horizontal separator', () => {
    const { container } = render(<Separator orientation="horizontal" />);
    expect(container.querySelector('hr')).not.toBeNull();
  });

  it('renders a <div> for a plain vertical separator', () => {
    const { container } = render(<Separator orientation="vertical" />);
    expect(container.querySelector('div.separator-vertical')).not.toBeNull();
    expect(container.querySelector('hr')).toBeNull();
  });

  it('renders as a div when it has content regardless of orientation', () => {
    const { container } = render(<Separator orientation="vertical">Label</Separator>);
    expect(container.querySelector('.separator-with-content')).not.toBeNull();
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('marks decorative separators as aria-hidden', () => {
    const { container } = render(<Separator decorative />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('exposes a semantic separator role when not decorative', () => {
    const { container } = render(<Separator decorative={false} />);
    expect(container.firstChild).toHaveAttribute('role', 'separator');
    expect(container.firstChild).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('renders left and right lines around content', () => {
    const { container } = render(<Separator>Divider</Separator>);
    expect(container.querySelector('.separator-line-left')).not.toBeNull();
    expect(container.querySelector('.separator-line-right')).not.toBeNull();
    expect(container.querySelector('.separator-content')).not.toBeNull();
  });
});

describe('useSeparator', () => {
  it('computes hasContent from children', () => {
    let result: any;
    const Probe = () => {
      result = useSeparator({ children: 'Hi' });
      return null;
    };
    render(<Probe />);
    expect(result.state.hasContent).toBe(true);
    expect(result.props.as).toBe('div');
  });

  it('picks hr for plain horizontal and div for vertical', () => {
    let horizontal: any;
    let vertical: any;
    const ProbeH = () => { horizontal = useSeparator({ orientation: 'horizontal' }); return null; };
    const ProbeV = () => { vertical = useSeparator({ orientation: 'vertical' }); return null; };
    render(<><ProbeH /><ProbeV /></>);
    expect(horizontal.props.as).toBe('hr');
    expect(vertical.props.as).toBe('div');
  });

  it('defaults to decorative and role none', () => {
    let result: any;
    const Probe = () => { result = useSeparator({}); return null; };
    render(<Probe />);
    expect(result.state.decorative).toBe(true);
    expect(result.props.role).toBe('none');
  });
});
