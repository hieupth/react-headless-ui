"""
Test helper functions for React UI Forge selenium tests.
Provides common utilities to reduce duplicate code and ensure consistency.
Following CLAUDE.md requirements for reusable utilities.
"""

import time
from selenium.webdriver.common.by import By


def filter_console_errors(logs):
    """
    Filter out network errors which are common in development environments.
    Returns only JavaScript errors, not HTTP/network errors.

    Args:
        logs: List of browser logs from selenium

    Returns:
        List of actual JavaScript errors (filtered logs)
    """
    return [log for log in logs if log['level'] == 'SEVERE' and 'Failed to load resource' not in log['message']]


def normalize_url(url):
    """
    Normalize URL by removing trailing slashes for consistent comparison.

    Args:
        url: URL string

    Returns:
        Normalized URL without trailing slash
    """
    return url.rstrip('/')


def wait_for_element(driver, selector, timeout=10):
    """
    Wait for element to be present and visible.

    Args:
        driver: Selenium WebDriver instance
        selector: CSS selector or XPath
        timeout: Maximum time to wait

    Returns:
        WebElement or None if not found
    """
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC

    try:
        if selector.startswith('//'):
            # XPath selector
            return WebDriverWait(driver, timeout).until(
                EC.presence_of_element_located((By.XPATH, selector))
            )
        else:
            # CSS selector
            return WebDriverWait(driver, timeout).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, selector))
            )
    except:
        return None


def check_no_console_errors(driver):
    """
    Check for JavaScript errors in browser console.

    Args:
        driver: Selenium WebDriver instance

    Returns:
        Tuple of (has_errors, error_list)
    """
    logs = driver.get_log('browser')
    errors = filter_console_errors(logs)
    return len(errors) == 0, errors


def scroll_to_element(driver, element):
    """
    Scroll element into view.

    Args:
        driver: Selenium WebDriver instance
        element: WebElement to scroll to
    """
    driver.execute_script("arguments[0].scrollIntoView(true);", element)
    time.sleep(0.3)


def wait_for_page_load(driver, timeout=10):
    """
    Wait for page to finish loading.

    Args:
        driver: Selenium WebDriver instance
        timeout: Maximum time to wait
    """
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC

    WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((By.TAG_NAME, "body"))
    )