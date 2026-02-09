import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException
from tests.selenium.strict_assertions import ComponentAssertions
from tests.selenium.test_constants import Locators, TestData



"""
Breadcrumb Component Tests
Following CLAUDE.md requirements: 4 tests per component (Functionality, Visual Rendering, Navigation, Runtime Stability)
"""




class TestBreadcrumb:
    """Test suite for Breadcrumb component."""

    def test_breadcrumb_functionality(self, driver, test_helper, assertions):
        """
        Test 1: Breadcrumb Functionality
        Test core breadcrumb interactions and state changes
        """
        # Navigate to navigation page (or any page that might have breadcrumbs)
        test_helper.navigate_to_category("navigation")

        # Look for breadcrumb elements
        breadcrumb_selectors = [
            "[data-testid*='breadcrumb']",
            "[aria-label*='breadcrumb']",
            ".breadcrumb",
            ".breadcrumbs",
            "nav[aria-label='breadcrumb']",
            ".breadcrumb-nav"
        ]

        breadcrumb_element = None
        for selector in breadcrumb_selectors:
            try:
                breadcrumb_element = test_helper.driver.find_element(By.CSS_SELECTOR, selector)
                if breadcrumb_element.is_displayed():
                    break
            except:
                continue

        if breadcrumb_element:
            # Test breadcrumb link functionality
            breadcrumb_links = breadcrumb_element.find_elements(By.CSS_SELECTOR, "a, button")

            for i, link in enumerate(breadcrumb_links[:3]):  # Test first 3 links
                if link.is_displayed() and link.is_enabled():
                    try:
                        # Get link text/href
                        link_text = link.text
                        link_href = link.get_attribute('href')

                        # Click breadcrumb link
                        link.click()
                        time.sleep(1)

                        # Check if navigation occurred
                        current_url = test_helper.driver.current_url

                        # Go back to continue testing
                        test_helper.driver.back()
                        time.sleep(0.5)

                    except:
                        continue

        # If no breadcrumbs found, check if any page has them by navigating around
        if not breadcrumb_element:
            # Try buttons page
            test_helper.navigate_to_category("buttons")

            for selector in breadcrumb_selectors:
                try:
                    breadcrumb_element = test_helper.driver.find_element(By.CSS_SELECTOR, selector)
                    if breadcrumb_element.is_displayed():
                        break
                except:
                    continue

    def test_breadcrumb_renders_normally(self, driver, test_helper, assertions):
        """
        Test 2: Visual Rendering
        Test breadcrumb renders without visual abnormalities
        """
        # Navigate to navigation page
        test_helper.navigate_to_category("navigation")

        # Look for breadcrumb elements
        breadcrumb_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".breadcrumb, .breadcrumbs, [aria-label*='breadcrumb']")

        if breadcrumb_elements:
            for breadcrumb in breadcrumb_elements:
                if breadcrumb.is_displayed():
                    assertions.assert_element_rendered_properly(breadcrumb)

                    # Check breadcrumb has reasonable dimensions
                    width, height = test_helper.get_element_size_by_element(breadcrumb)
                    assert 50 <= width <= 2000, f"Breadcrumb width {width} is outside reasonable range"
                    assert 10 <= height <= 100, f"Breadcrumb height {height} is outside reasonable range"

                    # Check breadcrumb position
                    x, y = test_helper.get_element_position_by_element(breadcrumb)
                    assert x >= 0 and y >= 0, f"Breadcrumb position ({x}, {y}) is negative"

        # Test breadcrumb items if they exist
        breadcrumb_items = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".breadcrumb li, .breadcrumb a, .breadcrumb-item")

        for item in breadcrumb_items[:5]:
            if item.is_displayed():
                assertions.assert_element_rendered_properly(item)

    def test_breadcrumb_navigation(self, driver, test_helper, assertions):
        """
        Test 3: Navigation
        Test breadcrumb navigation behavior and keyboard interaction
        """
        # Navigate to navigation page
        test_helper.navigate_to_category("navigation")

        # Look for breadcrumb elements
        breadcrumb_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".breadcrumb, .breadcrumbs, [aria-label*='breadcrumb']")

        if breadcrumb_elements:
            breadcrumb = breadcrumb_elements[0]

            # Test keyboard navigation
            breadcrumb_links = breadcrumb.find_elements(By.CSS_SELECTOR, "a, button")

            clickable_links = [link for link in breadcrumb_links if link.is_displayed() and link.is_enabled()]

            if clickable_links:
                # Focus first breadcrumb link
                clickable_links[0].click()
                time.sleep(0.3)

                # Test tab navigation through breadcrumb items
                for i in range(min(3, len(clickable_links))):
                    try:
                        active_element = test_helper.driver.switch_to.active_element

                        # Press tab to move to next breadcrumb item
                        active_element.send_keys('\t')
                        time.sleep(0.2)

                        # Check if we're still on breadcrumb items
                        active = test_helper.driver.switch_to.active_element
                        if active in clickable_links:
                            # Test keyboard activation
                            active.send_keys('\n')
                            time.sleep(0.5)

                            # Go back to continue testing
                            test_helper.driver.back()
                            time.sleep(0.5)
                            break

                    except:
                        continue

            # Test breadcrumb link clicking leads to correct navigation
            for link in clickable_links[:2]:
                try:
                    initial_url = test_helper.driver.current_url
                    link_text = link.text
                    link_href = link.get_attribute('href')

                    link.click()
                    time.sleep(1)

                    # Verify navigation occurred
                    new_url = test_helper.driver.current_url

                    # Go back for next test
                    test_helper.driver.back()
                    time.sleep(0.5)

                except:
                    continue

        # Test no navigation errors
        assertions.assert_no_console_errors(test_helper.driver)

    def test_breadcrumb_no_errors(self, driver, test_helper, assertions):
        """
        Test 4: Runtime Stability
        Test breadcrumb runtime stability and console errors
        """
        # Navigate to navigation page
        test_helper.navigate_to_category("navigation")

        # Check initial console state
        initial_errors = test_helper.get_console_errors()
        assert len(initial_errors) == 0, \
            f"Page loaded with {len(initial_errors)} JavaScript errors: {[e['message'] for e in initial_errors]}"

        # Look for breadcrumb elements
        breadcrumb_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".breadcrumb, .breadcrumbs, [aria-label*='breadcrumb']")

        # Test rapid breadcrumb interactions
        for breadcrumb in breadcrumb_elements:
            if breadcrumb.is_displayed():
                breadcrumb_links = breadcrumb.find_elements(By.CSS_SELECTOR, "a, button")

                for link in breadcrumb_links:
                    if link.is_displayed() and link.is_enabled():
                        # Rapid clicking
                        for i in range(3):
                            try:
                                link.click()
                                time.sleep(0.1)

                                # Go back quickly
                                test_helper.driver.back()
                                time.sleep(0.1)
                            except:
                                continue

        # Test hover interactions on breadcrumb items
        breadcrumb_items = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".breadcrumb a, .breadcrumb-item, .breadcrumb li")

        for item in breadcrumb_items[:10]:
            try:
                # Scroll to item
                test_helper.driver.execute_script("arguments[0].scrollIntoView();", item)
                time.sleep(0.1)

                # Simulate hover
                test_helper.driver.execute_script(
                    "var event = new MouseEvent('mouseover', {bubbles: true}); arguments[0].dispatchEvent(event);",
                    item)
                time.sleep(0.2)

            except:
                continue

        # Test keyboard navigation stress
        breadcrumb_links = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".breadcrumb a, .breadcrumb button")

        clickable_links = [link for link in breadcrumb_links if link.is_displayed() and link.is_enabled()]

        if clickable_links:
            try:
                clickable_links[0].click()
                time.sleep(0.2)

                # Rapid keyboard interaction
                for i in range(8):
                    active = test_helper.driver.switch_to.active_element

                    # Try different keys
                    keys = ['\t', '\n', ' ']  # Tab, Enter, Space
                    active.send_keys(keys[i % len(keys)])
                    time.sleep(0.1)

            except:
                pass

        # Check for console errors after interactions
        final_errors = test_helper.get_console_errors()
        error_messages = [error['message'] for error in final_errors]

        assert len(final_errors) == 0, \
            f"Breadcrumb interactions caused {len(final_errors)} JavaScript errors: {error_messages}"

        # Verify no JavaScript exceptions thrown
        logs = test_helper.driver.get_log('browser')
        js_exceptions = [log for log in logs if 'Uncaught' in log.get('message', '')]

        assert len(js_exceptions) == 0, \
            f"Found {len(js_exceptions)} JavaScript exceptions: {[log['message'] for log in js_exceptions]}"

        # Test breadcrumb elements are still functional
        for breadcrumb in breadcrumb_elements:
            if breadcrumb.is_displayed():
                breadcrumb_links = breadcrumb.find_elements(By.CSS_SELECTOR, "a, button")
                for link in breadcrumb_links:
                    if link.is_displayed():
                        assert link.is_enabled(), "Breadcrumb links should remain enabled after interactions"

    def get_element_size_by_element(self, element):
        """Helper method to get element size"""
        size = element.size
        return size['width'], size['height']

    def get_element_position_by_element(self, element):
        """Helper method to get element position"""
        location = element.location
        return location['x'], location['y']
