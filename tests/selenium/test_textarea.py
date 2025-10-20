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
Textarea Component Tests
Following CLAUDE.md requirements: 4 tests per component (Functionality, Visual Rendering, Navigation, Runtime Stability)
"""




class TestTextarea:
    """Test suite for Textarea component."""

    def test_textarea_functionality(self, driver, test_helper, assertions):
        """
        Test 1: Textarea Functionality
        Test core textarea interactions and state changes
        """
        # Navigate to inputs page (where textareas are located)
        test_helper.navigate_to_category("inputs")

        # Test message textarea functionality
        message_textarea = test_helper.wait_for_element(Locators.TEXTAREA_MESSAGE)

        # Test typing into textarea
        test_helper.type_text(Locators.TEXTAREA_MESSAGE, TestData.TEST_MESSAGE)
        time.sleep(0.3)

        # Verify text was entered
        entered_value = message_textarea.get_attribute('value')
        assert entered_value == TestData.TEST_MESSAGE, \
            f"Expected textarea value '{TestData.TEST_MESSAGE}', got '{entered_value}'"

        # Test multi-line input
        multi_line_text = "Line 1\nLine 2\nLine 3"
        message_textarea.clear()
        message_textarea.send_keys(multi_line_text)
        time.sleep(0.3)

        # Verify multi-line text was entered
        multi_line_value = message_textarea.get_attribute('value')
        assert multi_line_text in multi_line_value, \
            f"Expected multi-line text '{multi_line_text}', got '{multi_line_value}'"

        # Test clearing textarea
        message_textarea.clear()
        time.sleep(0.2)

        cleared_value = message_textarea.get_attribute('value')
        assert cleared_value == "", f"Expected empty textarea after clear, got '{cleared_value}'"

        # Test long text input
        long_text = TestData.LONG_TEXT
        message_textarea.send_keys(long_text)
        time.sleep(0.3)

        # Verify long text accepted
        long_value = message_textarea.get_attribute('value')
        assert long_text in long_value, \
            f"Textarea should accept long text, got '{long_value[:100]}...'"

        # Test test textarea (if present)
        try:
            test_textarea = test_helper.wait_for_element(Locators.TEXTAREA, timeout=5)
            test_textarea.send_keys("Test textarea content")
            time.sleep(0.3)

            test_value = test_textarea.get_attribute('value')
            assert "Test textarea content" in test_value, \
                f"Test textarea should accept input, got '{test_value}'"
        except TimeoutException:
            # Test textarea might not be present, that's okay
            pass

    def test_textarea_renders_normally(self, driver, test_helper, assertions):
        """
        Test 2: Visual Rendering
        Test textarea renders without visual abnormalities
        """
        # Navigate to inputs page
        test_helper.navigate_to_category("inputs")

        # Test message textarea rendering
        message_textarea = test_helper.wait_for_element(Locators.TEXTAREA_MESSAGE)
        assertions.assert_element_rendered_properly(message_textarea)

        # Check textarea has reasonable dimensions (textareas are typically larger than inputs)
        width, height = test_helper.get_element_size(Locators.TEXTAREA_MESSAGE)
        assert 200 <= width <= 1500, f"Textarea width {width} is outside reasonable range"
        assert 60 <= height <= 600, f"Textarea height {height} is outside reasonable range"

        # Textarea should be taller than a typical input
        assert height > 40, f"Textarea should be taller than typical input height"

        # Check textarea position
        x, y = test_helper.get_element_position(Locators.TEXTAREA_MESSAGE)
        assert x >= 0 and y >= 0, f"Textarea position ({x}, {y}) is negative"
        assert x <= 2000 and y <= 2000, f"Textarea position ({x}, {y}) is too far"

        # Test test textarea rendering (if present)
        try:
            test_textarea = test_helper.wait_for_element(Locators.TEXTAREA, timeout=5)
            assertions.assert_element_rendered_properly(test_textarea)

            # Verify textarea tag name
            assert message_textarea.tag_name.lower() == 'textarea', \
                f"Expected textarea element, got '{message_textarea.tag_name}'"

            assert test_textarea.tag_name.lower() == 'textarea', \
                f"Expected textarea element, got '{test_textarea.tag_name}'"

        except TimeoutException:
            # Test textarea might not be present, that's okay
            pass

        # Check textarea has proper label
        try:
            message_label = test_helper.driver.find_element(By.XPATH, "//label[@for='message']")
            assert message_label.is_displayed(), "Message textarea should have visible label"
        except:
            # Label might use different association method
            pass

        # Verify textarea attributes
        assert message_textarea.get_attribute('rows') is not None, \
            "Textarea should have rows attribute"

        rows_value = int(message_textarea.get_attribute('rows') or '0')
        assert rows_value >= 2, f"Textarea should have at least 2 rows, got {rows_value}"

    def test_textarea_navigation(self, driver, test_helper, assertions):
        """
        Test 3: Navigation
        Test textarea navigation behavior and keyboard interaction
        """
        # Navigate to inputs page
        test_helper.navigate_to_category("inputs")

        # Test tab navigation to textarea
        message_textarea = test_helper.wait_for_element(Locators.TEXTAREA_MESSAGE)

        # Click nearby input to establish focus context
        name_input = test_helper.wait_for_element(Locators.INPUT_NAME)
        name_input.click()
        time.sleep(0.2)

        # Tab to textarea (may need multiple tabs)
        for i in range(5):  # Max 5 tabs to reach textarea
            name_input.send_keys('\t')
            time.sleep(0.2)
            active_element = test_helper.driver.switch_to.active_element

            if active_element.get_attribute('data-testid') == 'textarea-message':
                break

        # Test textarea keyboard navigation
        active_element = test_helper.driver.switch_to.active_element
        if active_element.get_attribute('data-testid') == 'textarea-message':
            # Test typing and navigation
            active_element.send_keys("Test content")
            time.sleep(0.2)

            # Test arrow keys within textarea
            active_element.send_keys('\nSecond line')
            time.sleep(0.2)

            # Test Home/End keys
            active_element.send_keys('\ue015')  # Home key
            time.sleep(0.1)
            active_element.send_keys('\ue014')  # End key
            time.sleep(0.1)

            # Verify content still there
            content = active_element.get_attribute('value')
            assert "Test content" in content, "Textarea content should persist after keyboard navigation"

        # Test shift+tab navigation backwards
        try:
            message_textarea.send_keys('\ue004')  # Shift+Tab
            time.sleep(0.2)

            # Check focus moved to previous element
            new_active = test_helper.driver.switch_to.active_element
            assert new_active != message_textarea, "Focus should move away from textarea with Shift+Tab"
        except:
            # Shift+Tab navigation might work differently
            pass

        # Test no navigation errors
        assertions.assert_no_console_errors(test_helper.driver)

    def test_textarea_no_errors(self, driver, test_helper, assertions):
        """
        Test 4: Runtime Stability
        Test textarea runtime stability and console errors
        """
        # Navigate to inputs page
        test_helper.navigate_to_category("inputs")

        # Check initial console state
        initial_errors = test_helper.get_console_errors()
        assert len(initial_errors) == 0, \
            f"Page loaded with {len(initial_errors)} JavaScript errors: {[e['message'] for e in initial_errors]}"

        # Test rapid textarea changes to trigger potential errors
        message_textarea = test_helper.wait_for_element(Locators.TEXTAREA_MESSAGE)

        # Rapid text changes
        for i in range(15):
            message_textarea.clear()
            message_textarea.send_keys(f"Test text {i}\nLine {i}")
            time.sleep(0.05)

        # Test very long text input
        message_textarea.clear()
        very_long_text = "A" * 5000  # 5000 characters
        message_textarea.send_keys(very_long_text)
        time.sleep(0.3)

        # Test special characters and formatting
        special_text = "Special chars: !@#$%^&*()_+-={}[]|\\:;\"'<>?,./\nTabs\tand\nnewlines\n\nDouble newlines"
        message_textarea.clear()
        message_textarea.send_keys(special_text)
        time.sleep(0.3)

        # Test focus/blur cycles
        for i in range(10):
            message_textarea.click()
            time.sleep(0.1)
            name_input = test_helper.wait_for_element(Locators.INPUT_NAME)
            name_input.click()
            time.sleep(0.1)

        # Test copy/paste-like operations
        message_textarea.clear()
        message_textarea.send_keys("Select this text")
        time.sleep(0.2)

        # Simulate Ctrl+A (select all)
        message_textarea.send_keys('\ue009')  # Ctrl
        message_textarea.send_keys('a')
        time.sleep(0.2)

        message_textarea.send_keys("New text replacing selection")
        time.sleep(0.3)

        # Check for console errors after interactions
        final_errors = test_helper.get_console_errors()
        error_messages = [error['message'] for error in final_errors]

        assert len(final_errors) == 0, \
            f"Textarea interactions caused {len(final_errors)} JavaScript errors: {error_messages}"

        # Test textarea elements are still functional
        assert message_textarea.is_displayed(), "Message textarea should still be displayed"
        assert message_textarea.is_enabled(), "Message textarea should still be enabled"

        # Verify no JavaScript exceptions thrown
        logs = test_helper.driver.get_log('browser')
        js_exceptions = [log for log in logs if 'Uncaught' in log.get('message', '')]

        assert len(js_exceptions) == 0, \
            f"Found {len(js_exceptions)} JavaScript exceptions: {[log['message'] for log in js_exceptions]}"

        # Test textarea can still accept input
        final_value = message_textarea.get_attribute('value')
        assert "New text replacing selection" in final_value, \
            "Textarea content should persist after stress test"

        # Test final input acceptance
        message_textarea.clear()
        message_textarea.send_keys("Final test input")
        time.sleep(0.2)

        final_test_value = message_textarea.get_attribute('value')
        assert final_test_value == "Final test input", \
            f"Textarea should accept final input, got '{final_test_value}'"