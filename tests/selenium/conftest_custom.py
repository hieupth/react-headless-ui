"""
Custom pytest configuration for CLAUDE.md Selenium testing
Configures Chrome with portable Chrome installation
"""

import pytest
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

# Use our portable Chrome paths
CHROME_BINARY_PATH = '/home/hieupth/.chrome-portable/chrome-linux64/chrome'
CHROMEDRIVER_PATH = '/home/hieupth/.chrome-driver/chromedriver-linux64/chromedriver'

@pytest.fixture(scope="session")
def driver():
    """Create a Chrome WebDriver instance with portable Chrome."""
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--disable-extensions')
    chrome_options.add_argument('--disable-web-security')
    chrome_options.add_argument('--allow-running-insecure-content')
    chrome_options.add_argument('--window-size=1280,720')

    # Use portable Chrome
    chrome_options.binary_location = CHROME_BINARY_PATH

    # Use our ChromeDriver
    service = Service(executable_path=CHROMEDRIVER_PATH)

    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.implicitly_wait(10)

    yield driver

    driver.quit()

@pytest.fixture(scope="session")
def base_url():
    """Base URL for testing - example app should be running on localhost:3000"""
    return "http://localhost:3000"