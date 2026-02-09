# Testing Standards (Strict)

## Goal
Tests must be strict, deterministic, and production-ready. Selenium tests are the source of truth for UI behavior, layout stability, accessibility, and runtime safety.

## Required Test Set per Component
Every component must include at least the following **four** test cases:
1. **Functionality** — Core interactions and state changes.
2. **Visual Rendering** — Element is visible, sized correctly, within viewport bounds, and has an accessible name when interactive.
3. **Navigation** — URL changes or route transitions without console errors.
4. **Runtime Stability** — No console errors or JavaScript exceptions after interactions.

## Strict Runtime Checks
- After every test, fail on **any** console error or JavaScript exception.
- Use `ComponentAssertions` from `tests/selenium/strict_assertions.py`.

## Determinism
- Avoid arbitrary `time.sleep()` unless a deterministic wait is not possible.
- Prefer `WebDriverWait` with expected conditions.

## Test Utilities
- `tests/selenium/test_constants.py` provides shared locators and test data.
- `tests/selenium/strict_assertions.py` provides strict assertions and filtering logic.
- `tests/selenium/parallel_runner.py` runs pytest batches in parallel processes and aggregates failures.

## Parallel Execution
Use the parallel runner to reduce wall-clock time when running the full suite:
```bash
python tests/selenium/parallel_runner.py --workers 4 --pytest-args "-v"
```
This runner splits test files into batches and executes them concurrently. It reports any failed
batches and exits non-zero if any batch fails.

## Example Skeleton
```python
def test_component_accessibility(driver, test_helper, assertions):
    test_helper.navigate_to_category("buttons")
    element = test_helper.wait_for_element(Locators.BUTTON_COUNTER)
    assertions.assert_element_rendered_properly(element)
    assertions.assert_accessible_name(element)
```
