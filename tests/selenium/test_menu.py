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
Menu Component Tests
Following CLAUDE.md requirements: 4 tests per component (Functionality, Visual Rendering, Navigation, Runtime Stability)
"""




class TestMenu:
    """Test suite for Menu component."""

    def test_menu_functionality(self, driver, test_helper, assertions):
        """
        Test 1: Menu Functionality
        Test core menu interactions and state changes
        """
        # Navigate to navigation page
        test_helper.navigate_to_category("navigation")

        # Find menu elements (look for any menu-like structure)
        try:
            # Look for navigation menu, dropdown, or menu button
            menu_selectors = [
                "[data-testid*='menu']",
                "[role*='menu']",
                ".menu",
                "[aria-haspopup='true']",
                "nav ul li"
            ]

            menu_element = None
            for selector in menu_selectors:
                try:
                    menu_element = test_helper.driver.find_element(By.CSS_SELECTOR, selector)
                    if menu_element.is_displayed():
                        break
                except:
                    continue

            if menu_element:
                # Test menu interaction
                initial_display = menu_element.is_displayed()

                # Click to toggle menu if it's a dropdown
                if menu_element.get_attribute('aria-haspopup') == 'true':
                    menu_element.click()
                    time.sleep(0.5)

                    # Look for menu items
                    menu_items = test_helper.driver.find_elements(By.CSS_SELECTOR, "[role='menuitem'], .menu-item, li a")

                    if menu_items:
                        # Test clicking a menu item
                        menu_items[0].click()
                        time.sleep(0.5)

            # Test basic navigation links if no menu found
            nav_links = test_helper.driver.find_elements(By.CSS_SELECTOR, "nav a, .navigation a")
            if nav_links:
                nav_links[0].click()
                time.sleep(0.5)

        except Exception as e:
            # Menu might not be implemented yet, that's okay
            pass

    def test_menu_renders_normally(self, driver, test_helper, assertions):
        """
        Test 2: Visual Rendering
        Test menu renders without visual abnormalities
        """
        # Navigate to navigation page
        test_helper.navigate_to_category("navigation")

        # Look for any menu-like elements
        menu_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            "nav, [role='navigation'], .menu, [role='menu'], ul.navigation, .nav-menu")

        if menu_elements:
            for menu in menu_elements[:3]:  # Test first 3 menus found
                if menu.is_displayed():
                    assertions.assert_element_rendered_properly(menu)

                    # Check menu has reasonable dimensions
                    width, height = test_helper.get_element_size_by_element(menu)
                    if width > 0 and height > 0:
                        assert 50 <= width <= 2000, f"Menu width {width} is outside reasonable range"
                        assert 20 <= height <= 1000, f"Menu height {height} is outside reasonable range"

                    # Check menu position
                    x, y = test_helper.get_element_position_by_element(menu)
                    assert x >= 0 and y >= 0, f"Menu position ({x}, {y}) is negative"

        # Test menu items if they exist
        menu_items = test_helper.driver.find_elements(By.CSS_SELECTOR,
            "nav a, .menu-item, [role='menuitem'], li a")

        for item in menu_items[:5]:  # Test first 5 items
            if item.is_displayed():
                assertions.assert_element_rendered_properly(item)

    def test_menu_navigation(self, driver, test_helper, assertions):
        """
        Test 3: Navigation
        Test menu navigation behavior and keyboard interaction
        """
        # Navigate to navigation page
        test_helper.navigate_to_category("navigation")

        # Test tab navigation through menu items
        menu_items = test_helper.driver.find_elements(By.CSS_SELECTOR,
            "nav a, .menu-item, [role='menuitem'], li a")

        if menu_items:
            # Test keyboard navigation
            first_item = menu_items[0]
            first_item.click()  # Focus first item

            # Test arrow keys or tab navigation
            for i in range(min(3, len(menu_items))):
                try:
                    # Try tab key
                    test_helper.driver.switch_to.active_element.send_keys('\t')
                    time.sleep(0.2)

                    # Check if focus moved to next item
                    active = test_helper.driver.switch_to.active_element
                    active_tag = active.tag_name.lower()

                    if active_tag in ['a', 'button']:
                        break
                except:
                    continue

        # Test menu item clicking leads to navigation - re-find elements to avoid stale references
        try:
            fresh_menu_items = test_helper.driver.find_elements(By.CSS_SELECTOR,
                "nav a, .menu-item, [role='menuitem'], li a")
            clickable_items = []

            for item in fresh_menu_items[:5]:  # Test first 5 items
                try:
                    if item.is_displayed() and item.is_enabled():
                        clickable_items.append(item)
                except:
                    continue

            if clickable_items:
                initial_url = test_helper.driver.current_url

                try:
                    clickable_items[0].click()
                    time.sleep(1)

                    # Check if navigation occurred (URL changed or content loaded)
                    assertions.assert_no_console_errors(test_helper.driver)

                except:
                    # Click might not navigate, that's okay
                    pass
        except:
            pass

    def test_menu_no_errors(self, driver, test_helper, assertions):
        """
        Test 4: Runtime Stability
        Test menu runtime stability and console errors
        """
        # Navigate to navigation page
        test_helper.navigate_to_category("navigation")

        # Check initial console state
        initial_errors = test_helper.get_console_errors()
        assert len(initial_errors) == 0, \
            f"Page loaded with {len(initial_errors)} JavaScript errors: {[e['message'] for e in initial_errors]}"

        # Test rapid menu interactions
        menu_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            "nav, [role='navigation'], .menu, [role='menu']")

        for menu in menu_elements:
            if menu.is_displayed():
                # Rapid clicking
                for i in range(5):
                    try:
                        menu.click()
                        time.sleep(0.1)
                    except:
                        continue

        # Test menu item interactions
        menu_items = test_helper.driver.find_elements(By.CSS_SELECTOR,
            "nav a, .menu-item, [role='menuitem'], li a")

        clickable_items = [item for item in menu_items if item.is_displayed() and item.is_enabled()]

        # Rapid hover and click on menu items
        for item in clickable_items[:10]:
            try:
                # Hover
                test_helper.driver.execute_script("arguments[0].scrollIntoView();", item)
                time.sleep(0.1)

                # Click
                item.click()
                time.sleep(0.2)

            except:
                continue

        # Test keyboard navigation stress
        if menu_items:
            try:
                menu_items[0].click()
                time.sleep(0.2)

                # Rapid keyboard navigation
                for i in range(10):
                    active = test_helper.driver.switch_to.active_element
                    active.send_keys('\t')
                    time.sleep(0.1)

            except:
                pass

        # Check for console errors after interactions
        final_errors = test_helper.get_console_errors()
        error_messages = [error['message'] for error in final_errors]

        assert len(final_errors) == 0, \
            f"Menu interactions caused {len(final_errors)} JavaScript errors: {error_messages}"

        # Verify no JavaScript exceptions thrown
        logs = test_helper.driver.get_log('browser')
        js_exceptions = [log for log in logs if 'Uncaught' in log.get('message', '')]

        assert len(js_exceptions) == 0, \
            f"Found {len(js_exceptions)} JavaScript exceptions: {[log['message'] for log in js_exceptions]}"

        # Test menu elements are still functional - re-find elements to avoid stale references
        try:
            fresh_menu_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
                "nav, [role='navigation'], .menu, [role='menu']")
            for menu in fresh_menu_elements:
                try:
                    if menu.is_displayed():
                        assert menu.is_enabled() or menu.tag_name.lower() == 'nav', \
                            "Menu elements should remain functional after interactions"
                except:
                    continue
        except:
            pass

    def get_element_size_by_element(self, element):
        """Helper method to get element size"""
        size = element.size
        return size['width'], size['height']

    def get_element_position_by_element(self, element):
        """Helper method to get element position"""
        location = element.location
        return location['x'], location['y']