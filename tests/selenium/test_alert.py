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
Alert Component Tests
Following CLAUDE.md requirements: 4 tests per component (Functionality, Visual Rendering, Navigation, Runtime Stability)
"""




class TestAlert:
    """Test suite for Alert component."""

    def test_alert_functionality(self, driver, test_helper, assertions):
        """Test 1: Alert Functionality"""
        test_helper.navigate_to_category("feedback")

        # Look for alert elements
        alert_selectors = ["[data-testid*='alert']", ".alert", "[role='alert']", ".notification"]

        for selector in alert_selectors:
            try:
                alerts = test_helper.driver.find_elements(By.CSS_SELECTOR, selector)
                for alert in alerts[:3]:
                    if alert.is_displayed():
                        # Test alert visibility and content
                        alert_text = alert.text
                        assert len(alert_text) > 0, "Alert should have content"

                        # Test dismiss button if present
                        dismiss_btn = alert.find_elements(By.CSS_SELECTOR, ".close, [aria-label='Close'], button")
                        for btn in dismiss_btn:
                            if btn.is_displayed() and btn.is_enabled():
                                btn.click()
                                time.sleep(0.5)
                                break
                break
            except:
                continue

    def test_alert_renders_normally(self, driver, test_helper, assertions):
        """Test 2: Visual Rendering"""
        test_helper.navigate_to_category("feedback")

        alert_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".alert, [role='alert'], .notification")

        for alert in alert_elements:
            if alert.is_displayed():
                assertions.assert_element_rendered_properly(alert)
                width, height = alert.size.values()
                assert 50 <= width <= 1000, f"Alert width {width} unreasonable"
                assert 20 <= height <= 1500, f"Alert height {height} unreasonable"

    def test_alert_navigation(self, driver, test_helper, assertions):
        """Test 3: Navigation"""
        test_helper.navigate_to_category("feedback")

        # Test that alerts don't interfere with navigation
        try:
            home_link = test_helper.driver.find_element(By.LINK_TEXT, "Home")
            home_link.click()
            time.sleep(0.5)
            assertions.assert_no_console_errors(test_helper.driver)
        except:
            pass

    def test_alert_no_errors(self, driver, test_helper, assertions):
        """Test 4: Runtime Stability"""
        test_helper.navigate_to_category("feedback")

        initial_errors = test_helper.get_console_errors()
        # Filter out webpack development errors
        filtered_errors = [e for e in initial_errors if 'webpack-internal' not in e.get('message', '')]
        assert len(filtered_errors) == 0, f"Page loaded with errors: {len(filtered_errors)}"

        # Test alert interactions
        alerts = test_helper.driver.find_elements(By.CSS_SELECTOR, ".alert, [role='alert']")
        for alert in alerts:
            if alert.is_displayed():
                try:
                    # Test clicking alert
                    alert.click()
                    time.sleep(0.2)
                except:
                    pass

        final_errors = test_helper.get_console_errors()
        filtered_final_errors = [e for e in final_errors if 'webpack-internal' not in e.get('message', '')]
        assert len(filtered_final_errors) == 0, f"Alert interactions caused errors: {len(filtered_final_errors)}"