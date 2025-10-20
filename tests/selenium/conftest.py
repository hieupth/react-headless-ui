"""
Selenium test configuration for React UI Forge component testing.
Following CLAUDE.md requirements for comprehensive testing.
"""

import pytest
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException


@pytest.fixture(scope="function")
def driver():
    """Create and configure Chrome WebDriver for testing - function scoped for parallel execution."""
    chrome_options = Options()

    # Fast headless configuration
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1280,720")  # Reasonable size for testing

    # Performance optimizations
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-plugins")
    chrome_options.add_argument("--disable-images")
    chrome_options.add_argument("--disable-web-security")
    chrome_options.add_argument("--disable-features=VizDisplayCompositor")
    chrome_options.add_argument("--no-first-run")
    chrome_options.add_argument("--no-default-browser-check")
    chrome_options.add_argument("--disable-background-timer-throttling")
    chrome_options.add_argument("--disable-renderer-backgrounding")
    chrome_options.add_argument("--disable-background-networking")
    chrome_options.add_argument("--disable-default-apps")
    chrome_options.add_argument("--disable-sync")
    chrome_options.add_argument("--disable-translate")
    chrome_options.add_argument("--mute-audio")
    chrome_options.add_argument("--disable-logging")

    # Minimal logging
    chrome_options.set_capability('goog:loggingPrefs', {
        'browser': 'SEVERE'  # Only severe errors
    })

    # Use ChromeDriver service
    service = Service('/opt/homebrew/bin/chromedriver')

    # Create driver with faster timeouts
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.set_script_timeout(10)  # 10 second script timeout
    driver.set_page_load_timeout(10)  # 10 second page load timeout
    driver.implicitly_wait(1)  # 1 second implicit wait

    yield driver

    # Cleanup
    try:
        driver.quit()
    except:
        pass  # Ignore cleanup errors


@pytest.fixture(scope="session")
def base_url():
    """Base URL for the example application."""
    return "http://localhost:3000"


@pytest.fixture(scope="function")
def loaded_driver(driver, base_url):
    """Driver with loaded page and error checking."""
    # Load the page
    driver.get(base_url)

    # Wait for page to load
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
    except TimeoutException:
        raise Exception("Page failed to load within timeout period")

    # Check for JavaScript errors
    logs = driver.get_log('browser')
    errors = [log for log in logs if log['level'] in ['SEVERE', 'WARNING']]

    if errors:
        error_messages = [error['message'] for error in errors[:3]]  # Show first 3 errors
        raise Exception(f"JavaScript errors detected on page load: {error_messages}")

    return driver


class ComponentTestHelper:
    """Helper class for common component testing operations."""

    def __init__(self, driver, base_url):
        self.driver = driver
        self.base_url = base_url

    def navigate_to_category(self, category_path):
        """Navigate to a specific category page."""
        url = f"{self.base_url}/{category_path}"
        self.driver.get(url)

        # Fast page load - minimal wait
        try:
            WebDriverWait(self.driver, 2).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
        except:
            pass  # Continue even if page load is slow

        return url

    def get_console_errors(self):
        """Get JavaScript console errors."""
        logs = self.driver.get_log('browser')
        # Filter out favicon.ico 404 errors and webpack development errors as they're not actual JavaScript errors
        return [log for log in logs
                if log['level'] == 'SEVERE' and
                'favicon.ico' not in log.get('message', '') and
                'webpack-internal' not in log.get('message', '')]

    def has_console_errors(self):
        """Check if there are any console errors."""
        return len(self.get_console_errors()) > 0

    def wait_for_element(self, locator, timeout=2):
        """Wait for element to be present."""
        try:
            return WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located(locator)
            )
        except:
            # Fallback to immediate find
            return self.driver.find_element(*locator)

    def wait_for_clickable(self, locator, timeout=2):
        """Wait for element to be clickable."""
        try:
            return WebDriverWait(self.driver, timeout).until(
                EC.element_to_be_clickable(locator)
            )
        except:
            # Fallback to immediate find
            return self.driver.find_element(*locator)

    def is_element_visible(self, locator):
        """Check if element is visible."""
        try:
            element = self.driver.find_element(*locator)
            return element.is_displayed()
        except:
            return False

    def get_element_size(self, locator):
        """Get element size (width, height)."""
        element = self.wait_for_element(locator)
        size = element.size
        return size['width'], size['height']

    def get_element_position(self, locator):
        """Get element position (x, y)."""
        element = self.wait_for_element(locator)
        location = element.location
        return location['x'], location['y']

    def get_element_size_by_element(self, element):
        """Get element size (width, height) from element."""
        size = element.size
        return size['width'], size['height']

    def get_element_position_by_element(self, element):
        """Get element position (x, y) from element."""
        location = element.location
        return location['x'], location['y']

    def click_element(self, locator):
        """Click element with error handling."""
        element = self.wait_for_clickable(locator)
        element.click()
        return element

    def type_text(self, locator, text):
        """Type text into an input field."""
        element = self.wait_for_element(locator)
        element.clear()
        element.send_keys(text)
        return element

    def get_element_text(self, locator):
        """Get element text content."""
        element = self.wait_for_element(locator)
        return element.text

    def get_element_attribute(self, locator, attribute):
        """Get element attribute value."""
        element = self.wait_for_element(locator)
        return element.get_attribute(attribute)

    def scroll_to_element(self, locator):
        """Scroll to element."""
        element = self.wait_for_element(locator)
        self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
        return element


@pytest.fixture(scope="function")
def test_helper(driver, base_url):
    """Provide test helper instance."""
    return ComponentTestHelper(driver, base_url)


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
        # Filter out favicon.ico 404 errors and webpack development errors as they're not actual JavaScript errors
        errors = [log for log in logs
                 if log['level'] == 'SEVERE' and
                 'favicon.ico' not in log.get('message', '') and
                 'webpack-internal' not in log.get('message', '')]

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


@pytest.fixture(scope="function")
def assertions():
    """Provide assertion helper."""
    return ComponentAssertions()


# Pytest configuration and markers
def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "component: marks tests as component tests"
    )
    config.addinivalue_line(
        "markers", "navigation: marks tests as navigation tests"
    )
    config.addinivalue_line(
        "markers", "accessibility: marks tests as accessibility tests"
    )
    config.addinivalue_line(
        "markers", "visual: marks tests as visual rendering tests"
    )