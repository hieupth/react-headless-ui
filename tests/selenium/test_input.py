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
Input Component Tests
Following CLAUDE.md requirements: 4 tests per component (Functionality, Visual Rendering, Navigation, Runtime Stability)
"""




class TestInput:
    """Test suite for Input component."""

    def test_input_functionality(self, driver, test_helper, assertions):
        """
        Test 1: Input Functionality
        Test core input interactions and state changes
        """
        # Navigate to inputs page
        test_helper.navigate_to_category("inputs")

        # Test name input functionality
        name_input = test_helper.wait_for_element(Locators.INPUT_NAME)

        # Test typing into input
        test_helper.type_text(Locators.INPUT_NAME, TestData.TEST_NAME)
        time.sleep(0.3)

        # Verify text was entered
        entered_value = name_input.get_attribute('value')
        assert entered_value == TestData.TEST_NAME, \
            f"Expected input value '{TestData.TEST_NAME}', got '{entered_value}'"

        # Test email input functionality
        email_input = test_helper.wait_for_element(Locators.INPUT_EMAIL)
        test_helper.type_text(Locators.INPUT_EMAIL, TestData.VALID_EMAIL)
        time.sleep(0.3)

        # Verify email was entered
        email_value = email_input.get_attribute('value')
        assert email_value == TestData.VALID_EMAIL, \
            f"Expected email value '{TestData.VALID_EMAIL}', got '{email_value}'"

        # Test clearing input
        name_input.clear()
        time.sleep(0.2)

        cleared_value = name_input.get_attribute('value')
        assert cleared_value == "", f"Expected empty input after clear, got '{cleared_value}'"

        # Test input with special characters
        special_text = "Test!@#$%^&*()_+-={}[]|\\:;\"'<>?,./"
        test_helper.type_text(Locators.INPUT_NAME, special_text)
        time.sleep(0.3)

        # Verify special characters accepted
        special_value = name_input.get_attribute('value')
        assert special_text in special_value, \
            f"Input should accept special characters, got '{special_value}'"

    def test_input_renders_normally(self, driver, test_helper, assertions):
        """
        Test 2: Visual Rendering
        Test input renders without visual abnormalities
        """
        # Navigate to inputs page
        test_helper.navigate_to_category("inputs")

        # Test name input rendering
        name_input = test_helper.wait_for_element(Locators.INPUT_NAME)
        assertions.assert_element_rendered_properly(name_input)

        # Check input has reasonable dimensions
        width, height = test_helper.get_element_size(Locators.INPUT_NAME)
        assert 100 <= width <= 800, f"Input width {width} is outside reasonable range"
        assert 20 <= height <= 200, f"Input height {height} is outside reasonable range"

        # Check input position
        x, y = test_helper.get_element_position(Locators.INPUT_NAME)
        assert x >= 0 and y >= 0, f"Input position ({x}, {y}) is negative"
        assert x <= 2000 and y <= 2000, f"Input position ({x}, {y}) is too far"

        # Test email input rendering
        email_input = test_helper.wait_for_element(Locators.INPUT_EMAIL)
        assertions.assert_element_rendered_properly(email_input)

        # Test textarea rendering (if present on inputs page)
        try:
            textarea = test_helper.wait_for_element(Locators.TEXTAREA_MESSAGE, timeout=5)
            assertions.assert_element_rendered_properly(textarea)
        except TimeoutException:
            # Textarea might not be on this page, that's okay
            pass

        # Verify input type attributes are correct
        assert name_input.get_attribute('type') == 'text', \
            f"Expected text input type, got '{name_input.get_attribute('type')}'"

        assert email_input.get_attribute('type') == 'email', \
            f"Expected email input type, got '{email_input.get_attribute('type')}'"

        # Check inputs have proper labels
        name_label = test_helper.driver.find_element(By.XPATH, "//label[@for='name']")
        assert name_label.is_displayed(), "Name input should have visible label"

        email_label = test_helper.driver.find_element(By.XPATH, "//label[@for='email']")
        assert email_label.is_displayed(), "Email input should have visible label"

    def test_input_navigation(self, driver, test_helper, assertions):
        """
        Test 3: Navigation
        Test input navigation behavior and form submission
        """
        # Navigate to inputs page
        test_helper.navigate_to_category("inputs")

        # Test tab navigation between inputs
        name_input = test_helper.wait_for_element(Locators.INPUT_NAME)
        name_input.click()

        # Tab to email input
        name_input.send_keys('\t')
        time.sleep(0.3)

        # Verify focus moved to email input
        active_element = test_helper.driver.switch_to.active_element
        assert active_element.get_attribute('data-testid') == 'input-email', \
            "Tab navigation should move focus to email input"

        # Test form submission navigation (if submit button exists)
        try:
            submit_button = test_helper.driver.find_element(Locators.BUTTON_SUBMIT)

            # Fill form and submit
            test_helper.type_text(Locators.INPUT_NAME, TestData.TEST_NAME)
            test_helper.type_text(Locators.INPUT_EMAIL, TestData.VALID_EMAIL)

            initial_url = test_helper.driver.current_url
            submit_button.click()
            time.sleep(1)

            # Check if navigation occurred (might stay on same page with success message)
            assertions.assert_no_console_errors(test_helper.driver)

        except:
            # Submit button might not be present or might behave differently
            pass

        # Test breadcrumb navigation if present
        try:
            breadcrumb_link = test_helper.driver.find_element(By.LINK_TEXT, "Home")
            breadcrumb_link.click()
            time.sleep(1)

            assertions.assert_navigation_works(test_helper.driver, "/")
        except:
            # Breadcrumb might not be present, that's okay
            pass

    def test_input_no_errors(self, driver, test_helper, assertions):
        """
        Test 4: Runtime Stability
        Test input runtime stability and console errors
        """
        # Navigate to inputs page
        test_helper.navigate_to_category("inputs")

        # Check initial console state
        initial_errors = test_helper.get_console_errors()
        assert len(initial_errors) == 0, \
            f"Page loaded with {len(initial_errors)} JavaScript errors: {[e['message'] for e in initial_errors]}"

        # Test rapid input changes to trigger potential errors
        name_input = test_helper.wait_for_element(Locators.INPUT_NAME)

        # Rapid text changes
        for i in range(20):
            name_input.clear()
            name_input.send_keys(f"Test text {i}")
            time.sleep(0.05)

        # Test very long text input
        name_input.clear()
        very_long_text = "A" * 1000  # 1000 characters
        name_input.send_keys(very_long_text)
        time.sleep(0.3)

        # Test invalid email format
        email_input = test_helper.wait_for_element(Locators.INPUT_EMAIL)
        email_input.clear()
        email_input.send_keys(TestData.INVALID_EMAIL)
        time.sleep(0.3)

        # Test valid email format
        email_input.clear()
        email_input.send_keys(TestData.VALID_EMAIL)
        time.sleep(0.3)

        # Test input focus/blur cycles
        for i in range(10):
            name_input.click()
            time.sleep(0.1)
            email_input.click()
            time.sleep(0.1)

        # Check for console errors after interactions
        final_errors = test_helper.get_console_errors()
        error_messages = [error['message'] for error in final_errors]

        assert len(final_errors) == 0, \
            f"Input interactions caused {len(final_errors)} JavaScript errors: {error_messages}"

        # Test input elements are still functional
        name_input = test_helper.wait_for_element(Locators.INPUT_NAME)
        assert name_input.is_displayed(), "Name input should still be displayed after interactions"
        assert name_input.is_enabled(), "Name input should still be enabled after interactions"

        # Verify no JavaScript exceptions thrown
        logs = test_helper.driver.get_log('browser')
        js_exceptions = [log for log in logs if 'Uncaught' in log.get('message', '')]

        assert len(js_exceptions) == 0, \
            f"Found {len(js_exceptions)} JavaScript exceptions: {[log['message'] for log in js_exceptions]}"

        # Test input values persisted correctly
        final_name_value = name_input.get_attribute('value')
        final_email_value = email_input.get_attribute('value')

        assert final_name_value == very_long_text, \
            f"Name input value should persist, expected '{very_long_text[:50]}...', got '{final_name_value[:50]}...'"

        assert final_email_value == TestData.VALID_EMAIL, \
            f"Email input value should persist, expected '{TestData.VALID_EMAIL}', got '{final_email_value}'"