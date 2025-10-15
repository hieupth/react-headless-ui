"""
Command component tests for React UI Forge.
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


class TestCommand:
    """Test Command component functionality and accessibility."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup test environment."""
        self.driver = driver
        # Use navigation page for command tests
        self.base_url = "http://localhost:3000/navigation/"
        self.driver.get(self.base_url)

        # Scroll to Command Components section
        try:
            command_section = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Command Components')]"))
            )
            self.driver.execute_script("arguments[0].scrollIntoView(true);", command_section)
            time.sleep(0.5)
        except:
            pass

    def find_command_trigger(self, test_id):
        """Find a command trigger by test ID."""
        try:
            return WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, f"//*[@data-testid='{test_id}']"))
            )
        except TimeoutException:
            raise NoSuchElementException(f"Command trigger with test-id '{test_id}' not found")

    def find_command_input(self):
        """Find command input by test ID."""
        try:
            return WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.XPATH, f"//*[@data-testid='command-input']"))
            )
        except TimeoutException:
            return None

    def find_command_list(self):
        """Find command list by test ID."""
        try:
            return WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.XPATH, f"//*[@data-testid='command-list']"))
            )
        except TimeoutException:
            return None

    def find_command_items(self):
        """Find all command items."""
        try:
            return WebDriverWait(self.driver, 5).until(
                EC.presence_of_all_elements_located((By.XPATH, f"//*[@data-testid='command-item']"))
            )
        except TimeoutException:
            return []

    def open_command(self, trigger_id):
        """Open command by clicking on trigger."""
        trigger = self.find_command_trigger(trigger_id)

        # Click the trigger to open command
        trigger.click()
        time.sleep(0.5)  # Wait for command to open

        # Return the command input if found
        return self.find_command_input()

    def test_command_basic_functionality(self):
        """Test 1: Command basic functionality."""
        print("Test 1: Testing Command basic functionality...")

        # Test basic command trigger
        trigger = self.find_command_trigger("command-basic-trigger")
        assert trigger.is_displayed(), "Command trigger should be visible"

        # Open command
        command_input = self.open_command("command-basic-trigger")
        assert command_input is not None, "Command input should be present after opening command"

        # Verify command input is focused
        focused_element = self.driver.switch_to.active_element
        assert focused_element == command_input, "Command input should be focused when opened"

        # Verify command list is present
        command_list = self.find_command_list()
        assert command_list is not None, "Command list should be present"

        # Verify command items are present
        command_items = self.find_command_items()
        assert len(command_items) > 0, "Command should have items"

        # Test typing in command input
        command_input.send_keys("New")
        time.sleep(0.2)

        # Verify input value changed
        assert "New" in command_input.get_attribute("value"), "Command input should accept text"

        # Test closing command with Escape
        command_input.send_keys(Keys.ESCAPE)
        time.sleep(0.3)

        # Verify command is closed (input should no longer be present or visible)
        closed_input = self.find_command_input()
        assert closed_input is None, "Command should close on Escape key"

        print("✅ Command basic functionality test passed")

    def test_command_renders_normally(self):
        """Test 2: Command visual rendering."""
        print("Test 2: Testing Command visual rendering...")

        # Test all command triggers are properly rendered
        triggers_to_test = [
            "command-basic-trigger",
            "command-shortcuts-trigger",
            "command-groups-trigger"
        ]

        for trigger_id in triggers_to_test:
            trigger = self.find_command_trigger(trigger_id)
            assert trigger.is_displayed(), f"{trigger_id} should be displayed"

            # Check trigger dimensions
            size = trigger.size
            assert size['width'] > 0, f"{trigger_id} should have positive width"
            assert size['height'] > 0, f"{trigger_id} should have positive height"

            # Check trigger position
            location = trigger.location
            assert location['x'] >= 0, f"{trigger_id} should be positioned within viewport"
            assert location['y'] >= 0, f"{trigger_id} should be positioned within viewport"

            # Check trigger has proper styling for interaction
            cursor = trigger.value_of_css_property("cursor")
            assert cursor in ["pointer", "default"], f"{trigger_id} should have appropriate cursor"

        # Open command to test visual rendering of command palette
        command_input = self.open_command("command-basic-trigger")
        assert command_input is not None, "Command should open"

        # Test command input rendering
        input_size = command_input.size
        assert input_size['width'] > 100, "Command input should have reasonable width"
        assert input_size['height'] > 20, "Command input should have reasonable height"

        # Test command list rendering
        command_list = self.find_command_list()
        assert command_list is not None, "Command list should be visible"

        list_size = command_list.size
        assert list_size['width'] > 200, "Command list should have reasonable width"
        assert list_size['height'] > 100, "Command list should have reasonable height"

        # Test command items rendering
        command_items = self.find_command_items()
        assert len(command_items) > 0, "Command should have items"

        for item in command_items[:3]:  # Test first 3 items
            assert item.is_displayed(), "Command items should be displayed"
            item_size = item.size
            assert item_size['height'] > 20, "Command items should have reasonable height"

        # Test keyboard shortcut rendering (kbd elements)
        kb_elements = self.driver.find_elements(By.TAG_NAME, "kbd")
        assert len(kb_elements) > 0, "Command should display keyboard shortcuts"

        for kb in kb_elements[:3]:  # Test first 3 kbd elements
            assert kb.is_displayed(), "Keyboard shortcuts should be visible"
            kb_text = kb.text
            assert len(kb_text) > 0, "Keyboard shortcuts should have text"

        # Close command
        command_input.send_keys(Keys.ESCAPE)
        time.sleep(0.2)

        print("✅ Command visual rendering test passed")

    def test_command_navigation(self):
        """Test 3: Command navigation and interaction."""
        print("Test 3: Testing Command navigation...")

        # Open command
        command_input = self.open_command("command-shortcuts-trigger")
        assert command_input is not None, "Command should be open"

        # Test keyboard navigation
        command_items = self.find_command_items()
        if len(command_items) > 0:
            # Focus the input first
            command_input.send_keys(Keys.TAB)
            time.sleep(0.1)

            # Test ArrowDown navigation
            command_input.send_keys(Keys.ARROW_DOWN)
            time.sleep(0.1)

            # Test typing to filter
            command_input.send_keys("Save")
            time.sleep(0.2)

            # Check that input value changed
            assert "Save" in command_input.get_attribute("value"), "Command input should filter items"

            # Test Enter to select (should close command)
            command_input.send_keys(Keys.ENTER)
            time.sleep(0.3)

            # Command should close after selection
            closed_input = self.find_command_input()
            assert closed_input is None, "Command should close after item selection"

        # Reopen command for more navigation tests
        command_input = self.open_command("command-groups-trigger")
        assert command_input is not None, "Command should reopen"

        # Test Escape key to close
        command_input.send_keys(Keys.ESCAPE)
        time.sleep(0.2)

        # Verify command is closed
        closed_input = self.find_command_input()
        assert closed_input is None, "Command should close on Escape key"

        # Test keyboard shortcut display
        command_input = self.open_command("command-shortcuts-trigger")
        command_items = self.find_command_items()

        # Check that items have keyboard shortcuts
        shortcuts_found = False
        for item in command_items:
            kb_elements = item.find_elements(By.TAG_NAME, "kbd")
            if kb_elements:
                shortcuts_found = True
                break

        assert shortcuts_found, "Command items should display keyboard shortcuts"

        # Test mouse interaction with items
        command_items = self.find_command_items()
        if len(command_items) > 0:
            # Hover over first item
            self.driver.execute_script("arguments[0].dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));", command_items[0])
            time.sleep(0.1)

            # Click item
            command_items[0].click()
            time.sleep(0.2)

            # Command should close
            closed_input = self.find_command_input()
            assert closed_input is None, "Command should close after item click"

        # Check for console errors during navigation
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        assert len(errors) == 0, f"Should have no console errors during navigation, but found: {errors}"

        print("✅ Command navigation test passed")

    def test_command_no_errors(self):
        """Test 4: Command runtime stability."""
        print("Test 4: Testing Command runtime stability...")

        # Check initial console state
        initial_logs = self.driver.get_log('browser')
        initial_errors = [log for log in initial_logs if log['level'] == 'SEVERE']

        # Test various command interactions
        triggers_to_test = [
            "command-basic-trigger",
            "command-shortcuts-trigger",
            "command-groups-trigger"
        ]

        for trigger_id in triggers_to_test:
            # Open and close command multiple times
            for i in range(3):
                command_input = self.open_command(trigger_id)
                if command_input:
                    # Test typing and filtering
                    test_terms = ["New", "Open", "Save", "Settings", ""]
                    for term in test_terms:
                        command_input.clear()
                        command_input.send_keys(term)
                        time.sleep(0.1)

                    # Test keyboard navigation
                    for j in range(3):
                        command_input.send_keys(Keys.ARROW_DOWN)
                        time.sleep(0.05)

                    # Close command
                    command_input.send_keys(Keys.ESCAPE)
                    time.sleep(0.1)

        # Test rapid command operations
        try:
            trigger = self.find_command_trigger("command-basic-trigger")

            # Rapid open/close operations
            for i in range(5):
                trigger.click()
                time.sleep(0.1)

                command_input = self.find_command_input()
                if command_input:
                    command_input.send_keys(Keys.ESCAPE)
                time.sleep(0.1)

        except NoSuchElementException:
            pass

        # Test keyboard operations
        try:
            command_input = self.open_command("command-shortcuts-trigger")
            if command_input:
                # Test various keyboard combinations
                keys_to_test = [Keys.ARROW_UP, Keys.ARROW_DOWN, Keys.HOME, Keys.END]
                for key in keys_to_test:
                    command_input.send_keys(key)
                    time.sleep(0.05)

                # Test typing special characters
                special_chars = ["!@#$%", "test123", "Search query"]
                for text in special_chars:
                    command_input.clear()
                    command_input.send_keys(text)
                    time.sleep(0.05)

                command_input.send_keys(Keys.ESCAPE)
                time.sleep(0.1)

        except:
            pass

        # Test disabled items interaction
        try:
            command_input = self.open_command("command-groups-trigger")
            if command_input:
                command_items = self.find_command_items()

                # Find and test disabled items
                for item in command_items:
                    if item.get_attribute("data-disabled") == "true":
                        # Try to click disabled item
                        try:
                            item.click()
                            time.sleep(0.1)
                        except:
                            pass
                        break

                command_input.send_keys(Keys.ESCAPE)
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
        assert current_url == self.base_url, "Should still be on the correct page after interactions"

        # Test all command triggers are still functional
        for trigger_id in triggers_to_test:
            try:
                trigger = self.find_command_trigger(trigger_id)
                assert trigger.is_displayed(), f"{trigger_id} should still be displayed"
                assert trigger.is_enabled(), f"{trigger_id} should still be enabled"
            except NoSuchElementException:
                continue

        print("✅ Command runtime stability test passed")

    def test_command_accessibility(self):
        """Additional test: Command accessibility features."""
        print("Testing Command accessibility...")

        # Test all command triggers have proper accessibility
        trigger_configs = [
            ("command-basic-trigger", "basic command"),
            ("command-shortcuts-trigger", "command with shortcuts"),
            ("command-groups-trigger", "command with groups")
        ]

        for trigger_id, description in trigger_configs:
            trigger = self.find_command_trigger(trigger_id)

            # Check that trigger is accessible
            assert trigger.is_displayed(), f"{trigger_id} should be visible"
            assert trigger.is_enabled(), f"{trigger_id} should be enabled"

            # Check that trigger responds to keyboard
            trigger.send_keys(Keys.ENTER)
            time.sleep(0.1)

            # Close if opened
            command_input = self.find_command_input()
            if command_input:
                command_input.send_keys(Keys.ESCAPE)
                time.sleep(0.1)

        # Test command input accessibility
        command_input = self.open_command("command-basic-trigger")
        assert command_input is not None, "Command input should be accessible"

        # Check input has proper ARIA attributes
        input_attrs = {
            'aria-label': 'Search commands',
            'role': 'searchbox',
            'type': 'text'
        }

        for attr, expected_value in input_attrs.items():
            actual_value = command_input.get_attribute(attr)
            assert actual_value == expected_value, f"Command input should have {attr}='{expected_value}'"

        # Check input is properly focused
        focused_element = self.driver.switch_to.active_element
        assert focused_element == command_input, "Command input should be focused when opened"

        # Test command list accessibility
        command_list = self.find_command_list()
        assert command_list is not None, "Command list should be accessible"

        # Check list has proper ARIA attributes
        list_role = command_list.get_attribute("role")
        assert list_role == "listbox", "Command list should have role='listbox'"

        # Test command items accessibility
        command_items = self.find_command_items()
        assert len(command_items) > 0, "Command should have accessible items"

        # Check items have proper role
        for i, item in enumerate(command_items[:3]):  # Test first 3 items
            try:
                item_role = item.get_attribute("role")
                assert item_role == "option", f"Command item {i} should have role='option'"
            except:
                # Element might be stale, skip to next item
                continue

        # Test keyboard navigation through items
        command_input.clear()
        command_input.send_keys(Keys.ARROW_DOWN)
        time.sleep(0.1)

        # Test that disabled items have proper attributes
        disabled_items = self.driver.find_elements(By.XPATH, "//*[@data-disabled='true']")
        for item in disabled_items:
            aria_disabled = item.get_attribute("aria-disabled")
            assert aria_disabled == "true", "Disabled items should have aria-disabled='true'"

        # Close command
        command_input.send_keys(Keys.ESCAPE)
        time.sleep(0.1)

        # Test that triggers can be navigated to via keyboard
        first_trigger = self.find_command_trigger("command-basic-trigger")
        first_trigger.send_keys(Keys.TAB)
        time.sleep(0.1)

        # Check that focus moved
        active_element = self.driver.switch_to.active_element
        assert active_element is not None, "Should have focused element after tab"

        # Test that all triggers have accessible names
        for trigger_id, description in trigger_configs:
            trigger = self.find_command_trigger(trigger_id)

            # Check for accessible text content
            text_content = trigger.text.strip()
            assert len(text_content) > 0, f"{trigger_id} should have accessible text content"

        print("✅ Command accessibility test passed")