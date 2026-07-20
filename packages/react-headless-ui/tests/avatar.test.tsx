import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Avatar } from '../src/components/Avatar';
import { useAvatar } from '../src/hooks';

describe('Avatar', () => {
  it('renders fallback text when no src is provided', () => {
    render(<Avatar fallback="John Doe" alt="John Doe" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders an img when src is provided', () => {
    render(<Avatar src="/john.png" alt="John" fallback="John" />);
    const imgs = screen.getAllByRole('img');
    const rendered = imgs.find((el) => el.tagName === 'IMG') ?? imgs[0];
    expect(rendered).toHaveAttribute('src', '/john.png');
  });

  it('fires onClick when clickable avatar is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Avatar clickable fallback="AB" alt="AB" onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('fires onClick on Enter for a clickable avatar', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Avatar clickable fallback="AB" alt="AB" onClick={onClick} />);
    const avatar = screen.getByRole('button');
    avatar.focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalled();
  });

  it('shows fallback when the image fails to load', () => {
    render(<Avatar src="/broken.png" alt="Jane Doe" fallback="JD" />);
    const img = screen.getByAltText('Jane Doe');
    fireEvent.error(img);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('hides loading state when the image loads', () => {
    const onImageLoad = vi.fn();
    render(<Avatar src="/ok.png" alt="Jane" fallback="J" onImageLoad={onImageLoad} />);
    const img = screen.getByAltText('Jane');
    fireEvent.load(img);
    expect(onImageLoad).toHaveBeenCalled();
  });

  it('fires onImageError when the image errors', () => {
    const onImageError = vi.fn();
    render(<Avatar src="/bad.png" alt="Jane" onImageError={onImageError} />);
    fireEvent.error(screen.getByAltText('Jane'));
    expect(onImageError).toHaveBeenCalled();
  });

  it('does not fire onClick when not clickable', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Avatar fallback="X" alt="X" onClick={onClick} />);
    // No button role when not clickable.
    expect(screen.queryByRole('button')).toBeNull();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders children overlay content', () => {
    render(
      <Avatar src="/a.png" alt="A" fallback="A">
        <span data-testid="overlay">★</span>
      </Avatar>
    );
    expect(screen.getByTestId('overlay')).toBeInTheDocument();
  });

  it('uses a custom render function', () => {
    render(
      <Avatar
        alt="Custom"
        fallback="C"
        render={(props) => <div data-testid="custom-avatar">{props.fallbackText}</div>}
      />
    );
    expect(screen.getByTestId('custom-avatar')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('uses a custom fallback render function', () => {
    render(
      <Avatar
        alt="NoImg"
        renderFallback={() => <span data-testid="custom-fallback">FB</span>}
      />
    );
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
  });
});

describe('useAvatar', () => {
  it('derives initials from alt when no fallback is provided', () => {
    let result: any;
    const Probe = () => { result = useAvatar({ alt: 'John Doe' }); return null; };
    render(<Probe />);
    expect(result.fallbackText).toBe('JD');
  });

  it('returns ? when no alt or fallback is available', () => {
    let result: any;
    const Probe = () => { result = useAvatar({}); return null; };
    render(<Probe />);
    expect(result.fallbackText).toBe('?');
  });

  it('takes the first two chars for a single-word alt', () => {
    let result: any;
    const Probe = () => { result = useAvatar({ alt: 'Admin' }); return null; };
    render(<Probe />);
    expect(result.fallbackText).toBe('AD');
  });

  it('computes size classes per size', () => {
    const sizes = ['sm', 'md', 'lg', 'xl', '2xl'] as const;
    for (const size of sizes) {
      let result: any;
      const Probe = () => { result = useAvatar({ size }); return null; };
      const { unmount } = render(<Probe />);
      expect(result.sizeClasses).toContain(`w-`);
      unmount();
    }
  });
});
