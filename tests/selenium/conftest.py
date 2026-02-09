"""
Selenium test configuration for React UI Forge component testing.
Following CLAUDE.md requirements for comprehensive testing.
"""

import pytest
import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

from tests.selenium.strict_assertions import ComponentAssertions
from tests.selenium.test_constants import Locators, TestData

@pytest.fixture(scope="function")
def driver():
    """Create and configure Chrome WebDriver for testing - function scoped for parallel execution."""
    chrome_options = Options()

    # Use portable Chrome and ChromeDriver paths for CLAUDE.md compliance
    chrome_binary_path = os.environ.get('CHROME_BINARY_PATH', '/home/hieupth/.chrome-portable/chrome-linux64/chrome')
    chromedriver_path = os.environ.get('CHROMEDRIVER_PATH', '/home/hieupth/.chrome-driver/chromedriver-linux64/chromedriver')

    chrome_options.binary_location = chrome_binary_path

    # Stable headless configuration for container environments
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    # Use unique debug port for each test process to avoid conflicts
    import random
    debug_port = random.randint(9222, 9322)
    chrome_options.add_argument(f"--remote-debugging-port={debug_port}")

    # Essential stability options
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
    chrome_options.add_argument("--disable-permissions-api")
    chrome_options.add_argument("--disable-notifications")
    chrome_options.add_argument("--disable-popup-blocking")

    # Additional resource isolation options
    chrome_options.add_argument("--disable-background-timer-throttling")
    chrome_options.add_argument("--disable-renderer-backgrounding")
    chrome_options.add_argument("--disable-background-networking")
    chrome_options.add_argument("--disable-ipc-flooding-protection")
    chrome_options.add_argument("--max_old_space_size=4096")
    chrome_options.add_argument("--memory-pressure-off")

    # Minimal logging
    chrome_options.set_capability('goog:loggingPrefs', {
        'browser': 'SEVERE'  # Only severe errors
    })

    # Use ChromeDriver service with portable path
    service = Service(chromedriver_path)

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
        return ComponentAssertions._filtered_logs(logs)

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


@pytest.fixture(scope="function")
def assertions():
    """Provide assertion helper."""
    return ComponentAssertions()


@pytest.fixture(autouse=True)
def strict_runtime_checks(driver):
    """Run strict runtime checks after every test."""
    yield
    ComponentAssertions.assert_no_console_errors(driver)
    ComponentAssertions.assert_no_js_exceptions(driver)


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
