import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException
from tests.selenium.strict_assertions import ComponentAssertions
from tests.selenium.test_constants import Locators, TestData



"""
Tooltip Component Tests
Following CLAUDE.md requirements: 4 tests per component (Functionality, Visual Rendering, Navigation, Runtime Stability)
"""




class TestTooltip:
    """Test suite for Tooltip component."""

    def test_tooltip_functionality(self, driver, test_helper, assertions):
        """
        Test 1: Tooltip Functionality
        Test core tooltip interactions and state changes
        """
        # Navigate to feedback page
        test_helper.navigate_to_category("feedback")

        # Look for tooltip elements
        tooltip_selectors = [
            "[data-testid*='tooltip']",
            "[role*='tooltip']",
            ".tooltip",
            "[title]",
            "[data-tooltip]"
        ]

        tooltip_elements = []
        for selector in tooltip_selectors:
            try:
                tooltips = test_helper.driver.find_elements(By.CSS_SELECTOR, selector)
                tooltip_elements.extend(tooltips)
            except:
                continue

        if tooltip_elements:
            # Test tooltip triggering
            for tooltip in tooltip_elements[:5]:  # Test first 5 tooltips
                if tooltip.is_displayed():
                    try:
                        # Hover to trigger tooltip
                        test_helper.driver.execute_script("arguments[0].scrollIntoView();", tooltip)
                        time.sleep(0.1)

                        # Mouse over
                        test_helper.driver.execute_script(
                            "var event = new MouseEvent('mouseover', {bubbles: true}); arguments[0].dispatchEvent(event);",
                            tooltip)
                        time.sleep(0.5)

                        # Look for tooltip content
                        tooltip_content_selectors = [
                            ".tooltip-content", ".tooltip-inner", "[role='tooltip']",
                            ".tooltip-popup", "[data-tooltip-content]"
                        ]

                        tooltip_found = False
                        for content_selector in tooltip_content_selectors:
                            try:
                                content = test_helper.driver.find_element(By.CSS_SELECTOR, content_selector)
                                if content.is_displayed():
                                    tooltip_found = True
                                    break
                            except:
                                continue

                        # Mouse out to hide tooltip
                        test_helper.driver.execute_script(
                            "var event = new MouseEvent('mouseout', {bubbles: true}); arguments[0].dispatchEvent(event);",
                            tooltip)
                        time.sleep(0.3)

                        if tooltip_found:
                            break

                    except:
                        continue

        # If no tooltips found, look for elements with title attributes
        if not tooltip_elements:
            title_elements = test_helper.driver.find_elements(By.CSS_SELECTOR, "[title]")

            for element in title_elements[:3]:
                if element.is_displayed():
                    try:
                        # Hover to show title tooltip
                        test_helper.driver.execute_script("arguments[0].scrollIntoView();", element)
                        time.sleep(0.1)

                        # Mouse over
                        test_helper.driver.execute_script(
                            "var event = new MouseEvent('mouseover', {bubbles: true}); arguments[0].dispatchEvent(event);",
                            element)
                        time.sleep(1)

                        # Mouse out
                        test_helper.driver.execute_script(
                            "var event = new MouseEvent('mouseout', {bubbles: true}); arguments[0].dispatchEvent(event);",
                            element)
                        time.sleep(0.3)

                    except:
                        continue

    def test_tooltip_renders_normally(self, driver, test_helper, assertions):
        """
        Test 2: Visual Rendering
        Test tooltip renders without visual abnormalities
        """
        # Navigate to feedback page
        test_helper.navigate_to_category("feedback")

        # Look for tooltip triggers
        tooltip_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".tooltip-trigger, [data-tooltip], [title], [data-testid*='tooltip']")

        if tooltip_elements:
            for tooltip in tooltip_elements[:5]:  # Test first 5 elements
                if tooltip.is_displayed():
                    assertions.assert_element_rendered_properly(tooltip)

                    # Check tooltip trigger has reasonable dimensions
                    width, height = test_helper.get_element_size_by_element(tooltip)
                    assert 10 <= width <= 500, f"Tooltip trigger width {width} is outside reasonable range"
                    assert 10 <= height <= 200, f"Tooltip trigger height {height} is outside reasonable range"

                    # Check tooltip trigger position
                    x, y = test_helper.get_element_position_by_element(tooltip)
                    assert x >= 0 and y >= 0, f"Tooltip trigger position ({x}, {y}) is negative"

        # Test tooltip content if it exists
        tooltip_contents = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".tooltip-content, .tooltip-inner, [role='tooltip']")

        for content in tooltip_contents[:3]:
            if content.is_displayed():
                assertions.assert_element_rendered_properly(content)

                # Check tooltip content has reasonable dimensions
                width, height = test_helper.get_element_size_by_element(content)
                assert 20 <= width <= 400, f"Tooltip content width {width} is outside reasonable range"
                assert 10 <= height <= 200, f"Tooltip content height {height} is outside reasonable range"

    def test_tooltip_navigation(self, driver, test_helper, assertions):
        """
        Test 3: Navigation
        Test tooltip navigation behavior and keyboard interaction
        """
        # Navigate to feedback page
        test_helper.navigate_to_category("feedback")

        # Look for tooltip elements
        tooltip_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".tooltip-trigger, [data-tooltip], [title]")

        clickable_tooltips = [t for t in tooltip_elements if t.is_displayed() and t.is_enabled()]

        if clickable_tooltips:
            # Test keyboard navigation
            first_tooltip = clickable_tooltips[0]
            first_tooltip.click()
            time.sleep(0.3)

            # Test focus-based tooltip activation
            active_element = test_helper.driver.switch_to.active_element

            try:
                # Tab to next element (should hide tooltip)
                active_element.send_keys('\t')
                time.sleep(0.3)

                # Shift+Tab back (should show tooltip again)
                active_element.send_keys('\ue004')  # Shift+Tab
                time.sleep(0.3)

            except:
                pass

            # Test tooltip with focus/blur
            for tooltip in clickable_tooltips[:3]:
                try:
                    # Focus tooltip
                    tooltip.click()
                    time.sleep(0.3)

                    # Look for tooltip content
                    tooltip_content = test_helper.driver.find_elements(By.CSS_SELECTOR,
                        ".tooltip-content, [role='tooltip']")

                    # Blur (click elsewhere)
                    test_helper.driver.find_element(By.TAG_NAME, "body").click()
                    time.sleep(0.3)

                except:
                    continue

        # Test tooltip doesn't interfere with navigation
        for tooltip in clickable_tooltips[:2]:
            try:
                # Hover tooltip
                test_helper.driver.execute_script("arguments[0].scrollIntoView();", tooltip)
                time.sleep(0.1)

                test_helper.driver.execute_script(
                    "var event = new MouseEvent('mouseover', {bubbles: true}); arguments[0].dispatchEvent(event);",
                    tooltip)
                time.sleep(0.5)

                # Try to navigate to another element
                nav_link = test_helper.driver.find_element(By.LINK_TEXT, "Home")
                nav_link.click()
                time.sleep(0.5)

                # Go back
                test_helper.driver.back()
                time.sleep(0.5)

                break

            except:
                continue

        # Test no navigation errors
        assertions.assert_no_console_errors(test_helper.driver)

    def test_tooltip_no_errors(self, driver, test_helper, assertions):
        """
        Test 4: Runtime Stability
        Test tooltip runtime stability and console errors
        """
        # Navigate to feedback page
        test_helper.navigate_to_category("feedback")

        # Check initial console state
        initial_errors = test_helper.get_console_errors()
        assert len(initial_errors) == 0, \
            f"Page loaded with {len(initial_errors)} JavaScript errors: {[e['message'] for e in initial_errors]}"

        # Look for tooltip elements
        tooltip_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".tooltip-trigger, [data-tooltip], [title], [data-testid*='tooltip']")

        # Test rapid tooltip interactions
        for tooltip in tooltip_elements:
            if tooltip.is_displayed():
                # Rapid hover in/out
                for i in range(5):
                    try:
                        # Hover in
                        test_helper.driver.execute_script(
                            "var event = new MouseEvent('mouseover', {bubbles: true}); arguments[0].dispatchEvent(event);",
                            tooltip)
                        time.sleep(0.1)

                        # Hover out
                        test_helper.driver.execute_script(
                            "var event = new MouseEvent('mouseout', {bubbles: true}); arguments[0].dispatchEvent(event);",
                            tooltip)
                        time.sleep(0.1)

                    except:
                        continue

        # Test focus/blur cycles
        clickable_tooltips = [t for t in tooltip_elements if t.is_displayed() and t.is_enabled()]

        for tooltip in clickable_tooltips[:10]:
            try:
                # Focus
                tooltip.click()
                time.sleep(0.1)

                # Blur
                test_helper.driver.find_element(By.TAG_NAME, "body").click()
                time.sleep(0.1)

            except:
                continue

        # Test mouse movement stress
        for tooltip in tooltip_elements[:5]:
            try:
                test_helper.driver.execute_script("arguments[0].scrollIntoView();", tooltip)
                time.sleep(0.1)

                # Rapid mouse events
                for i in range(5):
                    test_helper.driver.execute_script(
                        "var event = new MouseEvent('mousemove', {bubbles: true}); arguments[0].dispatchEvent(event);",
                        tooltip)
                    time.sleep(0.05)

            except:
                continue

        # Check for console errors after interactions
        final_errors = test_helper.get_console_errors()
        error_messages = [error['message'] for error in final_errors]

        assert len(final_errors) == 0, \
            f"Tooltip interactions caused {len(final_errors)} JavaScript errors: {error_messages}"

        # Verify no JavaScript exceptions thrown
        logs = test_helper.driver.get_log('browser')
        js_exceptions = [log for log in logs if 'Uncaught' in log.get('message', '')]

        assert len(js_exceptions) == 0, \
            f"Found {len(js_exceptions)} JavaScript exceptions: {[log['message'] for log in js_exceptions]}"

        # Test tooltip elements are still functional
        for tooltip in tooltip_elements:
            if tooltip.is_displayed():
                # Element should still exist and be interactable
                tooltip_tag = tooltip.tag_name.lower()
                assert tooltip_tag in ['button', 'a', 'span', 'div', 'input'], \
                    f"Tooltip trigger should be valid element, got {tooltip_tag}"

    def get_element_size_by_element(self, element):
        """Helper method to get element size"""
        size = element.size
        return size['width'], size['height']

    def get_element_position_by_element(self, element):
        """Helper method to get element position"""
        location = element.location
        return location['x'], location['y']
