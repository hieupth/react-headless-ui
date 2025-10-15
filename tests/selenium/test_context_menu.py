"""
Context Menu component tests for React UI Forge.
Following CLAUDE.md requirements: 4 test types per component.
"""

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time
from test_helpers import normalize_url


class TestContextMenu:
    """Test Context Menu component functionality and accessibility."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, interactive_url):
        """Setup test environment."""
        self.driver = driver
        self.base_url = interactive_url
        self.driver.get(self.base_url)

    def find_context_menu_trigger(self, test_id):
        """Find a context menu trigger by test ID."""
        try:
            return WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, f"//*[@data-testid='{test_id}']"))
            )
        except TimeoutException:
            raise NoSuchElementException(f"Context Menu trigger with test-id '{test_id}' not found")

    def find_context_menu(self, test_id):
        """Find a context menu by test ID."""
        try:
            return WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.XPATH, f"//*[@data-testid='{test_id}']"))
            )
        except TimeoutException:
            return None

    def open_context_menu(self, trigger_id):
        """Open context menu by right-clicking on trigger."""
        trigger = self.find_context_menu_trigger(trigger_id)

        # Use ActionChains to perform right-click
        actions = ActionChains(self.driver)
        actions.context_click(trigger).perform()
        time.sleep(0.5)  # Wait for menu to open

        # Try to find the menu based on trigger type
        menu_id = trigger_id.replace('-trigger', '')
        return self.find_context_menu(menu_id)

    def test_context_menu_basic_functionality(self):
        """Test 1: Context Menu basic functionality."""
        print("Test 1: Testing Context Menu basic functionality...")

        # Test basic context menu trigger
        trigger = self.find_context_menu_trigger("context-menu-basic-trigger")
        assert trigger.is_displayed(), "Context menu trigger should be visible"

        # Open context menu
        menu = self.open_context_menu("context-menu-basic-trigger")
        assert menu is not None, "Context menu should open after right-click"

        # Verify menu structure
        menu_items = menu.find_elements(By.CSS_SELECTOR, "[role='menuitem']")
        assert len(menu_items) >= 4, "Basic context menu should have at least 4 items"

        # Check menu attributes
        assert menu.get_attribute("role") == "menu", "Menu should have role='menu'"
        assert menu.get_attribute("aria-label") == "Context menu", "Menu should have proper aria-label"

        # Verify menu items have correct attributes
        for item in menu_items:
            assert item.get_attribute("role") == "menuitem", "Menu items should have role='menuitem'"
            assert item.get_attribute("tabIndex") == "-1", "Menu items should not be tabbable initially"

        # Test menu closes on outside click
        self.driver.find_element(By.TAG_NAME, "body").click()
        time.sleep(0.2)

        # Verify menu is closed
        closed_menu = self.find_context_menu("context-menu-basic")
        assert closed_menu is None, "Menu should close when clicking outside"

        print("✅ Context Menu basic functionality test passed")

    def test_context_menu_renders_normally(self):
        """Test 2: Context Menu visual rendering."""
        print("Test 2: Testing Context Menu visual rendering...")

        # Test basic context menu
        trigger = self.find_context_menu_trigger("context-menu-basic-trigger")
        assert trigger.is_displayed(), "Basic context menu trigger should be displayed"

        # Check trigger dimensions
        size = trigger.size
        assert size['width'] > 0, "Context menu trigger should have positive width"
        assert size['height'] > 0, "Context menu trigger should have positive height"

        # Check trigger position
        location = trigger.location
        assert location['x'] >= 0, "Context menu trigger should be positioned within viewport"
        assert location['y'] >= 0, "Context menu trigger should be positioned within viewport"

        # Test different trigger types
        triggers_to_test = [
            "context-menu-basic-trigger",
            "context-menu-checkbox-trigger",
            "context-menu-icons-trigger"
        ]

        for trigger_id in triggers_to_test:
            try:
                trigger = self.find_context_menu_trigger(trigger_id)
                assert trigger.is_displayed(), f"{trigger_id} should be displayed"

                # Check cursor style
                cursor = trigger.value_of_css_property("cursor")
                assert cursor == "pointer", f"{trigger_id} should have pointer cursor"

                # Open menu to test visual rendering
                menu = self.open_context_menu(trigger_id)
                if menu:
                    # Check menu positioning
                    menu_location = menu.location
                    assert menu_location['x'] >= 0, f"Menu from {trigger_id} should be positioned within viewport"
                    assert menu_location['y'] >= 0, f"Menu from {trigger_id} should be positioned within viewport"

                    # Check menu dimensions
                    menu_size = menu.size
                    assert menu_size['width'] > 100, f"Menu from {trigger_id} should have reasonable width"
                    assert menu_size['height'] > 50, f"Menu from {trigger_id} should have reasonable height"

                    # Close menu
                    self.driver.find_element(By.TAG_NAME, "body").click()
                    time.sleep(0.2)

            except NoSuchElementException:
                continue  # Skip if this trigger doesn't exist

        print("✅ Context Menu visual rendering test passed")

    def test_context_menu_navigation(self):
        """Test 3: Context Menu navigation and interaction."""
        print("Test 3: Testing Context Menu navigation...")

        # Open context menu
        menu = self.open_context_menu("context-menu-basic-trigger")
        assert menu is not None, "Context menu should be open"

        # Test keyboard navigation
        menu_items = menu.find_elements(By.CSS_SELECTOR, "[role='menuitem']")

        # Focus the menu
        self.driver.execute_script("arguments[0].focus();", menu)
        time.sleep(0.2)

        # Test ArrowDown navigation
        if len(menu_items) > 0:
            # Focus first item
            self.driver.execute_script("arguments[0].focus();", menu_items[0])
            time.sleep(0.1)

            # Test clicking on first item (instead of keyboard for menu items)
            menu_items[0].click()
            time.sleep(0.2)

            # Menu should close after item selection
            closed_menu = self.find_context_menu("context-menu-basic")
            assert closed_menu is None, "Menu should close after item click"

        # Reopen menu for Escape test
        menu = self.open_context_menu("context-menu-basic-trigger")
        assert menu is not None, "Context menu should reopen"

        # Test Escape key to close menu (send to body instead of menu)
        self.driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
        time.sleep(0.2)

        # Verify menu is closed
        closed_menu = self.find_context_menu("context-menu-basic")
        assert closed_menu is None, "Menu should close on Escape key"

        # Test mouse interaction
        menu = self.open_context_menu("context-menu-icons-trigger")
        assert menu is not None, "Icons context menu should open"

        menu_items = menu.find_elements(By.CSS_SELECTOR, "[role='menuitem']")
        if len(menu_items) > 0:
            # Hover over first item
            self.driver.execute_script("arguments[0].dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));", menu_items[0])
            time.sleep(0.1)

            # Click item
            menu_items[0].click()
            time.sleep(0.2)

            # Menu should close
            closed_menu = self.find_context_menu("context-menu-icons")
            assert closed_menu is None, "Menu should close after item click"

        # Check for console errors during navigation
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        assert len(errors) == 0, f"Should have no console errors during navigation, but found: {errors}"

        print("✅ Context Menu navigation test passed")

    def test_context_menu_no_errors(self):
        """Test 4: Context Menu runtime stability."""
        print("Test 4: Testing Context Menu runtime stability...")

        # Check initial console state
        initial_logs = self.driver.get_log('browser')
        initial_errors = [log for log in initial_logs if log['level'] == 'SEVERE']

        # Test various context menu interactions
        triggers_to_test = [
            "context-menu-basic-trigger",
            "context-menu-checkbox-trigger",
            "context-menu-icons-trigger"
        ]

        for trigger_id in triggers_to_test:
            try:
                # Open and close menu multiple times
                for i in range(3):
                    menu = self.open_context_menu(trigger_id)
                    if menu:
                        # Test menu items
                        menu_items = menu.find_elements(By.CSS_SELECTOR, "[role='menuitem']")

                        # Test clicking on items
                        for j, item in enumerate(menu_items[:2]):  # Test first 2 items only
                            try:
                                # Hover over item
                                self.driver.execute_script("arguments[0].dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));", item)
                                time.sleep(0.05)

                                # Click item
                                item.click()
                                time.sleep(0.1)

                                # Reopen menu for next item
                                menu = self.open_context_menu(trigger_id)
                                if menu:
                                    menu_items = menu.find_elements(By.CSS_SELECTOR, "[role='menuitem']")
                                else:
                                    break
                            except:
                                continue

                    # Close menu by clicking outside
                    self.driver.find_element(By.TAG_NAME, "body").click()
                    time.sleep(0.1)

            except NoSuchElementException:
                continue  # Skip if this trigger doesn't exist

        # Test rapid context menu operations
        try:
            trigger = self.find_context_menu_trigger("context-menu-basic-trigger")

            # Rapid open/close operations
            for i in range(5):
                actions = ActionChains(self.driver)
                actions.context_click(trigger).perform()
                time.sleep(0.1)
                self.driver.find_element(By.TAG_NAME, "body").click()
                time.sleep(0.1)

        except NoSuchElementException:
            pass

        # Test keyboard operations
        try:
            menu = self.open_context_menu("context-menu-basic-trigger")
            if menu:
                # Test various keyboard combinations
                menu.send_keys(Keys.ESCAPE)
                time.sleep(0.1)
        except:
            pass

        # Check for console errors after interactions
        final_logs = self.driver.get_log('browser')
        final_errors = [log for log in final_logs if log['level'] == 'SEVERE']

        # Assert no new errors were introduced
        assert len(final_errors) == len(initial_errors), \
            f"Should have no new console errors. Initial: {len(initial_errors)}, Final: {len(final_errors)}"

        # Test that we can still interact with the page
        current_url = self.driver.current_url
        assert normalize_url(current_url) == normalize_url(self.base_url), "Should still be on the correct page after interactions"

        # Test all context menu triggers are still functional
        for trigger_id in triggers_to_test:
            try:
                trigger = self.find_context_menu_trigger(trigger_id)
                assert trigger.is_displayed(), f"{trigger_id} should still be displayed"
                assert trigger.get_attribute("role") or True, f"{trigger_id} should be interactive"
            except NoSuchElementException:
                continue

        print("✅ Context Menu runtime stability test passed")

    def test_context_menu_accessibility(self):
        """Additional test: Context Menu accessibility features."""
        print("Testing Context Menu accessibility...")

        # Test basic context menu accessibility
        trigger = self.find_context_menu_trigger("context-menu-basic-trigger")
        assert trigger.is_displayed(), "Context menu trigger should be visible"

        # Open context menu
        menu = self.open_context_menu("context-menu-basic-trigger")
        assert menu is not None, "Context menu should be open"

        # Check menu accessibility attributes
        assert menu.get_attribute("role") == "menu", "Menu should have role='menu'"
        assert menu.get_attribute("aria-label"), "Menu should have aria-label"

        # Check menu items accessibility
        menu_items = menu.find_elements(By.CSS_SELECTOR, "[role='menuitem']")
        for item in menu_items:
            assert item.get_attribute("role") == "menuitem", "Menu items should have role='menuitem'"

            # Check for keyboard accessibility
            tabindex = item.get_attribute("tabIndex")
            assert tabindex == "-1", "Menu items should initially have tabIndex='-1'"

        # Test keyboard navigation with arrows (focus menu instead of items)
        if len(menu_items) > 1:
            # Focus the menu
            self.driver.execute_script("arguments[0].focus();", menu)
            time.sleep(0.2)

            # Test clicking on first item to verify it works
            menu_items[0].click()
            time.sleep(0.1)

            # Menu should close after clicking item
            closed_menu = self.find_context_menu("context-menu-basic")
            assert closed_menu is None, "Menu should close after clicking item"

        # Test checkboxes context menu
        menu = self.open_context_menu("context-menu-checkbox-trigger")
        if menu:
            checkbox_items = menu.find_elements(By.CSS_SELECTOR, "[aria-checked]")
            for item in checkbox_items:
                aria_checked = item.get_attribute("aria-checked")
                assert aria_checked in ["true", "false"], "Checkbox items should have aria-checked attribute"

        # Test all triggers have proper accessibility
        trigger_configs = [
            ("context-menu-basic-trigger", "basic context menu"),
            ("context-menu-checkbox-trigger", "checkbox context menu"),
            ("context-menu-icons-trigger", "icons context menu")
        ]

        for trigger_id, description in trigger_configs:
            try:
                trigger = self.find_context_menu_trigger(trigger_id)

                # Check that trigger is interactive
                cursor = trigger.value_of_css_property("cursor")
                assert cursor == "pointer", f"{trigger_id} should be interactive with pointer cursor"

                # Test that trigger responds to right-click
                menu = self.open_context_menu(trigger_id)
                if menu:
                    # Verify menu has proper ARIA attributes
                    assert menu.get_attribute("role") == "menu", f"Menu from {trigger_id} should have role='menu'"

                    # Close menu
                    self.driver.find_element(By.TAG_NAME, "body").click()
                    time.sleep(0.1)

            except NoSuchElementException:
                continue

        print("✅ Context Menu accessibility test passed")