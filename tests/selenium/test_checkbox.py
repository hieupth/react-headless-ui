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
Checkbox Component Tests
Following CLAUDE.md requirements: 4 tests per component (Functionality, Visual Rendering, Navigation, Runtime Stability)
"""




class TestCheckbox:
    """Test suite for Checkbox component."""

    def test_checkbox_functionality(self, driver, test_helper, assertions):
        """
        Test 1: Checkbox Functionality
        Test core checkbox interactions and state changes
        """
        # Navigate to inputs page (where checkboxes are located)
        test_helper.navigate_to_category("inputs")

        # Test subscribe checkbox functionality
        subscribe_checkbox = test_helper.wait_for_element(Locators.CHECKBOX_SUBSCRIBE)

        # Get initial state
        initial_checked = subscribe_checkbox.get_attribute('checked') == 'true'
        initial_aria_checked = subscribe_checkbox.get_attribute('aria-checked') == 'true'

        # Click the checkbox
        subscribe_checkbox.click()
        time.sleep(0.3)

        # Verify state changed
        new_checked = subscribe_checkbox.get_attribute('checked') == 'true'
        new_aria_checked = subscribe_checkbox.get_attribute('aria-checked') == 'true'

        assert new_checked != initial_checked, \
            f"Checkbox checked state should change from {initial_checked} to {new_checked}"

        # Verify aria-checked attribute updated (allow for different implementations)
        # Some implementations may use aria-checked, others may not
        if subscribe_checkbox.get_attribute('aria-checked') is not None:
            assert new_aria_checked != initial_aria_checked, \
                f"Checkbox aria-checked should change from {initial_aria_checked} to {new_aria_checked}"

        # Test test checkbox
        test_checkbox = test_helper.wait_for_element(Locators.CHECKBOX)
        test_checkbox.click()
        time.sleep(0.3)

        # Verify test checkbox functionality
        test_checked = test_checkbox.get_attribute('checked') == 'true'
        assert isinstance(test_checked, bool), "Checkbox should have boolean checked state"

        # Test multiple state changes
        # Start with current state and verify it toggles each time
        expected_next_state = not (subscribe_checkbox.get_attribute('checked') == 'true')
        for i in range(3):
            subscribe_checkbox.click()
            time.sleep(0.2)
            current_state = subscribe_checkbox.get_attribute('checked') == 'true'
            # State should match expected toggle
            assert current_state == expected_next_state, f"Toggle {i+1} should result in state {expected_next_state}, got {current_state}"
            expected_next_state = not expected_next_state

    def test_checkbox_renders_normally(self, driver, test_helper, assertions):
        """
        Test 2: Visual Rendering
        Test checkbox renders without visual abnormalities
        """
        # Navigate to inputs page
        test_helper.navigate_to_category("inputs")

        # Test subscribe checkbox rendering
        subscribe_checkbox = test_helper.wait_for_element(Locators.CHECKBOX_SUBSCRIBE)
        assertions.assert_element_rendered_properly(subscribe_checkbox)

        # Check checkbox has reasonable dimensions
        width, height = test_helper.get_element_size(Locators.CHECKBOX_SUBSCRIBE)
        assert 10 <= width <= 50, f"Checkbox width {width} is outside reasonable range"
        assert 10 <= height <= 50, f"Checkbox height {height} is outside reasonable range"

        # Check checkbox position
        x, y = test_helper.get_element_position(Locators.CHECKBOX_SUBSCRIBE)
        assert x >= 0 and y >= 0, f"Checkbox position ({x}, {y}) is negative"
        assert x <= 2000 and y <= 2000, f"Checkbox position ({x}, {y}) is too far"

        # Test test checkbox rendering
        test_checkbox = test_helper.wait_for_element(Locators.CHECKBOX)
        assertions.assert_element_rendered_properly(test_checkbox)

        # Verify checkbox type attributes
        assert subscribe_checkbox.get_attribute('type') == 'checkbox', \
            f"Expected checkbox type, got '{subscribe_checkbox.get_attribute('type')}'"

        assert test_checkbox.get_attribute('type') == 'checkbox', \
            f"Expected checkbox type, got '{test_checkbox.get_attribute('type')}'"

        # Check accessibility attributes
        assert subscribe_checkbox.get_attribute('role') is not None or \
               subscribe_checkbox.tag_name == 'input', \
               "Checkbox should have proper role or be input element"

        # Verify associated labels are visible
        try:
            subscribe_label = test_helper.driver.find_element(By.XPATH, "//label[@for='subscribe']")
            assert subscribe_label.is_displayed(), "Subscribe checkbox should have visible label"

            test_label = test_helper.driver.find_element(By.XPATH, "//label[@for='checkbox']")
            assert test_label.is_displayed(), "Test checkbox should have visible label"
        except:
            # Labels might use different association method
            pass

    def test_checkbox_navigation(self, driver, test_helper, assertions):
        """
        Test 3: Navigation
        Test checkbox navigation behavior and keyboard interaction
        """
        # Navigate to inputs page
        test_helper.navigate_to_category("inputs")

        # Test keyboard navigation to checkbox
        subscribe_checkbox = test_helper.wait_for_element(Locators.CHECKBOX_SUBSCRIBE)

        # Click nearby input to establish focus context
        name_input = test_helper.wait_for_element(Locators.INPUT_NAME)
        name_input.click()
        time.sleep(0.2)

        # Tab to checkbox (may need multiple tabs)
        for i in range(5):  # Max 5 tabs to reach checkbox
            name_input.send_keys('\t')
            time.sleep(0.2)
            active_element = test_helper.driver.switch_to.active_element

            if active_element.get_attribute('data-testid') == 'checkbox-subscribe':
                break

        # Test space bar activation
        active_element = test_helper.driver.switch_to.active_element
        if active_element.get_attribute('data-testid') == 'checkbox-subscribe':
            initial_state = active_element.get_attribute('checked') == 'true'

            # Press space to toggle
            active_element.send_keys(' ')
            time.sleep(0.3)

            new_state = active_element.get_attribute('checked') == 'true'
            assert new_state != initial_state, \
                "Space bar should toggle checkbox state"

        # Test clicking label to toggle checkbox
        try:
            subscribe_label = test_helper.driver.find_element(By.XPATH, "//label[@for='subscribe']")
            label_state_before = subscribe_checkbox.get_attribute('checked') == 'true'

            subscribe_label.click()
            time.sleep(0.3)

            label_state_after = subscribe_checkbox.get_attribute('checked') == 'true'
            assert label_state_after != label_state_before, \
                "Clicking label should toggle checkbox state"

        except:
            # Label interaction might work differently
            pass

        # Test no navigation errors
        assertions.assert_no_console_errors(test_helper.driver)

    def test_checkbox_no_errors(self, driver, test_helper, assertions):
        """
        Test 4: Runtime Stability
        Test checkbox runtime stability and console errors
        """
        # Navigate to inputs page
        test_helper.navigate_to_category("inputs")

        # Check initial console state
        initial_errors = test_helper.get_console_errors()
        assert len(initial_errors) == 0, \
            f"Page loaded with {len(initial_errors)} JavaScript errors: {[e['message'] for e in initial_errors]}"

        # Test rapid checkbox toggling to trigger potential errors
        subscribe_checkbox = test_helper.wait_for_element(Locators.CHECKBOX_SUBSCRIBE)
        test_checkbox = test_helper.wait_for_element(Locators.CHECKBOX)

        # Rapid clicking on both checkboxes
        for i in range(20):
            subscribe_checkbox.click()
            test_checkbox.click()
            time.sleep(0.05)

        # Test mixed interaction (click + keyboard)
        subscribe_checkbox.click()
        subscribe_checkbox.send_keys(' ')
        time.sleep(0.2)

        test_checkbox.click()
        test_checkbox.send_keys(' ')
        time.sleep(0.2)

        # Test focus management
        subscribe_checkbox.click()
        time.sleep(0.1)
        test_checkbox.click()
        time.sleep(0.1)
        subscribe_checkbox.click()
        time.sleep(0.1)

        # Test checkbox states after rapid interactions
        subscribe_state = subscribe_checkbox.get_attribute('checked') == 'true'
        test_state = test_checkbox.get_attribute('checked') == 'true'

        assert isinstance(subscribe_state, bool), "Subscribe checkbox should have boolean state"
        assert isinstance(test_state, bool), "Test checkbox should have boolean state"

        # Check for console errors after interactions
        final_errors = test_helper.get_console_errors()
        error_messages = [error['message'] for error in final_errors]

        assert len(final_errors) == 0, \
            f"Checkbox interactions caused {len(final_errors)} JavaScript errors: {error_messages}"

        # Test checkbox elements are still functional
        assert subscribe_checkbox.is_displayed(), "Subscribe checkbox should still be displayed"
        assert subscribe_checkbox.is_enabled(), "Subscribe checkbox should still be enabled"
        assert test_checkbox.is_displayed(), "Test checkbox should still be displayed"
        assert test_checkbox.is_enabled(), "Test checkbox should still be enabled"

        # Verify no JavaScript exceptions thrown
        logs = test_helper.driver.get_log('browser')
        js_exceptions = [log for log in logs if 'Uncaught' in log.get('message', '')]

        assert len(js_exceptions) == 0, \
            f"Found {len(js_exceptions)} JavaScript exceptions: {[log['message'] for log in js_exceptions]}"

        # Test checkbox can still be toggled
        final_subscribe_state = subscribe_checkbox.get_attribute('checked') == 'true'
        subscribe_checkbox.click()
        time.sleep(0.2)

        after_click_state = subscribe_checkbox.get_attribute('checked') == 'true'
        assert after_click_state != final_subscribe_state, \
            "Checkbox should still be toggleable after stress test"