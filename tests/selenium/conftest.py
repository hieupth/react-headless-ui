"""
Selenium configuration for React UI Forge tests.
Provides WebDriver setup and teardown following CLAUDE.md requirements.
"""

import pytest
import sys
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service


def pytest_addoption(parser):
    """Add command line options for tests"""
    parser.addoption(
        "--headless",
        action="store_true",
        default=False,
        help="Run tests in headless mode"
    )


@pytest.fixture(scope="session")
def driver(request):
    """Setup WebDriver for tests"""
    # Chrome options
    chrome_options = Options()

    if request.config.getoption("--headless"):
        chrome_options.add_argument("--headless")

    # Common Chrome options
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-web-security")
    chrome_options.add_argument("--allow-running-insecure-content")
    chrome_options.add_argument("--disable-features=VizDisplayCompositor")

    # Set window size
    chrome_options.add_argument("--window-size=1280,720")

    # Initialize driver
    try:
        # Use system chromedriver directly
        system_chromedriver = "/opt/homebrew/bin/chromedriver"
        if os.path.exists(system_chromedriver):
            service = Service(executable_path=system_chromedriver)
            driver = webdriver.Chrome(service=service, options=chrome_options)
        else:
            # Try using local chromedriver
            chromedriver_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../chromedriver'))
            if os.path.exists(chromedriver_path):
                service = Service(executable_path=chromedriver_path)
                driver = webdriver.Chrome(service=service, options=chrome_options)
            else:
                # Last resort: use Selenium Manager without automatic path detection
                chrome_options.add_argument("--disable-extensions")
                chrome_options.add_argument("--no-sandbox")
                chrome_options.add_argument("--disable-dev-shm-usage")
                driver = webdriver.Chrome(options=chrome_options)
        driver.implicitly_wait(5)
        print(f"WebDriver initialized successfully: {driver.title}")

        # Mark as non-sensitive to prevent skipping
        driver._is_sensitive = False

        yield driver

    except Exception as e:
        import traceback
        print(f"WebDriver initialization failed: {e}")
        traceback.print_exc()
        pytest.fail(f"Failed to initialize WebDriver: {e}")

    finally:
        if 'driver' in locals():
            driver.quit()


@pytest.fixture(scope="session")
def base_url():
    """Get base URL for tests"""
    return "http://localhost:3000/"


@pytest.fixture(scope="session")
def interactive_url():
    """Get interactive test page URL for component tests"""
    return "http://localhost:3000/test-interactive"


@pytest.fixture(scope="session")
def sensitive_url():
    """Override sensitive URL fixture to prevent skipping"""
    return None


@pytest.fixture
def wait(driver):
    """Provide WebDriverWait instance"""
    return webdriver.support.ui.WebDriverWait(driver, 10)


@pytest.fixture(autouse=True)
def setup_test_environment(driver, base_url):
    """Setup test environment before each test"""
    # Navigate to base URL
    driver.get(base_url)

    # Wait for page to load
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.common.by import By

    try:
        webdriver.support.ui.WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
    except:
        # Page might be loading, give it a moment
        import time
        time.sleep(2)

    # Clear console logs before test
    try:
        driver.get_log('browser')
    except:
        pass


def pytest_configure(config):
    """Configure pytest"""
    # Add custom markers
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "accessibility: marks tests as accessibility tests"
    )
    config.addinivalue_line(
        "markers", "navigation: marks tests as navigation tests"
    )
    config.addinivalue_line(
        "markers", "health: marks tests as health check tests"
    )


def pytest_collection_modifyitems(config, items):
    """Modify test collection"""
    # Add markers based on test names
    for item in items:
        if "accessibility" in item.nodeid.lower():
            item.add_marker(pytest.mark.accessibility)
        if "navigation" in item.nodeid.lower():
            item.add_marker(pytest.mark.navigation)
        if "health" in item.nodeid.lower():
            item.add_marker(pytest.mark.health)

        # Remove skip_sensitive marker if present
        for keyword in item.iter_markers():
            if keyword.name == "skip_sensitive":
                item.add_marker(pytest.mark.skip_sensitive(False))