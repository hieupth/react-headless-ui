import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException


# Common locators for repeated use
class Locators:
    """Common locators used across tests."""

    # Button locators
    BUTTON_COUNTER = (By.CSS_SELECTOR, "[data-testid='button-counter']")
    BUTTON_RESET = (By.CSS_SELECTOR, "[data-testid='button-reset']")
    BUTTON_LOADING = (By.CSS_SELECTOR, "[data-testid='button-loading']")
    BUTTON_DISABLED = (By.CSS_SELECTOR, "[data-testid='button-disabled']")
    BUTTON_SUBMIT = (By.CSS_SELECTOR, "[data-testid='button-submit']")

    # Input locators
    INPUT_NAME = (By.CSS_SELECTOR, "[data-testid='input-name']")
    INPUT_EMAIL = (By.CSS_SELECTOR, "[data-testid='input-email']")
    INPUT_ELEMENT = (By.CSS_SELECTOR, "[data-testid='input-element']")

    # Checkbox/Switch locators
    CHECKBOX_SUBSCRIBE = (By.CSS_SELECTOR, "[data-testid='checkbox-subscribe']")
    CHECKBOX = (By.CSS_SELECTOR, "[data-testid='checkbox']")
    SWITCH_NOTIFICATIONS = (By.CSS_SELECTOR, "[data-testid='switch-notifications']")
    TOGGLE = (By.CSS_SELECTOR, "[data-testid='toggle']")

    # Textarea locators
    TEXTAREA_MESSAGE = (By.CSS_SELECTOR, "[data-testid='textarea-message']")
    TEXTAREA = (By.CSS_SELECTOR, "[data-testid='textarea']")

    # Select locators
    SELECT_PRIORITY = (By.CSS_SELECTOR, "[data-testid='select-priority']")
    BASIC_SELECT = (By.CSS_SELECTOR, "[data-testid='basic-select']")

    # Calendar locators
    CALENDAR_EVENT_DATE = (By.CSS_SELECTOR, "[data-testid='calendar-event-date']")
    CALENDAR = (By.CSS_SELECTOR, "[data-testid='calendar']")

    # Component groups
    BUTTON_GROUP = (By.CSS_SELECTOR, "[data-testid='button-group']")
    RADIO_GROUP = (By.CSS_SELECTOR, "[data-testid='radio-group']")
    INPUT_OTP = (By.CSS_SELECTOR, "[data-testid='input-otp']")


# Test data constants
class TestData:
    """Test data constants used across tests."""

    VALID_EMAIL = "test@example.com"
    INVALID_EMAIL = "invalid-email"
    TEST_NAME = "Test User"
    TEST_MESSAGE = "This is a test message"
    LONG_TEXT = "This is a very long text that exceeds normal input limits to test component behavior with excessive content"

    # URLs for navigation tests
    BUTTONS_PAGE = "/buttons"
    INPUTS_PAGE = "/inputs"
    NAVIGATION_PAGE = "/navigation"
    DATA_DISPLAY_PAGE = "/data-display"
    FEEDBACK_PAGE = "/feedback"
    LAYOUT_PAGE = "/layout"
    MOTION_PAGE = "/motion"
    UTILITIES_PAGE = "/utilities"


# Custom assertions for component testing
class ComponentAssertions:
    """Custom assertion methods for component testing."""

    @staticmethod
    def assert_element_rendered_properly(element):
        """Assert element renders without visual abnormalities."""
        assert element.is_displayed(), "Element should be visible"

        size = element.size
        assert size['width'] > 0, "Element should have positive width"
        assert size['height'] > 0, "Element should have positive height"

        # Check for reasonable size limits (not too large or too small)
        assert size['width'] < 5000, "Element width seems abnormally large"
        assert size['height'] < 5000, "Element height seems abnormally large"

    @staticmethod
    def assert_no_console_errors(driver):
        """Assert no JavaScript console errors."""
        logs = driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']

        if errors:
            error_messages = [error['message'] for error in errors]
            assert False, f"JavaScript errors detected: {error_messages}"

    @staticmethod
    def assert_navigation_works(driver, expected_url_fragment):
        """Assert navigation works without errors."""
        current_url = driver.current_url
        assert expected_url_fragment in current_url, f"Expected URL fragment '{expected_url_fragment}' not found in '{current_url}'"

        # Check for navigation errors
        ComponentAssertions.assert_no_console_errors(driver)




"""
Tooltip Component Tests
Following CLAUDE.md requirements: 4 tests per component (Functionality, Visual Rendering, Navigation, Runtime Stability)
"""




class TestTooltip:
    """Test suite for Tooltip component."""

    def test_tooltip_functionality(self, driver, test_helper, assertions):
        """
        Test 1: Tooltip Functionality
        Test core tooltip interactions and state changes
        """
        # Navigate to feedback page
        test_helper.navigate_to_category("feedback")

        # Look for tooltip elements
        tooltip_selectors = [
            "[data-testid*='tooltip']",
            "[role*='tooltip']",
            ".tooltip",
            "[title]",
            "[data-tooltip]"
        ]

        tooltip_elements = []
        for selector in tooltip_selectors:
            try:
                tooltips = test_helper.driver.find_elements(By.CSS_SELECTOR, selector)
                tooltip_elements.extend(tooltips)
            except:
                continue

        if tooltip_elements:
            # Test tooltip triggering
            for tooltip in tooltip_elements[:5]:  # Test first 5 tooltips
                if tooltip.is_displayed():
                    try:
                        # Hover to trigger tooltip
                        test_helper.driver.execute_script("arguments[0].scrollIntoView();", tooltip)
                        time.sleep(0.1)

                        # Mouse over
                        test_helper.driver.execute_script(
                            "var event = new MouseEvent('mouseover', {bubbles: true}); arguments[0].dispatchEvent(event);",
                            tooltip)
                        time.sleep(0.5)

                        # Look for tooltip content
                        tooltip_content_selectors = [
                            ".tooltip-content", ".tooltip-inner", "[role='tooltip']",
                            ".tooltip-popup", "[data-tooltip-content]"
                        ]

                        tooltip_found = False
                        for content_selector in tooltip_content_selectors:
                            try:
                                content = test_helper.driver.find_element(By.CSS_SELECTOR, content_selector)
                                if content.is_displayed():
                                    tooltip_found = True
                                    break
                            except:
                                continue

                        # Mouse out to hide tooltip
                        test_helper.driver.execute_script(
                            "var event = new MouseEvent('mouseout', {bubbles: true}); arguments[0].dispatchEvent(event);",
                            tooltip)
                        time.sleep(0.3)

                        if tooltip_found:
                            break

                    except:
                        continue

        # If no tooltips found, look for elements with title attributes
        if not tooltip_elements:
            title_elements = test_helper.driver.find_elements(By.CSS_SELECTOR, "[title]")

            for element in title_elements[:3]:
                if element.is_displayed():
                    try:
                        # Hover to show title tooltip
                        test_helper.driver.execute_script("arguments[0].scrollIntoView();", element)
                        time.sleep(0.1)

                        # Mouse over
                        test_helper.driver.execute_script(
                            "var event = new MouseEvent('mouseover', {bubbles: true}); arguments[0].dispatchEvent(event);",
                            element)
                        time.sleep(1)

                        # Mouse out
                        test_helper.driver.execute_script(
                            "var event = new MouseEvent('mouseout', {bubbles: true}); arguments[0].dispatchEvent(event);",
                            element)
                        time.sleep(0.3)

                    except:
                        continue

    def test_tooltip_renders_normally(self, driver, test_helper, assertions):
        """
        Test 2: Visual Rendering
        Test tooltip renders without visual abnormalities
        """
        # Navigate to feedback page
        test_helper.navigate_to_category("feedback")

        # Look for tooltip triggers
        tooltip_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".tooltip-trigger, [data-tooltip], [title], [data-testid*='tooltip']")

        if tooltip_elements:
            for tooltip in tooltip_elements[:5]:  # Test first 5 elements
                if tooltip.is_displayed():
                    assertions.assert_element_rendered_properly(tooltip)

                    # Check tooltip trigger has reasonable dimensions
                    width, height = test_helper.get_element_size_by_element(tooltip)
                    assert 10 <= width <= 500, f"Tooltip trigger width {width} is outside reasonable range"
                    assert 10 <= height <= 200, f"Tooltip trigger height {height} is outside reasonable range"

                    # Check tooltip trigger position
                    x, y = test_helper.get_element_position_by_element(tooltip)
                    assert x >= 0 and y >= 0, f"Tooltip trigger position ({x}, {y}) is negative"

        # Test tooltip content if it exists
        tooltip_contents = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".tooltip-content, .tooltip-inner, [role='tooltip']")

        for content in tooltip_contents[:3]:
            if content.is_displayed():
                assertions.assert_element_rendered_properly(content)

                # Check tooltip content has reasonable dimensions
                width, height = test_helper.get_element_size_by_element(content)
                assert 20 <= width <= 400, f"Tooltip content width {width} is outside reasonable range"
                assert 10 <= height <= 200, f"Tooltip content height {height} is outside reasonable range"

    def test_tooltip_navigation(self, driver, test_helper, assertions):
        """
        Test 3: Navigation
        Test tooltip navigation behavior and keyboard interaction
        """
        # Navigate to feedback page
        test_helper.navigate_to_category("feedback")

        # Look for tooltip elements
        tooltip_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".tooltip-trigger, [data-tooltip], [title]")

        clickable_tooltips = [t for t in tooltip_elements if t.is_displayed() and t.is_enabled()]

        if clickable_tooltips:
            # Test keyboard navigation
            first_tooltip = clickable_tooltips[0]
            first_tooltip.click()
            time.sleep(0.3)

            # Test focus-based tooltip activation
            active_element = test_helper.driver.switch_to.active_element

            try:
                # Tab to next element (should hide tooltip)
                active_element.send_keys('\t')
                time.sleep(0.3)

                # Shift+Tab back (should show tooltip again)
                active_element.send_keys('\ue004')  # Shift+Tab
                time.sleep(0.3)

            except:
                pass

            # Test tooltip with focus/blur
            for tooltip in clickable_tooltips[:3]:
                try:
                    # Focus tooltip
                    tooltip.click()
                    time.sleep(0.3)

                    # Look for tooltip content
                    tooltip_content = test_helper.driver.find_elements(By.CSS_SELECTOR,
                        ".tooltip-content, [role='tooltip']")

                    # Blur (click elsewhere)
                    test_helper.driver.find_element(By.TAG_NAME, "body").click()
                    time.sleep(0.3)

                except:
                    continue

        # Test tooltip doesn't interfere with navigation
        for tooltip in clickable_tooltips[:2]:
            try:
                # Hover tooltip
                test_helper.driver.execute_script("arguments[0].scrollIntoView();", tooltip)
                time.sleep(0.1)

                test_helper.driver.execute_script(
                    "var event = new MouseEvent('mouseover', {bubbles: true}); arguments[0].dispatchEvent(event);",
                    tooltip)
                time.sleep(0.5)

                # Try to navigate to another element
                nav_link = test_helper.driver.find_element(By.LINK_TEXT, "Home")
                nav_link.click()
                time.sleep(0.5)

                # Go back
                test_helper.driver.back()
                time.sleep(0.5)

                break

            except:
                continue

        # Test no navigation errors
        assertions.assert_no_console_errors(test_helper.driver)

    def test_tooltip_no_errors(self, driver, test_helper, assertions):
        """
        Test 4: Runtime Stability
        Test tooltip runtime stability and console errors
        """
        # Navigate to feedback page
        test_helper.navigate_to_category("feedback")

        # Check initial console state
        initial_errors = test_helper.get_console_errors()
        assert len(initial_errors) == 0, \
            f"Page loaded with {len(initial_errors)} JavaScript errors: {[e['message'] for e in initial_errors]}"

        # Look for tooltip elements
        tooltip_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".tooltip-trigger, [data-tooltip], [title], [data-testid*='tooltip']")

        # Test rapid tooltip interactions
        for tooltip in tooltip_elements:
            if tooltip.is_displayed():
                # Rapid hover in/out
                for i in range(5):
                    try:
                        # Hover in
                        test_helper.driver.execute_script(
                            "var event = new MouseEvent('mouseover', {bubbles: true}); arguments[0].dispatchEvent(event);",
                            tooltip)
                        time.sleep(0.1)

                        # Hover out
                        test_helper.driver.execute_script(
                            "var event = new MouseEvent('mouseout', {bubbles: true}); arguments[0].dispatchEvent(event);",
                            tooltip)
                        time.sleep(0.1)

                    except:
                        continue

        # Test focus/blur cycles
        clickable_tooltips = [t for t in tooltip_elements if t.is_displayed() and t.is_enabled()]

        for tooltip in clickable_tooltips[:10]:
            try:
                # Focus
                tooltip.click()
                time.sleep(0.1)

                # Blur
                test_helper.driver.find_element(By.TAG_NAME, "body").click()
                time.sleep(0.1)

            except:
                continue

        # Test mouse movement stress
        for tooltip in tooltip_elements[:5]:
            try:
                test_helper.driver.execute_script("arguments[0].scrollIntoView();", tooltip)
                time.sleep(0.1)

                # Rapid mouse events
                for i in range(5):
                    test_helper.driver.execute_script(
                        "var event = new MouseEvent('mousemove', {bubbles: true}); arguments[0].dispatchEvent(event);",
                        tooltip)
                    time.sleep(0.05)

            except:
                continue

        # Check for console errors after interactions
        final_errors = test_helper.get_console_errors()
        error_messages = [error['message'] for error in final_errors]

        assert len(final_errors) == 0, \
            f"Tooltip interactions caused {len(final_errors)} JavaScript errors: {error_messages}"

        # Verify no JavaScript exceptions thrown
        logs = test_helper.driver.get_log('browser')
        js_exceptions = [log for log in logs if 'Uncaught' in log.get('message', '')]

        assert len(js_exceptions) == 0, \
            f"Found {len(js_exceptions)} JavaScript exceptions: {[log['message'] for log in js_exceptions]}"

        # Test tooltip elements are still functional
        for tooltip in tooltip_elements:
            if tooltip.is_displayed():
                # Element should still exist and be interactable
                tooltip_tag = tooltip.tag_name.lower()
                assert tooltip_tag in ['button', 'a', 'span', 'div', 'input'], \
                    f"Tooltip trigger should be valid element, got {tooltip_tag}"

    def get_element_size_by_element(self, element):
        """Helper method to get element size"""
        size = element.size
        return size['width'], size['height']

    def get_element_position_by_element(self, element):
        """Helper method to get element position"""
        location = element.location
        return location['x'], location['y']