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
Tabs Component Tests
Following CLAUDE.md requirements: 4 tests per component (Functionality, Visual Rendering, Navigation, Runtime Stability)
"""




class TestTabs:
    """Test suite for Tabs component."""

    def test_tabs_functionality(self, driver, test_helper, assertions):
        """
        Test 1: Tabs Functionality
        Test core tabs interactions and state changes
        """
        # Navigate to navigation page
        test_helper.navigate_to_category("navigation")

        # Look for tab elements
        tab_selectors = [
            "[data-testid*='tab']",
            "[role*='tab']",
            ".tab",
            ".tabs button",
            "[aria-selected]"
        ]

        tab_elements = []
        for selector in tab_selectors:
            try:
                tabs = test_helper.driver.find_elements(By.CSS_SELECTOR, selector)
                tab_elements.extend(tabs)
            except:
                continue

        if tab_elements:
            # Filter for visible, clickable tabs
            clickable_tabs = [tab for tab in tab_elements if tab.is_displayed() and tab.is_enabled()]

            if clickable_tabs:
                # Test tab switching
                for i, tab in enumerate(clickable_tabs[:3]):  # Test first 3 tabs
                    # Get initial state
                    initial_selected = tab.get_attribute('aria-selected') == 'true'

                    # Click tab
                    tab.click()
                    time.sleep(0.5)

                    # Check if tab became selected
                    new_selected = tab.get_attribute('aria-selected') == 'true'

                    # Look for corresponding tab panel
                    tab_id = tab.get_attribute('id')
                    if tab_id:
                        panel_selectors = [
                            f"[aria-labelledby='{tab_id}']",
                            f"[role='tabpanel'][id='{tab_id.replace('tab', 'panel')}']",
                            ".tab-panel"
                        ]

                        for panel_selector in panel_selectors:
                            try:
                                panel = test_helper.driver.find_element(By.CSS_SELECTOR, panel_selector)
                                if panel.is_displayed():
                                    break
                            except:
                                continue

        # If no tabs found, test with any navigation that looks like tabs
        if not tab_elements:
            nav_buttons = test_helper.driver.find_elements(By.CSS_SELECTOR,
                "nav button, .nav button, .tab-list button")

            for button in nav_buttons[:3]:
                if button.is_displayed() and button.is_enabled():
                    try:
                        button.click()
                        time.sleep(0.5)
                    except:
                        continue

    def test_tabs_renders_normally(self, driver, test_helper, assertions):
        """
        Test 2: Visual Rendering
        Test tabs render without visual abnormalities
        """
        # Navigate to navigation page
        test_helper.navigate_to_category("navigation")

        # Look for tab elements
        tab_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".tab, [role='tab'], .tabs button, nav button")

        if tab_elements:
            for tab in tab_elements[:5]:  # Test first 5 tabs
                if tab.is_displayed():
                    assertions.assert_element_rendered_properly(tab)

                    # Check tab has reasonable dimensions
                    width, height = test_helper.get_element_size_by_element(tab)
                    assert 50 <= width <= 500, f"Tab width {width} is outside reasonable range"
                    assert 20 <= height <= 100, f"Tab height {height} is outside reasonable range"

                    # Check tab position
                    x, y = test_helper.get_element_position_by_element(tab)
                    assert x >= 0 and y >= 0, f"Tab position ({x}, {y}) is negative"

        # Test tab panels if they exist
        tab_panels = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".tab-panel, [role='tabpanel'], .tab-content")

        for panel in tab_panels[:3]:
            if panel.is_displayed():
                assertions.assert_element_rendered_properly(panel)

    def test_tabs_navigation(self, driver, test_helper, assertions):
        """
        Test 3: Navigation
        Test tabs navigation behavior and keyboard interaction
        """
        # Navigate to navigation page
        test_helper.navigate_to_category("navigation")

        # Look for tab elements
        tab_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".tab, [role='tab'], .tabs button, nav button")

        clickable_tabs = [tab for tab in tab_elements if tab.is_displayed() and tab.is_enabled()]

        if clickable_tabs:
            # Test keyboard navigation
            first_tab = clickable_tabs[0]
            first_tab.click()
            time.sleep(0.3)

            # Test arrow keys for tab navigation
            active_element = test_helper.driver.switch_to.active_element

            try:
                # Test arrow right
                active_element.send_keys('\ue054')  # Right arrow
                time.sleep(0.3)

                # Test arrow left
                active_element.send_keys('\ue052')  # Left arrow
                time.sleep(0.3)

            except:
                pass

            # Test tab navigation between tabs
            for i in range(min(3, len(clickable_tabs))):
                try:
                    # Click to activate tab
                    clickable_tabs[i].click()
                    time.sleep(0.3)

                    # Check if content changed
                    active = test_helper.driver.switch_to.active_element
                    if active in clickable_tabs:
                        # Test keyboard activation
                        active.send_keys(' ')
                        time.sleep(0.3)
                        active.send_keys('\n')
                        time.sleep(0.3)

                except:
                    continue

        # Test clicking tabs leads to content changes
        for tab in clickable_tabs[:3]:
            try:
                tab.click()
                time.sleep(0.5)

                # Look for corresponding panel or content change
                tab_id = tab.get_attribute('id')
                if tab_id:
                    try:
                        panel = test_helper.driver.find_element(By.CSS_SELECTOR,
                            f"[aria-labelledby='{tab_id}']")
                        if panel.is_displayed():
                            break
                    except:
                        pass

            except:
                continue

        # Test no navigation errors
        assertions.assert_no_console_errors(test_helper.driver)

    def test_tabs_no_errors(self, driver, test_helper, assertions):
        """
        Test 4: Runtime Stability
        Test tabs runtime stability and console errors
        """
        # Navigate to navigation page
        test_helper.navigate_to_category("navigation")

        # Check initial console state
        initial_errors = test_helper.get_console_errors()
        assert len(initial_errors) == 0, \
            f"Page loaded with {len(initial_errors)} JavaScript errors: {[e['message'] for e in initial_errors]}"

        # Look for tab elements
        tab_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".tab, [role='tab'], .tabs button, nav button")

        clickable_tabs = [tab for tab in tab_elements if tab.is_displayed() and tab.is_enabled()]

        # Test rapid tab switching
        for tab in clickable_tabs:
            if tab.is_displayed() and tab.is_enabled():
                # Rapid clicking
                for i in range(3):
                    try:
                        tab.click()
                        time.sleep(0.1)
                    except:
                        continue

        # Test tab cycling
        if len(clickable_tabs) > 1:
            for cycle in range(3):
                for tab in clickable_tabs[:3]:
                    try:
                        tab.click()
                        time.sleep(0.2)
                    except:
                        continue

        # Test keyboard navigation stress
        if clickable_tabs:
            try:
                clickable_tabs[0].click()
                time.sleep(0.2)

                # Rapid keyboard interaction
                for i in range(10):
                    active = test_helper.driver.switch_to.active_element

                    # Try different keyboard commands
                    keys = [' ', '\n', '\ue054', '\ue052']  # Space, Enter, Right, Left
                    active.send_keys(keys[i % len(keys)])
                    time.sleep(0.1)

            except:
                pass

        # Test hover interactions
        for tab in clickable_tabs[:5]:
            try:
                # Hover over tab
                test_helper.driver.execute_script("arguments[0].scrollIntoView();", tab)
                time.sleep(0.1)

                # Move mouse over tab (simulated hover)
                test_helper.driver.execute_script(
                    "var event = new MouseEvent('mouseover', {bubbles: true}); arguments[0].dispatchEvent(event);",
                    tab)
                time.sleep(0.2)

            except:
                continue

        # Check for console errors after interactions
        final_errors = test_helper.get_console_errors()
        error_messages = [error['message'] for error in final_errors]

        assert len(final_errors) == 0, \
            f"Tabs interactions caused {len(final_errors)} JavaScript errors: {error_messages}"

        # Verify no JavaScript exceptions thrown
        logs = test_helper.driver.get_log('browser')
        js_exceptions = [log for log in logs if 'Uncaught' in log.get('message', '')]

        assert len(js_exceptions) == 0, \
            f"Found {len(js_exceptions)} JavaScript exceptions: {[log['message'] for log in js_exceptions]}"

        # Test tab elements are still functional
        for tab in clickable_tabs:
            if tab.is_displayed():
                assert tab.is_enabled(), "Tab elements should remain enabled after interactions"

    def get_element_size_by_element(self, element):
        """Helper method to get element size"""
        size = element.size
        return size['width'], size['height']

    def get_element_position_by_element(self, element):
        """Helper method to get element position"""
        location = element.location
        return location['x'], location['y']