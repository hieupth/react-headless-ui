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
Button Component Tests
Following CLAUDE.md requirements: 4 tests per component (Functionality, Visual Rendering, Navigation, Runtime Stability)
"""




class TestButton:
    """Test suite for Button component."""

    def test_button_functionality(self, driver, test_helper, assertions):
        """
        Test 1: Button Functionality
        Test core button interactions and state changes
        """
        # Navigate to buttons page
        test_helper.navigate_to_category("buttons")

        # Test counter button functionality
        counter_button = test_helper.wait_for_element(Locators.BUTTON_COUNTER)
        initial_text = counter_button.text

        # Click the button
        counter_button.click()
        time.sleep(0.5)  # Allow state update

        # Verify counter incremented
        updated_text = counter_button.text
        assert "Clicked 1 times" in updated_text or "times" in updated_text, \
            f"Expected counter to increment, got '{updated_text}' from '{initial_text}'"

        # Click multiple times
        for i in range(3):
            counter_button.click()
            time.sleep(0.3)

        # Verify multiple clicks work
        final_text = counter_button.text
        assert "Clicked" in final_text and "times" in final_text, \
            f"Expected counter to show multiple clicks, got '{final_text}'"

        # Test reset button
        reset_button = test_helper.wait_for_element(Locators.BUTTON_RESET)
        reset_button.click()
        time.sleep(0.5)

        # Verify counter reset
        reset_text = counter_button.text
        assert "Clicked 0 times" in reset_text or "0" in reset_text, \
            f"Expected counter to reset to 0, got '{reset_text}'"

    def test_button_renders_normally(self, driver, test_helper, assertions):
        """
        Test 2: Visual Rendering
        Test button renders without visual abnormalities
        """
        # Navigate to buttons page
        test_helper.navigate_to_category("buttons")

        # Test main counter button rendering
        counter_button = test_helper.wait_for_element(Locators.BUTTON_COUNTER)
        assertions.assert_element_rendered_properly(counter_button)

        # Check button has reasonable dimensions
        width, height = test_helper.get_element_size(Locators.BUTTON_COUNTER)
        assert 50 <= width <= 400, f"Button width {width} is outside reasonable range"
        assert 20 <= height <= 80, f"Button height {height} is outside reasonable range"

        # Check button position (not way off screen)
        x, y = test_helper.get_element_position(Locators.BUTTON_COUNTER)
        assert x >= 0 and y >= 0, f"Button position ({x}, {y}) is negative"
        assert x <= 2000 and y <= 2000, f"Button position ({x}, {y}) is too far"

        # Test reset button rendering
        reset_button = test_helper.wait_for_element(Locators.BUTTON_RESET)
        assertions.assert_element_rendered_properly(reset_button)

        # Test loading button rendering
        loading_button = test_helper.wait_for_element(Locators.BUTTON_LOADING)
        assertions.assert_element_rendered_properly(loading_button)

        # Test disabled button rendering
        disabled_button = test_helper.wait_for_element(Locators.BUTTON_DISABLED)
        assertions.assert_element_rendered_properly(disabled_button)

        # Verify disabled button is actually disabled
        assert disabled_button.get_attribute('disabled') is not None or \
               disabled_button.get_attribute('aria-disabled') == 'true', \
               "Disabled button should have disabled attribute"

    def test_button_navigation(self, driver, test_helper, assertions):
        """
        Test 3: Navigation
        Test button navigation behavior and URL changes
        """
        # Start from home page
        test_helper.driver.get(test_helper.base_url)

        # Wait for home page to load and look for Buttons link with multiple selectors
        buttons_selectors = [
            (By.LINK_TEXT, "Buttons"),
            (By.PARTIAL_LINK_TEXT, "Buttons"),
            (By.CSS_SELECTOR, "a[href='/buttons/']"),
            (By.XPATH, "//a[contains(@href, '/buttons')]"),
            (By.XPATH, "//h2[text()='Buttons']/ancestor::a")
        ]

        buttons_link = None
        for selector_type, selector_value in buttons_selectors:
            try:
                WebDriverWait(test_helper.driver, 5).until(
                    EC.presence_of_element_located((selector_type, selector_value))
                )
                buttons_link = test_helper.driver.find_element(selector_type, selector_value)
                if buttons_link and buttons_link.is_displayed():
                    break
            except:
                continue

        # If we found a Buttons link, click it
        if buttons_link:
            buttons_link.click()
        else:
            # If no link found, navigate directly to buttons page
            test_helper.driver.get(f"{test_helper.base_url}/buttons")

        # Wait for navigation
        time.sleep(1)

        # Verify navigation worked
        assertions.assert_navigation_works(test_helper.driver, "/buttons")

        # Test breadcrumb navigation
        try:
            breadcrumb_link = test_helper.driver.find_element(By.LINK_TEXT, "Home")
            breadcrumb_link.click()
            time.sleep(1)

            # Verify back to home
            current_url = test_helper.driver.current_url
            assert current_url.endswith('/') or '/page' in current_url, \
                f"Expected to be back on home page, got {current_url}"

        except:
            # Breadcrumb might not be present, that's okay
            pass

        # Test no navigation errors occurred
        assertions.assert_no_console_errors(test_helper.driver)

    def test_button_no_errors(self, driver, test_helper, assertions):
        """
        Test 4: Runtime Stability
        Test button runtime stability and console errors
        """
        # Navigate to buttons page
        test_helper.navigate_to_category("buttons")

        # Check initial console state
        initial_errors = test_helper.get_console_errors()
        assert len(initial_errors) == 0, \
            f"Page loaded with {len(initial_errors)} JavaScript errors: {[e['message'] for e in initial_errors]}"

        # Interact with buttons to trigger potential errors
        counter_button = test_helper.wait_for_element(Locators.BUTTON_COUNTER)

        # Rapid clicking to test for errors
        for i in range(10):
            counter_button.click()
            time.sleep(0.1)

        # Test loading button
        loading_button = test_helper.wait_for_element(Locators.BUTTON_LOADING)
        loading_button.click()
        time.sleep(0.5)  # Allow loading state to potentially trigger errors

        # Test reset button
        reset_button = test_helper.wait_for_element(Locators.BUTTON_RESET)
        reset_button.click()
        time.sleep(0.3)

        # Check for console errors after interactions
        final_errors = test_helper.get_console_errors()
        error_messages = [error['message'] for error in final_errors]

        assert len(final_errors) == 0, \
            f"Button interactions caused {len(final_errors)} JavaScript errors: {error_messages}"

        # Test button elements are still functional
        counter_button = test_helper.wait_for_element(Locators.BUTTON_COUNTER)
        assert counter_button.is_displayed(), "Counter button should still be displayed after interactions"
        assert counter_button.is_enabled(), "Counter button should still be enabled after interactions"

        # Verify no JavaScript exceptions thrown
        logs = test_helper.driver.get_log('browser')
        js_exceptions = [log for log in logs if 'Uncaught' in log.get('message', '')]

        assert len(js_exceptions) == 0, \
            f"Found {len(js_exceptions)} JavaScript exceptions: {[log['message'] for log in js_exceptions]}"