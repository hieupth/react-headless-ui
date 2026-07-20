import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload } from '../src/components/FileUpload';
import { useFileUpload } from '../src/hooks';

// jsdom does not implement DataTransfer; polyfill a minimal shim.
class DTShim {
  items: { add: (f: File) => void }[] = [];
  files: File[] = [];
  add(f: File) { this.files.push(f); }
}
function getDataTransfer(): any {
  if (typeof (globalThis as any).DataTransfer === 'function') {
    return new (globalThis as any).DataTransfer();
  }
  return new DTShim() as any;
}

function makeFile(name: string, type: string, size = 100): File {
  const content = new Array(size + 1).join('x');
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

function fileInput(container: HTMLElement): HTMLInputElement {
  return container.querySelector('input[type="file"]') as HTMLInputElement;
}

async function upload(user: ReturnType<typeof userEvent.setup>, input: HTMLInputElement, files: File | File[]) {
  await user.upload(input, files);
}

describe('FileUpload', () => {
  it('renders the upload area with configured text', () => {
    render(<FileUpload uploadText="Upload files" dragText="Drop here" />);
    expect(screen.getByText('Upload files')).toBeInTheDocument();
    expect(screen.getByText('Drop here')).toBeInTheDocument();
  });

  it('exposes a hidden file input', () => {
    const { container } = render(<FileUpload />);
    expect(fileInput(container)).toBeInTheDocument();
  });

  it('selects a file via the file input and lists it', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileUpload multiple />);
    await upload(user, fileInput(container), makeFile('note.txt', 'text/plain'));
    expect(screen.getByText('note.txt')).toBeInTheDocument();
  });

  it('adds multiple files in multiple mode', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileUpload multiple />);
    await upload(user, fileInput(container), [makeFile('a.txt', 'text/plain'), makeFile('b.txt', 'text/plain')]);
    expect(screen.getByText('a.txt')).toBeInTheDocument();
    expect(screen.getByText('b.txt')).toBeInTheDocument();
  });

  it('replaces the file in single mode', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileUpload />);
    await upload(user, fileInput(container), makeFile('first.txt', 'text/plain'));
    await upload(user, fileInput(container), makeFile('second.txt', 'text/plain'));
    expect(screen.queryByText('first.txt')).not.toBeInTheDocument();
    expect(screen.getByText('second.txt')).toBeInTheDocument();
  });

  it('removes a file via the remove button', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileUpload multiple />);
    await upload(user, fileInput(container), makeFile('gone.txt', 'text/plain'));
    fireEvent.click(screen.getByRole('button', { name: /Remove gone.txt/i }));
    expect(screen.queryByText('gone.txt')).not.toBeInTheDocument();
  });

  it('rejects files larger than maxSize and shows an error', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileUpload maxSize={50} />);
    await upload(user, fileInput(container), makeFile('big.txt', 'text/plain', 200));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('rejects files smaller than minSize', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileUpload minSize={1000} />);
    await upload(user, fileInput(container), makeFile('tiny.txt', 'text/plain', 10));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('accepts files matching accept by extension (.png)', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileUpload accept=".png" />);
    await upload(user, fileInput(container), makeFile('pic.png', 'image/png'));
    expect(screen.getByText('pic.png')).toBeInTheDocument();
  });

  it('accepts files matching accept by MIME prefix (image/*)', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileUpload accept="image/*" />);
    await upload(user, fileInput(container), makeFile('pic.png', 'image/png'));
    expect(screen.getByText('pic.png')).toBeInTheDocument();
  });

  it('accepts files matching accept by exact MIME type', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileUpload accept="text/plain" />);
    await upload(user, fileInput(container), makeFile('ok.txt', 'text/plain'));
    expect(screen.getByText('ok.txt')).toBeInTheDocument();
  });

  it('limits number of files in multiple mode with maxFiles', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileUpload multiple maxFiles={1} />);
    await upload(user, fileInput(container), [makeFile('a.txt', 'text/plain'), makeFile('b.txt', 'text/plain')]);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('handles drag over / drag leave / drop via the upload area', async () => {
    const onDrop = vi.fn();
    const { container } = render(<FileUpload onDrop={onDrop} />);
    const dropZone = container.querySelector('div[role="button"]') as Element;
    fireEvent.dragOver(dropZone);
    fireEvent.dragLeave(dropZone);
    const dt = getDataTransfer();
    dt.add(makeFile('dropped.txt', 'text/plain'));
    fireEvent.drop(dropZone, { dataTransfer: dt });
    expect(onDrop).toHaveBeenCalled();
    expect(screen.getByText('dropped.txt')).toBeInTheDocument();
  });

  it('fires onChange with the selected file', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<FileUpload onChange={onChange} />);
    await upload(user, fileInput(container), makeFile('cb.txt', 'text/plain'));
    expect(onChange).toHaveBeenCalled();
  });

  it('fires onError when validation fails', async () => {
    const onError = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<FileUpload maxSize={10} onError={onError} />);
    await upload(user, fileInput(container), makeFile('big.txt', 'text/plain', 200));
    expect(onError).toHaveBeenCalled();
  });

  it('supports a controlled value', () => {
    const file = makeFile('controlled.txt', 'text/plain');
    render(<FileUpload value={file} />);
    expect(screen.getByText('controlled.txt')).toBeInTheDocument();
  });

  it('disables interactions when disabled', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileUpload disabled maxSize={5} />);
    await upload(user, fileInput(container), makeFile('x.txt', 'text/plain', 200));
    expect(screen.queryByText('x.txt')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('runs custom validate returning a string error', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileUpload validate={() => 'custom failure'} />);
    await upload(user, fileInput(container), makeFile('c.txt', 'text/plain'));
    expect(screen.getByText(/custom failure/)).toBeInTheDocument();
  });

  it('runs custom validate returning false (generic failure)', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileUpload validate={() => false} />);
    await upload(user, fileInput(container), makeFile('c.txt', 'text/plain'));
    expect(screen.getByText(/File validation failed/)).toBeInTheDocument();
  });

  it('renders requirement hints for maxSize / maxFiles / accept', () => {
    render(<FileUpload multiple maxSize={1024} maxFiles={3} accept=".png" />);
    expect(screen.getByText(/Maximum file size/i)).toBeInTheDocument();
    expect(screen.getByText(/Maximum files/i)).toBeInTheDocument();
    expect(screen.getByText(/Accepted types/i)).toBeInTheDocument();
  });

  it('clicking the upload area opens the native file dialog (enabled)', () => {
    const { container } = render(<FileUpload />);
    const input = fileInput(container);
    const clickSpy = vi.spyOn(input, 'click');
    fireEvent.click(container.querySelector('div[role="button"]')!);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('clicking the upload area is a no-op when disabled', () => {
    const { container } = render(<FileUpload disabled />);
    const input = fileInput(container);
    const clickSpy = vi.spyOn(input, 'click');
    fireEvent.click(container.querySelector('div[role="button"]')!);
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('formats a 0-byte file as "0 Bytes" in the list', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileUpload multiple />);
    await upload(user, fileInput(container), makeFile('empty.txt', 'text/plain', 0));
    expect(screen.getByText(/0 Bytes/)).toBeInTheDocument();
  });

  it('falls back to the MIME type then "Unknown" when no extension is present', async () => {
    const user = userEvent.setup();
    // An empty name yields an empty extension; the formatter then falls back to
    // the MIME type ("TEXT") for the typed file and "Unknown" for the typeless one.
    const { container } = render(<FileUpload multiple />);
    const blobMime = new Blob(['x'], { type: 'text/plain' });
    const blobNone = new Blob(['x'], { type: '' });
    await upload(user, fileInput(container), [
      new File([blobMime], '', { type: 'text/plain' }),
      new File([blobNone], '', { type: '' }),
    ]);
    expect(screen.getByText(/TEXT/)).toBeInTheDocument();
    expect(screen.getByText(/Unknown/)).toBeInTheDocument();
  });
});

// Direct hook tests for handlers not reachable through the component.
describe('useFileUpload (hook handlers)', () => {
  function setup(props: Parameters<typeof useFileUpload>[0] = {}) {
    const result: { current: ReturnType<typeof useFileUpload> } = { current: null as any };
    function Probe() {
      result.current = useFileUpload(props);
      return null;
    }
    render(<Probe />);
    return result;
  }

  const fileList = (files: File[]) => files as unknown as FileList;

  it('handleClear clears files when not required', () => {
    const res = setup();
    act(() => res.current.handlers.handleFileSelect(fileList([makeFile('a.txt', 'text/plain')])));
    act(() => res.current.handlers.handleClear());
    expect(res.current.state.files).toHaveLength(0);
  });

  it('handleClear is a no-op when required', () => {
    const res = setup({ required: true });
    act(() => res.current.handlers.handleFileSelect(fileList([makeFile('a.txt', 'text/plain')])));
    act(() => res.current.handlers.handleClear());
    expect(res.current.state.files.length).toBeGreaterThan(0);
  });

  it('handleClickBrowse fires onBrowse; Space/Enter keys trigger browse', () => {
    const onBrowse = vi.fn();
    const res = setup({ onBrowse });
    act(() => res.current.handlers.handleClickBrowse());
    expect(onBrowse).toHaveBeenCalledTimes(1);
    act(() => res.current.handlers.handleKeyDown({ key: ' ', preventDefault: () => {} } as any));
    expect(onBrowse).toHaveBeenCalledTimes(2);
    act(() => res.current.handlers.handleKeyDown({ key: 'Enter', preventDefault: () => {} } as any));
    expect(onBrowse).toHaveBeenCalledTimes(3);
  });

  it('Escape clears files when present and not required', () => {
    const res = setup();
    act(() => res.current.handlers.handleFileSelect(fileList([makeFile('a.txt', 'text/plain')])));
    act(() => res.current.handlers.handleKeyDown({ key: 'Escape', preventDefault: () => {} } as any));
    expect(res.current.state.files).toHaveLength(0);
  });

  it('handleFileSelect with empty list resets to empty and calls onChange', () => {
    const onChange = vi.fn();
    const res = setup({ onChange });
    act(() => res.current.handlers.handleFileSelect(fileList([])));
    expect(res.current.state.files).toHaveLength(0);
    expect(onChange).toHaveBeenCalled();
  });

  it('drag handlers respect disabled', () => {
    const onDragOver = vi.fn();
    const onDragLeave = vi.fn();
    const res = setup({ disabled: true, onDragOver, onDragLeave });
    const fake = { preventDefault: () => {}, stopPropagation: () => {} } as any;
    act(() => res.current.handlers.handleDragOver(fake));
    act(() => res.current.handlers.handleDragLeave(fake));
    expect(onDragOver).not.toHaveBeenCalled();
    expect(onDragLeave).not.toHaveBeenCalled();
  });

  it('drag drop with disabled is a no-op', () => {
    const onDrop = vi.fn();
    const res = setup({ disabled: true, onDrop });
    const fake = { preventDefault: () => {}, stopPropagation: () => {}, dataTransfer: { files: [] } } as any;
    act(() => res.current.handlers.handleDrop(fake));
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('focus handlers toggle focused state', () => {
    const res = setup();
    act(() => res.current.handlers.handleFocus({} as any));
    expect(res.current.state.focused).toBe(true);
    act(() => res.current.handlers.handleBlur({} as any));
    expect(res.current.state.focused).toBe(false);
  });

  it('handleFileRemove removes by index', () => {
    const res = setup();
    act(() => res.current.handlers.handleFileSelect(fileList([makeFile('a.txt', 'text/plain'), makeFile('b.txt', 'text/plain')])));
    act(() => res.current.handlers.handleFileRemove(0));
    expect(res.current.state.files.some((f) => f.name === 'a.txt')).toBe(false);
    expect(res.current.state.files.some((f) => f.name === 'b.txt')).toBe(true);
  });

  it('handleKeyDown is a no-op when disabled', () => {
    const onBrowse = vi.fn();
    const res = setup({ disabled: true, onBrowse });
    act(() => res.current.handlers.handleKeyDown({ key: 'Enter', preventDefault: () => {} } as any));
    expect(onBrowse).not.toHaveBeenCalled();
  });

  it('rejects a file whose extension is not in accept', () => {
    const onError = vi.fn();
    const res = setup({ accept: '.png', onError });
    act(() => res.current.handlers.handleFileSelect(fileList([makeFile('doc.txt', 'text/plain')])));
    expect(res.current.state.error).toBeTruthy();
    expect(onError).toHaveBeenCalled();
  });

  it('rejects a file whose bare MIME type is not accepted', () => {
    const onError = vi.fn();
    const res = setup({ accept: 'customtype', onError });
    act(() => res.current.handlers.handleFileSelect(fileList([makeFile('a.bin', 'application/octet-stream')])));
    expect(res.current.state.error).toBeTruthy();
    expect(onError).toHaveBeenCalled();
  });

  it('treats an explicitly undefined defaultValue as an empty file list', () => {
    const res = setup({ defaultValue: undefined });
    expect(res.current.state.files).toHaveLength(0);
  });

  it('treats a controlled null value as an empty file list', () => {
    const res = setup({ value: null });
    expect(res.current.state.files).toHaveLength(0);
  });

  it('exposes a single controlled file (non-array value branch)', () => {
    const file = makeFile('single.txt', 'text/plain');
    const res = setup({ value: file });
    expect(res.current.state.files).toEqual([file]);
  });

  it('onChange receives an array in multiple mode for empty and populated selections', () => {
    const onChange = vi.fn();
    const res = setup({ multiple: true, onChange });
    // empty selection -> multiple branch of the empty-list onChange
    act(() => res.current.handlers.handleFileSelect(fileList([])));
    expect(onChange).toHaveBeenLastCalledWith([]);
    // populated selection -> multiple branch of the processed-files onChange
    act(() => res.current.handlers.handleFileSelect(fileList([makeFile('m.txt', 'text/plain')])));
    expect(Array.isArray(onChange.mock.calls.at(-1)?.[0])).toBe(true);
  });

  it('handleFileRemove reports an array via onChange in multiple mode', () => {
    const onChange = vi.fn();
    const seed = makeFile('a.txt', 'text/plain');
    const res = setup({ multiple: true, defaultValue: [seed, makeFile('b.txt', 'text/plain')], onChange });
    act(() => res.current.handlers.handleFileRemove(0));
    expect(onChange).toHaveBeenCalled();
    expect(Array.isArray(onChange.mock.calls.at(-1)?.[0])).toBe(true);
  });

  it('exposes a controlled array of files', () => {
    const a = makeFile('a.txt', 'text/plain');
    const b = makeFile('b.txt', 'text/plain');
    const res = setup({ value: [a, b] });
    expect(res.current.state.files).toEqual([a, b]);
  });

  it('a single defaultValue is wrapped into a one-element list', () => {
    const file = makeFile('only.txt', 'text/plain');
    const res = setup({ defaultValue: file });
    expect(res.current.state.files).toEqual([file]);
  });

  it('custom validate returning true passes the file through', () => {
    const res = setup({ validate: () => true });
    act(() => res.current.handlers.handleFileSelect(fileList([makeFile('ok.txt', 'text/plain')])));
    expect(res.current.state.error).toBeUndefined();
    expect(res.current.state.files.some((f) => f.name === 'ok.txt')).toBe(true);
  });

  it('single-mode select reports a single File (or null) via onChange', () => {
    const onChange = vi.fn();
    const res = setup({ onChange });
    act(() => res.current.handlers.handleFileSelect(fileList([makeFile('one.txt', 'text/plain')])));
    expect(onChange).toHaveBeenCalled();
    expect((onChange.mock.calls.at(-1)?.[0] as File)?.name).toBe('one.txt');
  });

  it('single-mode select with a rejected file reports null via onChange', () => {
    const onChange = vi.fn();
    const res = setup({ maxSize: 5, onChange });
    // the oversized file is rejected -> processedFiles is empty -> onChange receives null
    act(() => res.current.handlers.handleFileSelect(fileList([makeFile('huge.txt', 'text/plain', 200)])));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('controlled selection still fires onChange with the processed file', () => {
    const onChange = vi.fn();
    const res = setup({ value: makeFile('c.txt', 'text/plain'), onChange });
    act(() => res.current.handlers.handleFileSelect(fileList([])));
    expect(onChange).toHaveBeenCalled();
    act(() => res.current.handlers.handleFileSelect(fileList([makeFile('d.txt', 'text/plain')])));
    expect(onChange.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('handleFileRemove in controlled single mode reports null via onChange', () => {
    const onChange = vi.fn();
    const res = setup({ value: makeFile('c.txt', 'text/plain'), onChange });
    act(() => res.current.handlers.handleFileRemove(0));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('handleFileSelect / handleClickBrowse / handleFileRemove are no-ops when disabled', () => {
    const onChange = vi.fn();
    const onBrowse = vi.fn();
    const res = setup({ disabled: true, onChange, onBrowse });
    // seed an internal file first (disabled only blocks handlers, not initial state plumbing)
    act(() => res.current.handlers.handleFileSelect(fileList([makeFile('seed.txt', 'text/plain')])));
    const before = res.current.state.files.length;
    act(() => res.current.handlers.handleFileSelect(fileList([makeFile('x.txt', 'text/plain')])));
    act(() => res.current.handlers.handleClickBrowse());
    act(() => res.current.handlers.handleFileRemove(0));
    expect(onChange).not.toHaveBeenCalled();
    expect(onBrowse).not.toHaveBeenCalled();
    expect(res.current.state.files.length).toBe(before);
  });

  it('multiple mode trims accumulated files back to maxFiles on a second upload', () => {
    const seed = makeFile('a.txt', 'text/plain');
    const res = setup({ multiple: true, maxFiles: 1, defaultValue: [seed] });
    expect(res.current.state.files.length).toBe(1);
    // a second selection appends to existing files, then the multiple+maxFiles guard trims.
    act(() => res.current.handlers.handleFileSelect(fileList([makeFile('b.txt', 'text/plain')])));
    expect(res.current.state.files.length).toBe(1);
    expect(res.current.state.error).toContain('Maximum');
  });

  it('handleFileSelect surfaces a generic error when file processing throws', () => {
    const onError = vi.fn();
    const res = setup({ onError });
    // A FileList-like whose iterator throws simulates a processing failure path.
    const throwing: any = {
      length: 1,
      item: () => {
        throw new Error('boom');
      },
      [Symbol.iterator]() {
        throw new Error('boom');
      },
    };
    act(() => res.current.handlers.handleFileSelect(throwing));
    expect(res.current.state.error).toBe('Failed to process files');
    expect(onError).toHaveBeenCalledWith('Failed to process files');
  });

  it('handleFocus is a no-op when focusable is false', () => {
    const res = setup({ focusable: false });
    act(() => res.current.handlers.handleFocus({} as any));
    expect(res.current.state.focused).toBe(false);
  });

  it('handleKeyDown delegates non-navigation keys to the focusable mixin', () => {
    const res = setup();
    // A plain key (Tab) falls through to focusableMixin.handleKeyDown without throwing.
    expect(() =>
      act(() => res.current.handlers.handleKeyDown({ key: 'Tab', preventDefault: () => {} } as any))
    ).not.toThrow();
  });
});
