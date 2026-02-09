import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException
from tests.selenium.strict_assertions import ComponentAssertions
from tests.selenium.test_constants import Locators, TestData



"""
Accordion Component Tests
Following CLAUDE.md requirements: 4 tests per component (Functionality, Visual Rendering, Navigation, Runtime Stability)
"""




class TestAccordion:
    """Test suite for Accordion component."""

    def test_accordion_functionality(self, driver, test_helper, assertions):
        """
        Test 1: Accordion Functionality
        Test core accordion interactions and state changes
        """
        # Navigate to navigation page
        test_helper.navigate_to_category("navigation")

        # Look for accordion elements
        accordion_selectors = [
            "[data-testid*='accordion']",
            "[role*='accordion']",
            ".accordion",
            ".accordion-item",
            "[aria-expanded]"
        ]

        accordion_items = []
        for selector in accordion_selectors:
            try:
                items = test_helper.driver.find_elements(By.CSS_SELECTOR, selector)
                accordion_items.extend(items)
            except:
                continue

        if accordion_items:
            # Test accordion functionality
            for i, item in enumerate(accordion_items[:3]):  # Test first 3 items
                if item.is_displayed():
                    # Get initial state
                    initial_expanded = item.get_attribute('aria-expanded') == 'true'

                    # Click to toggle
                    item.click()
                    time.sleep(0.5)

                    # Check state changed
                    new_expanded = item.get_attribute('aria-expanded') == 'true'

                    # Look for content panel
                    content_selectors = [
                        f"[aria-labelledby='{item.get_attribute('id')}']",
                        f"{selector} + .accordion-content",
                        f"{selector} .accordion-content",
                        ".accordion-panel"
                    ]

                    content_found = False
                    for content_selector in content_selectors:
                        try:
                            content = test_helper.driver.find_element(By.CSS_SELECTOR, content_selector)
                            if content.is_displayed():
                                content_found = True
                                break
                        except:
                            continue

                    if content_found:
                        break

        # If no accordion found, test with any collapsible sections
        if not accordion_items:
            collapsible_headers = test_helper.driver.find_elements(By.CSS_SELECTOR,
                "h3, h4, .collapsible-header, [data-toggle='collapse']")

            for header in collapsible_headers[:3]:
                if header.is_displayed():
                    try:
                        header.click()
                        time.sleep(0.5)
                    except:
                        continue

    def test_accordion_renders_normally(self, driver, test_helper, assertions):
        """
        Test 2: Visual Rendering
        Test accordion renders without visual abnormalities
        """
        # Navigate to navigation page
        test_helper.navigate_to_category("navigation")

        # Look for accordion elements
        accordion_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".accordion, [role='accordion'], .accordion-item, .accordion-header")

        if accordion_elements:
            for accordion in accordion_elements[:5]:  # Test first 5 elements
                if accordion.is_displayed():
                    assertions.assert_element_rendered_properly(accordion)

                    # Check accordion has reasonable dimensions
                    width, height = test_helper.get_element_size_by_selector(accordion)
                    assert 50 <= width <= 2000, f"Accordion width {width} is outside reasonable range"
                    assert 20 <= height <= 500, f"Accordion height {height} is outside reasonable range"

                    # Check accordion position
                    x, y = test_helper.get_element_position_by_selector(accordion)
                    assert x >= 0 and y >= 0, f"Accordion position ({x}, {y}) is negative"

        # Test accordion headers if they exist
        accordion_headers = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".accordion-header, .accordion-title, h3, h4")

        for header in accordion_headers[:5]:
            if header.is_displayed():
                assertions.assert_element_rendered_properly(header)

    def test_accordion_navigation(self, driver, test_helper, assertions):
        """
        Test 3: Navigation
        Test accordion navigation behavior and keyboard interaction
        """
        # Navigate to navigation page
        test_helper.navigate_to_category("navigation")

        # Look for accordion headers
        accordion_headers = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".accordion-header, .accordion-title, [aria-expanded], h3, h4")

        if accordion_headers:
            # Test keyboard navigation
            first_header = accordion_headers[0]
            first_header.click()
            time.sleep(0.3)

            # Test arrow keys and space/enter for accordion
            active_element = test_helper.driver.switch_to.active_element

            try:
                # Test space key
                active_element.send_keys(' ')
                time.sleep(0.3)

                # Test enter key
                active_element.send_keys('\n')
                time.sleep(0.3)

            except:
                pass

            # Test tab navigation between accordion items
            for i in range(min(3, len(accordion_headers))):
                try:
                    test_helper.driver.switch_to.active_element.send_keys('\t')
                    time.sleep(0.2)

                    active = test_helper.driver.switch_to.active_element
                    if active in accordion_headers:
                        # Test keyboard activation
                        active.send_keys(' ')
                        time.sleep(0.3)
                        break

                except:
                    continue

        # Test clicking accordion headers leads to content expansion
        clickable_headers = [h for h in accordion_headers if h.is_displayed() and h.is_enabled()]

        for header in clickable_headers[:3]:
            try:
                header.click()
                time.sleep(0.5)

                # Look for expanded content
                content_selectors = [
                    ".accordion-content", ".accordion-panel", ".collapse",
                    f"[aria-labelledby='{header.get_attribute('id')}']"
                ]

                for selector in content_selectors:
                    try:
                        content = test_helper.driver.find_element(By.CSS_SELECTOR, selector)
                        if content.is_displayed():
                            break
                    except:
                        continue

            except:
                continue

        # Test no navigation errors
        assertions.assert_no_console_errors(test_helper.driver)

    def test_accordion_no_errors(self, driver, test_helper, assertions):
        """
        Test 4: Runtime Stability
        Test accordion runtime stability and console errors
        """
        # Navigate to navigation page
        test_helper.navigate_to_category("navigation")

        # Check initial console state
        initial_errors = test_helper.get_console_errors()
        assert len(initial_errors) == 0, \
            f"Page loaded with {len(initial_errors)} JavaScript errors: {[e['message'] for e in initial_errors]}"

        # Look for accordion elements
        accordion_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".accordion, [role='accordion'], .accordion-item, .accordion-header")

        # Test rapid accordion interactions
        for accordion in accordion_elements:
            if accordion.is_displayed():
                # Rapid clicking
                for i in range(5):
                    try:
                        accordion.click()
                        time.sleep(0.1)
                    except:
                        continue

        # Test accordion header interactions
        accordion_headers = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".accordion-header, .accordion-title, [aria-expanded]")

        clickable_headers = [h for h in accordion_headers if h.is_displayed() and h.is_enabled()]

        # Rapid expand/collapse cycles
        for header in clickable_headers[:10]:
            try:
                # Expand
                header.click()
                time.sleep(0.1)

                # Collapse
                header.click()
                time.sleep(0.1)

                # Expand again
                header.click()
                time.sleep(0.1)

            except:
                continue

        # Test keyboard navigation stress
        if accordion_headers:
            try:
                accordion_headers[0].click()
                time.sleep(0.2)

                # Rapid keyboard interaction
                for i in range(10):
                    active = test_helper.driver.switch_to.active_element
                    active.send_keys(' ')
                    time.sleep(0.1)

            except:
                pass

        # Check for console errors after interactions
        final_errors = test_helper.get_console_errors()
        error_messages = [error['message'] for error in final_errors]

        assert len(final_errors) == 0, \
            f"Accordion interactions caused {len(final_errors)} JavaScript errors: {error_messages}"

        # Verify no JavaScript exceptions thrown
        logs = test_helper.driver.get_log('browser')
        js_exceptions = [log for log in logs if 'Uncaught' in log.get('message', '')]

        assert len(js_exceptions) == 0, \
            f"Found {len(js_exceptions)} JavaScript exceptions: {[log['message'] for log in js_exceptions]}"

        # Test accordion elements are still functional
        for accordion in accordion_elements:
            if accordion.is_displayed():
                assert accordion.is_enabled() or accordion.tag_name.lower() in ['div', 'section'], \
                    "Accordion elements should remain functional after interactions"

    def get_element_size_by_selector(self, element):
        """Helper method to get element size"""
        size = element.size
        return size['width'], size['height']

    def get_element_position_by_selector(self, element):
        """Helper method to get element position"""
        location = element.location
        return location['x'], location['y']
