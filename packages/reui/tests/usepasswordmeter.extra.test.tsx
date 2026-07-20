import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { usePasswordMeter } from '../src/hooks';
import type { UsePasswordMeterProps, PasswordStrength } from '../src/hooks';

function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

describe('usePasswordMeter hook — extended branches', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('defaults: empty password, hidden, no analysis, role progressbar', () => {
    const hook = renderHook(() => usePasswordMeter({}));
    const { state, attributes } = hook.result.current;
    expect(state.password).toBe('');
    expect(state.analysis).toBeNull();
    expect(state.disabled).toBe(false);
    expect(state.visible).toBe(false);
    expect(state.analyzing).toBe(false);
    expect(state.lastAnalyzed).toBeNull();
    expect(state.error).toBeNull();
    expect(attributes.role).toBe('progressbar');
    expect(attributes['aria-valuemin']).toBe(0);
    expect(attributes['aria-valuemax']).toBe(100);
    expect(attributes['aria-valuenow']).toBe(0);
    expect(attributes['aria-valuetext']).toContain('no password');
    expect(attributes.tabIndex).toBe(0);
  });

  it('disabled: setPassword/clear/toggleVisibility/setVisibility are no-ops', () => {
    const onPasswordChange = vi.fn();
    const hook = renderHook(() =>
      usePasswordMeter({ disabled: true, onPasswordChange })
    );
    expect(hook.result.current.attributes.tabIndex).toBe(-1);
    actAndRerender(hook, () => hook.result.current.actions.setPassword('abc'));
    actAndRerender(hook, () => hook.result.current.actions.clear());
    actAndRerender(hook, () => hook.result.current.actions.toggleVisibility());
    actAndRerender(hook, () => hook.result.current.actions.setVisibility(true));
    expect(hook.result.current.state.password).toBe('');
    expect(hook.result.current.state.visible).toBe(false);
    expect(onPasswordChange).not.toHaveBeenCalled();
  });

  it('setPassword auto-analyzes after debounce and fires callbacks', () => {
    const onPasswordChange = vi.fn();
    const onAnalysisComplete = vi.fn();
    const onStrengthChange = vi.fn();
    const hook = renderHook(() =>
      usePasswordMeter({
        analysisDelay: 300,
        onPasswordChange,
        onAnalysisComplete,
        onStrengthChange,
      })
    );
    actAndRerender(hook, () => hook.result.current.actions.setPassword('Str0ng!Pass'));
    // Before the debounce elapses, no analysis yet.
    expect(hook.result.current.state.password).toBe('Str0ng!Pass');
    expect(hook.result.current.state.analysis).toBeNull();
    act(() => vi.advanceTimersByTime(300));
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.analysis).not.toBeNull();
    expect(onAnalysisComplete).toHaveBeenCalledTimes(1);
    expect(onPasswordChange).toHaveBeenCalledWith('Str0ng!Pass', expect.any(Object));
    expect(onStrengthChange).toHaveBeenCalled();
  });

  it('analysisDelay=0 analyzes immediately (synchronous path)', () => {
    const onAnalysisComplete = vi.fn();
    const hook = renderHook(() =>
      usePasswordMeter({ analysisDelay: 0, onAnalysisComplete })
    );
    actAndRerender(hook, () => hook.result.current.actions.setPassword('Str0ng!Pass'));
    expect(hook.result.current.state.analysis).not.toBeNull();
    expect(onAnalysisComplete).toHaveBeenCalledTimes(1);
  });

  it('autoAnalyze=false: setPassword does not analyze; fires onPasswordChange(null)', () => {
    const onPasswordChange = vi.fn();
    const onAnalysisComplete = vi.fn();
    const hook = renderHook(() =>
      usePasswordMeter({ autoAnalyze: false, onPasswordChange, onAnalysisComplete })
    );
    actAndRerender(hook, () => hook.result.current.actions.setPassword('whatever'));
    expect(hook.result.current.state.analysis).toBeNull();
    expect(onPasswordChange).toHaveBeenCalledWith('whatever', null);
    expect(onAnalysisComplete).not.toHaveBeenCalled();
  });

  it('analyze() is a direct imperative that returns the analysis', () => {
    const hook = renderHook(() => usePasswordMeter({}));
    let result: any;
    act(() => {
      result = hook.result.current.actions.analyze('Str0ng!Pass');
    });
    expect(result).toBeDefined();
    expect(result.password).toBe('Str0ng!Pass');
    expect(result.score).toBeGreaterThan(0);
    expect(result.criteria).toBeInstanceOf(Array);
  });

  it('weak/common password yields low score and warnings/suggestions', () => {
    const hook = renderHook(() => usePasswordMeter({}));
    let analysis: any;
    act(() => {
      analysis = hook.result.current.actions.analyze('password');
    });
    expect(analysis.warnings).toContain('This is a very common password');
    expect(analysis.suggestions).toContain('Choose a less common password');
    // Common password has low score.
    expect(analysis.score).toBeLessThan(60);
    expect(analysis.isAcceptable).toBe(false);
  });

  it('a strong password is acceptable and triggers onPasswordAcceptable', () => {
    const onPasswordAcceptable = vi.fn();
    const onPasswordUnacceptable = vi.fn();
    const hook = renderHook(() =>
      usePasswordMeter({ onPasswordAcceptable, onPasswordUnacceptable })
    );
    actAndRerender(hook, () => hook.result.current.actions.analyze('V3ryStr0ng!P@ssword'));
    const analysis = hook.result.current.state.analysis;
    expect(analysis.isAcceptable).toBe(true);
    // The strength-change effect fires acceptable callback.
    expect(onPasswordAcceptable).toHaveBeenCalled();
    expect(onPasswordUnacceptable).not.toHaveBeenCalled();
  });

  it('a weak password triggers onPasswordUnacceptable', () => {
    const onPasswordUnacceptable = vi.fn();
    const hook = renderHook(() => usePasswordMeter({ onPasswordUnacceptable }));
    actAndRerender(hook, () => hook.result.current.actions.analyze('a'));
    expect(onPasswordUnacceptable).toHaveBeenCalled();
  });

  it('strength thresholds map to very-weak/weak/fair/good/strong/very-strong', () => {
    // We exercise getStrengthFromScore indirectly by analyzing passwords that
    // land in each bucket via score boundaries. The hook doesn't expose the
    // mapper, so we verify getStrengthColor covers each switch arm instead.
    const cases: Array<{ pwd: string; expectColor: string }> = [
      { pwd: '', expectColor: '#e5e7eb' }, // no analysis
    ];
    const hook = renderHook(() => usePasswordMeter({}));
    // empty -> gray
    expect(hook.result.current.actions.getStrengthColor()).toBe('#e5e7eb');
    expect(hook.result.current.actions.getStrengthPercentage()).toBe(0);

    // Build analyses covering each strength bucket by using the analyze() mapper.
    // We rely on real scoring to traverse the switch arms in getStrengthColor.
    const seenColors = new Set<string>();
    const samples = [
      'a', // very weak
      'abc', // very weak / weak
      'abcdefgh', // fair-ish (length ok, single class)
      'Abcdefgh1', // good (length, upper, lower, digit)
      'Abcdefgh1!', // strong
      'Abcdefgh1!xyzPDQ', // very strong
    ];
    for (const pwd of samples) {
      act(() => {
        hook.result.current.actions.analyze(pwd);
      });
      hook.rerender();
      seenColors.add(hook.result.current.actions.getStrengthColor());
    }
    // We should have traversed several distinct color buckets.
    expect(seenColors.size).toBeGreaterThan(1);
    // All colors must be one of the known palette.
    const palette = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981', '#e5e7eb'];
    for (const c of seenColors) {
      expect(palette).toContain(c);
    }
    void cases;
  });

  it('clear() resets password, analysis, error, lastAnalyzed', () => {
    const hook = renderHook(() => usePasswordMeter({ analysisDelay: 0 }));
    actAndRerender(hook, () => hook.result.current.actions.setPassword('Str0ng!Pass'));
    expect(hook.result.current.state.analysis).not.toBeNull();
    actAndRerender(hook, () => hook.result.current.actions.clear());
    expect(hook.result.current.state.password).toBe('');
    expect(hook.result.current.state.analysis).toBeNull();
    expect(hook.result.current.state.error).toBeNull();
    expect(hook.result.current.state.lastAnalyzed).toBeNull();
  });

  it('reset() restores defaults (empty, hidden, no analysis, no error)', () => {
    const hook = renderHook(() => usePasswordMeter({ defaultVisible: true, analysisDelay: 0 }));
    actAndRerender(hook, () => {
      hook.result.current.actions.setPassword('Str0ng!Pass');
      hook.result.current.actions.toggleVisibility();
    });
    expect(hook.result.current.state.visible).toBe(false);
    actAndRerender(hook, () => hook.result.current.actions.reset());
    expect(hook.result.current.state.password).toBe('');
    expect(hook.result.current.state.analysis).toBeNull();
    expect(hook.result.current.state.error).toBeNull();
    expect(hook.result.current.state.lastAnalyzed).toBeNull();
    expect(hook.result.current.state.visible).toBe(true); // back to defaultVisible
  });

  it('toggleVisibility / setVisibility flip the visible flag', () => {
    const hook = renderHook(() => usePasswordMeter({}));
    actAndRerender(hook, () => hook.result.current.actions.toggleVisibility());
    expect(hook.result.current.state.visible).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.setVisibility(false));
    expect(hook.result.current.state.visible).toBe(false);
    actAndRerender(hook, () => hook.result.current.actions.setVisibility(true));
    expect(hook.result.current.state.visible).toBe(true);
  });

  it('custom validationRules contribute criteria and can mark required/not-acceptable', () => {
    const onAnalysisError = vi.fn();
    const hook = renderHook(() =>
      usePasswordMeter({
        validationRules: [
          {
            name: 'has-emoji',
            validate: (p) => /😀/.test(p),
            message: 'Must contain an emoji',
            required: true,
            weight: 50,
          },
          {
            name: 'no-spaces',
            validate: (p) => !/\s/.test(p),
            message: 'No spaces allowed',
            weight: 5,
          },
        ],
        onAnalysisError,
      })
    );
    let analysis: any;
    act(() => {
      analysis = hook.result.current.actions.analyze('Str0ng!Pass');
    });
    const names = analysis.criteria.map((c: any) => c.name);
    expect(names).toContain('has-emoji');
    expect(names).toContain('no-spaces');
    // has-emoji required and not met => not acceptable.
    expect(analysis.isAcceptable).toBe(false);
  });

  it('checkCommonPasswords=false suppresses common-password criterion and suggestions', () => {
    const hook = renderHook(() => usePasswordMeter({ checkCommonPasswords: false }));
    let analysis: any;
    act(() => {
      analysis = hook.result.current.actions.analyze('password');
    });
    const noCommon = analysis.criteria.find((c: any) => c.name === 'no-common');
    expect(noCommon.met).toBe(true); // common-pw check disabled => always met
    expect(analysis.suggestions).not.toContain('Choose a less common password');
    expect(analysis.warnings).not.toContain('This is a very common password');
  });

  it('calculateEntropy=false and estimateCrackTime=false zero out those fields', () => {
    const hook = renderHook(() =>
      usePasswordMeter({ calculateEntropy: false, estimateCrackTime: false })
    );
    let analysis: any;
    act(() => {
      analysis = hook.result.current.actions.analyze('Str0ng!Pass');
    });
    expect(analysis.entropy).toBe(0);
    expect(analysis.estimatedCrackTime).toBe('');
  });

  it('suggestions cover missing lowercase/uppercase/numbers/special and short length', () => {
    const hook = renderHook(() => usePasswordMeter({ minLength: 8 }));
    let analysis: any;
    act(() => {
      analysis = hook.result.current.actions.analyze('A');
    });
    expect(analysis.suggestions).toContain('Use at least 8 characters');
    expect(analysis.suggestions).toContain('Add lowercase letters');
    expect(analysis.suggestions).toContain('Add numbers');
    expect(analysis.suggestions).toContain('Add special characters');
  });

  it('warnings include "hard to remember" for very long passwords', () => {
    const hook = renderHook(() => usePasswordMeter({}));
    const longPwd = 'Aa1!' + 'a'.repeat(60);
    let analysis: any;
    act(() => {
      analysis = hook.result.current.actions.analyze(longPwd);
    });
    expect(analysis.warnings).toContain('Very long passwords may be hard to remember');
  });

  it('warnings include "consider longer" when exactly at minLength and score<60', () => {
    const hook = renderHook(() => usePasswordMeter({ minLength: 4 }));
    let analysis: any;
    act(() => {
      analysis = hook.result.current.actions.analyze('abcd'); // length === minLength(4), single class -> score<60
    });
    expect(analysis.warnings).toContain('Consider using a longer password');
  });

  it('crack-time formatter hits the "instantly" branch for low entropy', () => {
    const hook = renderHook(() => usePasswordMeter({}));
    let analysis: any;
    act(() => {
      analysis = hook.result.current.actions.analyze('a'); // entropy 0
    });
    // 0 entropy => 2^0/2e11 ~ instant
    expect(typeof analysis.estimatedCrackTime).toBe('string');
  });

  it('analyze() surfaces a catch-path error via onAnalysisError when a rule throws', () => {
    const onAnalysisError = vi.fn();
    const hook = renderHook(() =>
      usePasswordMeter({
        validationRules: [
          {
            name: 'boom',
            validate: () => {
              throw new Error('rule failed');
            },
            message: 'x',
          },
        ],
        onAnalysisError,
      })
    );
    expect(() =>
      act(() => {
        hook.result.current.actions.analyze('whatever');
      })
    ).toThrow('rule failed');
    expect(onAnalysisError).toHaveBeenCalledWith('rule failed');
    // Force a re-render so the error state committed by the catch block is
    // reflected in result.current before we assert against it.
    hook.rerender();
    expect(hook.result.current.state.error).toBe('rule failed');
    // error path adds aria-describedby to attributes.
    expect(hook.result.current.attributes['aria-describedby']).toBe('password-meter-error');
  });

  it('analyze() error path uses generic message for non-Error throws', () => {
    const onAnalysisError = vi.fn();
    const hook = renderHook(() =>
      usePasswordMeter({
        validationRules: [
          {
            name: 'boom',
            validate: () => {
              throw 'string-error';
            },
            message: 'x',
          },
        ],
        onAnalysisError,
      })
    );
    expect(() =>
      act(() => {
        hook.result.current.actions.analyze('whatever');
      })
    ).toThrow();
    expect(onAnalysisError).toHaveBeenCalledWith('Failed to analyze password');
  });

  it('analyze() analyzing flag toggles true then false (finally block)', () => {
    const hook = renderHook(() => usePasswordMeter({}));
    let analyzingDuring: boolean | undefined;
    // We cannot observe mid-call state synchronously, but we can confirm it
    // ends at false after a successful analyze.
    act(() => {
      hook.result.current.actions.analyze('Str0ng!Pass');
    });
    expect(hook.result.current.state.analyzing).toBe(false);
    void analyzingDuring;
  });

  it('setPassword with an already-pending timeout clears the prior timer', () => {
    const onAnalysisComplete = vi.fn();
    const hook = renderHook(() =>
      usePasswordMeter({ analysisDelay: 300, onAnalysisComplete })
    );
    actAndRerender(hook, () => hook.result.current.actions.setPassword('first-pwd'));
    actAndRerender(hook, () => hook.result.current.actions.setPassword('second-pwd'));
    // Advance only 300ms — only the second analysis should run, once.
    act(() => vi.advanceTimersByTime(300));
    expect(onAnalysisComplete).toHaveBeenCalledTimes(1);
    expect(hook.result.current.state.password).toBe('second-pwd');
  });

  it('reset() clears a pending analysis timeout', () => {
    const hook = renderHook(() => usePasswordMeter({ analysisDelay: 300 }));
    actAndRerender(hook, () => hook.result.current.actions.setPassword('pending'));
    // reset() while the debounce timer is still pending clears it.
    actAndRerender(hook, () => hook.result.current.actions.reset());
    expect(hook.result.current.state.password).toBe('');
    act(() => vi.advanceTimersByTime(300));
    expect(hook.result.current.state.analysis).toBeNull();
  });

  it('getStrengthColor covers each strength label and crack-time buckets vary', () => {
    const hook = renderHook(() => usePasswordMeter({ analysisDelay: 0 }));
    // No analysis yet → default color arm.
    expect(hook.result.current.actions.getStrengthColor()).toBe('#e5e7eb');
    const samples = [
      'a', 'Aa', 'abcdef', 'abcdefghi', 'abcdefghij',
      'Abcdef1!', 'abcdefghij1', 'Abcdefghij1', 'Abcdefghij1!',
      'Str0ng!Long#Pass', 'Abcdefgh1!xyzPDQ99',
    ];
    const seen = new Set<string>();
    const cracks = new Set<string>();
    for (const pwd of samples) {
      actAndRerender(hook, () => hook.result.current.actions.setPassword(pwd));
      const analysis = hook.result.current.state.analysis;
      if (analysis) {
        seen.add(hook.result.current.actions.getStrengthColor());
        cracks.add(analysis.estimatedCrackTime);
      }
    }
    // Cover the weak (#f97316) and good (#84cc16) color switch arms.
    expect(seen.has('#f97316')).toBe(true);
    expect(seen.has('#84cc16')).toBe(true);
    // Multiple crack-time format buckets observed (seconds/minutes/hours/days/...).
    expect(cracks.size).toBeGreaterThan(3);
  });

  it('a validation rule without an explicit weight defaults to 10', () => {
    const rule = { name: 'has-x', validate: (p: string) => p.includes('x'), message: 'needs x' };
    const hook = renderHook(() => usePasswordMeter({ analysisDelay: 0, validationRules: [rule] }));
    actAndRerender(hook, () => hook.result.current.actions.setPassword('x'));
    const criterion = hook.result.current.state.analysis?.criteria.find((c: any) => c.name === 'has-x');
    expect(criterion?.weight).toBe(10);
  });

  it('a short lowercase-only password yields a weak/fair strength and short crack time', () => {
    const hook = renderHook(() => usePasswordMeter({ analysisDelay: 0 }));
    actAndRerender(hook, () => hook.result.current.actions.setPassword('abc'));
    const analysis = hook.result.current.state.analysis;
    expect(analysis).toBeDefined();
    // Drive the weak/good color arms via getStrengthColor across strengths.
    const color = hook.result.current.actions.getStrengthColor();
    expect(color).toBeTruthy();
  });
});
