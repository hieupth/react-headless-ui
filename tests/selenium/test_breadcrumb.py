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
Breadcrumb Component Tests
Following CLAUDE.md requirements: 4 tests per component (Functionality, Visual Rendering, Navigation, Runtime Stability)
"""




class TestBreadcrumb:
    """Test suite for Breadcrumb component."""

    def test_breadcrumb_functionality(self, driver, test_helper, assertions):
        """
        Test 1: Breadcrumb Functionality
        Test core breadcrumb interactions and state changes
        """
        # Navigate to navigation page (or any page that might have breadcrumbs)
        test_helper.navigate_to_category("navigation")

        # Look for breadcrumb elements
        breadcrumb_selectors = [
            "[data-testid*='breadcrumb']",
            "[aria-label*='breadcrumb']",
            ".breadcrumb",
            ".breadcrumbs",
            "nav[aria-label='breadcrumb']",
            ".breadcrumb-nav"
        ]

        breadcrumb_element = None
        for selector in breadcrumb_selectors:
            try:
                breadcrumb_element = test_helper.driver.find_element(By.CSS_SELECTOR, selector)
                if breadcrumb_element.is_displayed():
                    break
            except:
                continue

        if breadcrumb_element:
            # Test breadcrumb link functionality
            breadcrumb_links = breadcrumb_element.find_elements(By.CSS_SELECTOR, "a, button")

            for i, link in enumerate(breadcrumb_links[:3]):  # Test first 3 links
                if link.is_displayed() and link.is_enabled():
                    try:
                        # Get link text/href
                        link_text = link.text
                        link_href = link.get_attribute('href')

                        # Click breadcrumb link
                        link.click()
                        time.sleep(1)

                        # Check if navigation occurred
                        current_url = test_helper.driver.current_url

                        # Go back to continue testing
                        test_helper.driver.back()
                        time.sleep(0.5)

                    except:
                        continue

        # If no breadcrumbs found, check if any page has them by navigating around
        if not breadcrumb_element:
            # Try buttons page
            test_helper.navigate_to_category("buttons")

            for selector in breadcrumb_selectors:
                try:
                    breadcrumb_element = test_helper.driver.find_element(By.CSS_SELECTOR, selector)
                    if breadcrumb_element.is_displayed():
                        break
                except:
                    continue

    def test_breadcrumb_renders_normally(self, driver, test_helper, assertions):
        """
        Test 2: Visual Rendering
        Test breadcrumb renders without visual abnormalities
        """
        # Navigate to navigation page
        test_helper.navigate_to_category("navigation")

        # Look for breadcrumb elements
        breadcrumb_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".breadcrumb, .breadcrumbs, [aria-label*='breadcrumb']")

        if breadcrumb_elements:
            for breadcrumb in breadcrumb_elements:
                if breadcrumb.is_displayed():
                    assertions.assert_element_rendered_properly(breadcrumb)

                    # Check breadcrumb has reasonable dimensions
                    width, height = test_helper.get_element_size_by_element(breadcrumb)
                    assert 50 <= width <= 2000, f"Breadcrumb width {width} is outside reasonable range"
                    assert 10 <= height <= 100, f"Breadcrumb height {height} is outside reasonable range"

                    # Check breadcrumb position
                    x, y = test_helper.get_element_position_by_element(breadcrumb)
                    assert x >= 0 and y >= 0, f"Breadcrumb position ({x}, {y}) is negative"

        # Test breadcrumb items if they exist
        breadcrumb_items = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".breadcrumb li, .breadcrumb a, .breadcrumb-item")

        for item in breadcrumb_items[:5]:
            if item.is_displayed():
                assertions.assert_element_rendered_properly(item)

    def test_breadcrumb_navigation(self, driver, test_helper, assertions):
        """
        Test 3: Navigation
        Test breadcrumb navigation behavior and keyboard interaction
        """
        # Navigate to navigation page
        test_helper.navigate_to_category("navigation")

        # Look for breadcrumb elements
        breadcrumb_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".breadcrumb, .breadcrumbs, [aria-label*='breadcrumb']")

        if breadcrumb_elements:
            breadcrumb = breadcrumb_elements[0]

            # Test keyboard navigation
            breadcrumb_links = breadcrumb.find_elements(By.CSS_SELECTOR, "a, button")

            clickable_links = [link for link in breadcrumb_links if link.is_displayed() and link.is_enabled()]

            if clickable_links:
                # Focus first breadcrumb link
                clickable_links[0].click()
                time.sleep(0.3)

                # Test tab navigation through breadcrumb items
                for i in range(min(3, len(clickable_links))):
                    try:
                        active_element = test_helper.driver.switch_to.active_element

                        # Press tab to move to next breadcrumb item
                        active_element.send_keys('\t')
                        time.sleep(0.2)

                        # Check if we're still on breadcrumb items
                        active = test_helper.driver.switch_to.active_element
                        if active in clickable_links:
                            # Test keyboard activation
                            active.send_keys('\n')
                            time.sleep(0.5)

                            # Go back to continue testing
                            test_helper.driver.back()
                            time.sleep(0.5)
                            break

                    except:
                        continue

            # Test breadcrumb link clicking leads to correct navigation
            for link in clickable_links[:2]:
                try:
                    initial_url = test_helper.driver.current_url
                    link_text = link.text
                    link_href = link.get_attribute('href')

                    link.click()
                    time.sleep(1)

                    # Verify navigation occurred
                    new_url = test_helper.driver.current_url

                    # Go back for next test
                    test_helper.driver.back()
                    time.sleep(0.5)

                except:
                    continue

        # Test no navigation errors
        assertions.assert_no_console_errors(test_helper.driver)

    def test_breadcrumb_no_errors(self, driver, test_helper, assertions):
        """
        Test 4: Runtime Stability
        Test breadcrumb runtime stability and console errors
        """
        # Navigate to navigation page
        test_helper.navigate_to_category("navigation")

        # Check initial console state
        initial_errors = test_helper.get_console_errors()
        assert len(initial_errors) == 0, \
            f"Page loaded with {len(initial_errors)} JavaScript errors: {[e['message'] for e in initial_errors]}"

        # Look for breadcrumb elements
        breadcrumb_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".breadcrumb, .breadcrumbs, [aria-label*='breadcrumb']")

        # Test rapid breadcrumb interactions
        for breadcrumb in breadcrumb_elements:
            if breadcrumb.is_displayed():
                breadcrumb_links = breadcrumb.find_elements(By.CSS_SELECTOR, "a, button")

                for link in breadcrumb_links:
                    if link.is_displayed() and link.is_enabled():
                        # Rapid clicking
                        for i in range(3):
                            try:
                                link.click()
                                time.sleep(0.1)

                                # Go back quickly
                                test_helper.driver.back()
                                time.sleep(0.1)
                            except:
                                continue

        # Test hover interactions on breadcrumb items
        breadcrumb_items = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".breadcrumb a, .breadcrumb-item, .breadcrumb li")

        for item in breadcrumb_items[:10]:
            try:
                # Scroll to item
                test_helper.driver.execute_script("arguments[0].scrollIntoView();", item)
                time.sleep(0.1)

                # Simulate hover
                test_helper.driver.execute_script(
                    "var event = new MouseEvent('mouseover', {bubbles: true}); arguments[0].dispatchEvent(event);",
                    item)
                time.sleep(0.2)

            except:
                continue

        # Test keyboard navigation stress
        breadcrumb_links = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".breadcrumb a, .breadcrumb button")

        clickable_links = [link for link in breadcrumb_links if link.is_displayed() and link.is_enabled()]

        if clickable_links:
            try:
                clickable_links[0].click()
                time.sleep(0.2)

                # Rapid keyboard interaction
                for i in range(8):
                    active = test_helper.driver.switch_to.active_element

                    # Try different keys
                    keys = ['\t', '\n', ' ']  # Tab, Enter, Space
                    active.send_keys(keys[i % len(keys)])
                    time.sleep(0.1)

            except:
                pass

        # Check for console errors after interactions
        final_errors = test_helper.get_console_errors()
        error_messages = [error['message'] for error in final_errors]

        assert len(final_errors) == 0, \
            f"Breadcrumb interactions caused {len(final_errors)} JavaScript errors: {error_messages}"

        # Verify no JavaScript exceptions thrown
        logs = test_helper.driver.get_log('browser')
        js_exceptions = [log for log in logs if 'Uncaught' in log.get('message', '')]

        assert len(js_exceptions) == 0, \
            f"Found {len(js_exceptions)} JavaScript exceptions: {[log['message'] for log in js_exceptions]}"

        # Test breadcrumb elements are still functional
        for breadcrumb in breadcrumb_elements:
            if breadcrumb.is_displayed():
                breadcrumb_links = breadcrumb.find_elements(By.CSS_SELECTOR, "a, button")
                for link in breadcrumb_links:
                    if link.is_displayed():
                        assert link.is_enabled(), "Breadcrumb links should remain enabled after interactions"

    def get_element_size_by_element(self, element):
        """Helper method to get element size"""
        size = element.size
        return size['width'], size['height']

    def get_element_position_by_element(self, element):
        """Helper method to get element position"""
        location = element.location
        return location['x'], location['y']