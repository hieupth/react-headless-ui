"""
Combobox component tests for React UI Forge.
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


class TestCombobox:
    """Test Combobox component functionality and accessibility."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup test environment."""
        self.driver = driver
        # Use inputs page for combobox tests
        self.base_url = "http://localhost:3000/inputs/"
        self.driver.get(self.base_url)

        # Scroll to Combobox section
        try:
            combobox_section = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Combobox Components')]"))
            )
            self.driver.execute_script("arguments[0].scrollIntoView(true);", combobox_section)
            time.sleep(0.5)
        except:
            pass

    def find_combobox_input(self, test_id):
        """Find a combobox input by test ID."""
        try:
            return WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, f"//*[@data-testid='{test_id}']"))
            )
        except TimeoutException:
            raise NoSuchElementException(f"Combobox input with test-id '{test_id}' not found")

    def find_combobox_list(self):
        """Find combobox list by test ID."""
        try:
            return WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.XPATH, f"//*[@data-testid='combobox-list']"))
            )
        except TimeoutException:
            return None

    def find_combobox_options(self):
        """Find all combobox options."""
        try:
            return WebDriverWait(self.driver, 5).until(
                EC.presence_of_all_elements_located((By.XPATH, f"//*[@data-testid='combobox-option']"))
            )
        except TimeoutException:
            return []

    def find_combobox_clear_button(self):
        """Find combobox clear button by test ID."""
        try:
            return WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.XPATH, f"//*[@data-testid='combobox-clear']"))
            )
        except TimeoutException:
            return None

    def find_combobox_empty(self):
        """Find combobox empty message by test ID."""
        try:
            return WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.XPATH, f"//*[@data-testid='combobox-empty']"))
            )
        except TimeoutException:
            return None

    def open_combobox(self, input_id):
        """Open combobox by focusing on input."""
        input_element = self.find_combobox_input(input_id)

        # Close any existing dropdowns first by clicking elsewhere
        try:
            self.driver.execute_script("document.body.click()")
            time.sleep(0.2)
        except:
            pass

        # Focus the input to open dropdown using JavaScript (more reliable)
        self.driver.execute_script("arguments[0].focus();", input_element)
        time.sleep(0.5)  # Wait for dropdown to open

        return input_element

    def test_combobox_basic_functionality(self):
        """Test 1: Combobox basic functionality."""
        print("Test 1: Testing Combobox basic functionality...")

        # Test basic combobox input
        input_element = self.find_combobox_input("combobox-basic-input")
        assert input_element.is_displayed(), "Combobox input should be visible"

        # Open combobox
        input_element = self.open_combobox("combobox-basic-input")
        assert input_element is not None, "Combobox input should be focusable"

        # Type to filter options
        input_element.send_keys("Apple")
        time.sleep(0.5)

        # Verify combobox list is present
        combobox_list = self.find_combobox_list()
        assert combobox_list is not None, "Combobox list should be present when typing"

        # Verify filtered options
        options = self.find_combobox_options()
        assert len(options) > 0, "Combobox should have filtered options"

        # Test option selection
        if len(options) > 0:
            options[0].click()
            time.sleep(0.3)

            # Verify input value changed
            input_value = input_element.get_attribute("value")
            assert "Apple" in input_value, "Combobox input should show selected value"

            # Verify clear button appears
            clear_button = self.find_combobox_clear_button()
            assert clear_button is not None, "Clear button should appear when value is selected"

            # Test clear functionality
            clear_button.click()
            time.sleep(0.2)

            # Verify input is cleared
            cleared_value = input_element.get_attribute("value")
            assert cleared_value == "", "Combobox input should be cleared"

        # Test no results
        input_element.send_keys("XYZ")
        time.sleep(0.3)

        empty_message = self.find_combobox_empty()
        assert empty_message is not None, "No results message should appear for invalid search"

        # Test keyboard navigation
        # Use JavaScript to clear and trigger React events properly
        self.driver.execute_script("arguments[0].value = ''; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", input_element)
        time.sleep(0.1)
        input_element.send_keys("Berry")
        time.sleep(0.3)

        options = self.find_combobox_options()
        if len(options) > 0:
            # Test ArrowDown navigation
            input_element.send_keys(Keys.ARROW_DOWN)
            time.sleep(0.1)

            # Test Enter to select
            input_element.send_keys(Keys.ENTER)
            time.sleep(0.2)

            # Verify selection
            selected_value = input_element.get_attribute("value")
            assert "Berry" in selected_value, "Combobox should select option with Enter key"

        # Test Escape key to close
        input_element.send_keys(Keys.ESCAPE)
        time.sleep(0.2)

        print("✅ Combobox basic functionality test passed")

    def test_combobox_renders_normally(self):
        """Test 2: Combobox visual rendering."""
        print("Test 2: Testing Combobox visual rendering...")

        # Test all combobox inputs are properly rendered
        inputs_to_test = [
            "combobox-basic-input",
            "combobox-groups-input",
            "combobox-custom-input"
        ]

        for input_id in inputs_to_test:
            input_element = self.find_combobox_input(input_id)
            assert input_element.is_displayed(), f"{input_id} should be displayed"

            # Check input dimensions
            size = input_element.size
            assert size['width'] > 100, f"{input_id} should have reasonable width"
            assert size['height'] > 20, f"{input_id} should have reasonable height"

            # Check input position
            location = input_element.location
            assert location['x'] >= 0, f"{input_id} should be positioned within viewport"
            assert location['y'] >= 0, f"{input_id} should be positioned within viewport"

            # Check input has proper styling
            border = input_element.value_of_css_property("border")
            assert border != "0px none rgb(0, 0, 0)", f"{input_id} should have visible border"

        # Test combobox list rendering
        input_element = self.open_combobox("combobox-basic-input")
        input_element.send_keys("Apple")
        time.sleep(0.3)

        combobox_list = self.find_combobox_list()
        if combobox_list:
            # Check list dimensions
            list_size = combobox_list.size
            assert list_size['width'] > 100, "Combobox list should have reasonable width"
            assert list_size['height'] > 50, "Combobox list should have reasonable height"

            # Check list positioning
            list_location = combobox_list.location
            assert list_location['y'] > input_element.location['y'], "List should appear below input"

        # Test option rendering
        options = self.find_combobox_options()
        for option in options[:3]:  # Test first 3 options
            assert option.is_displayed(), "Combobox options should be displayed"
            option_size = option.size
            assert option_size['height'] > 20, "Combobox options should have reasonable height"

            # Check option text
            option_text = option.text
            assert len(option_text) > 0, "Combobox options should have text content"

        # Test clear button rendering
        # Use JavaScript to clear and trigger React events properly
        self.driver.execute_script("arguments[0].value = ''; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", input_element)
        time.sleep(0.1)
        input_element.send_keys("Apple")
        time.sleep(0.3)
        options = self.find_combobox_options()
        if len(options) > 0:
            options[0].click()
            time.sleep(0.2)

            clear_button = self.find_combobox_clear_button()
            if clear_button:
                assert clear_button.is_displayed(), "Clear button should be visible"
                clear_size = clear_button.size
                assert clear_size['width'] > 5, "Clear button should have reasonable size"
                assert clear_size['height'] > 5, "Clear button should have reasonable size"

        # Test empty message rendering
        # Use JavaScript to clear and trigger React events properly
        self.driver.execute_script("arguments[0].value = ''; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", input_element)
        time.sleep(0.1)
        input_element.send_keys("XYZ")
        time.sleep(0.3)

        empty_message = self.find_combobox_empty()
        if empty_message:
            assert empty_message.is_displayed(), "Empty message should be visible"
            empty_text = empty_message.text
            assert len(empty_text) > 0, "Empty message should have text content"

        print("✅ Combobox visual rendering test passed")

    def test_combobox_navigation(self):
        """Test 3: Combobox navigation and interaction."""
        print("Test 3: Testing Combobox navigation...")

        # Test keyboard navigation
        input_element = self.open_combobox("combobox-basic-input")
        input_element.send_keys("Ap")
        time.sleep(0.3)

        options = self.find_combobox_options()
        if len(options) > 0:
            # Test ArrowDown navigation
            input_element.send_keys(Keys.ARROW_DOWN)
            time.sleep(0.1)

            # Test multiple ArrowDown
            for i in range(min(3, len(options))):
                input_element.send_keys(Keys.ARROW_DOWN)
                time.sleep(0.05)

            # Test ArrowUp navigation
            input_element.send_keys(Keys.ARROW_UP)
            time.sleep(0.1)

            # Test Enter to select
            input_element.send_keys(Keys.ENTER)
            time.sleep(0.2)

            # Verify selection
            selected_value = input_element.get_attribute("value")
            assert len(selected_value) > 0, "Combobox should have selected value"

            # Test clear with keyboard
            input_element.send_keys(Keys.BACKSPACE)
            time.sleep(0.1)

        # Test typing to filter
        # Use JavaScript to clear and trigger React events properly
        self.driver.execute_script("arguments[0].value = ''; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", input_element)
        time.sleep(0.1)
        input_element.send_keys("berry")
        time.sleep(0.3)

        # Check that options are filtered
        filtered_options = self.find_combobox_options()
        for option in filtered_options:
            option_text = option.text.lower()
            assert "berry" in option_text, f"Option '{option_text}' should contain 'berry'"

        # Test Escape key
        input_element.send_keys(Keys.ESCAPE)
        time.sleep(0.2)

        # Test Tab navigation
        input_element = self.open_combobox("combobox-groups-input")
        input_element.send_keys(Keys.TAB)
        time.sleep(0.1)

        # Test mouse interaction
        input_element = self.open_combobox("combobox-custom-input")
        input_element.send_keys("Test")
        time.sleep(0.3)

        options = self.find_combobox_options()
        if len(options) > 0:
            # Hover over first option
            self.driver.execute_script("arguments[0].dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));", options[0])
            time.sleep(0.1)

            # Click option
            options[0].click()
            time.sleep(0.2)

            # Verify selection
            selected_value = input_element.get_attribute("value")
            assert len(selected_value) > 0, "Combobox should select option on click"

        # Test focus management
        input_element = self.find_combobox_input("combobox-basic-input")
        input_element.click()
        time.sleep(0.1)

        focused_element = self.driver.switch_to.active_element
        assert focused_element == input_element, "Combobox input should be focused when clicked"

        # Check for console errors during navigation
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        assert len(errors) == 0, f"Should have no console errors during navigation, but found: {errors}"

        print("✅ Combobox navigation test passed")

    def test_combobox_no_errors(self):
        """Test 4: Combobox runtime stability."""
        print("Test 4: Testing Combobox runtime stability...")

        # Check initial console state
        initial_logs = self.driver.get_log('browser')
        initial_errors = [log for log in initial_logs if log['level'] == 'SEVERE' and 'favicon.ico' not in log['message']]

        # Test basic combobox interactions (simplified)
        input_element = self.open_combobox("combobox-basic-input")

        # Test basic typing
        input_element.send_keys("Apple")
        time.sleep(0.3)

        # Test option selection
        options = self.find_combobox_options()
        if len(options) > 0:
            options[0].click()
            time.sleep(0.2)

        # Test keyboard operations
        input_element = self.open_combobox("combobox-basic-input")
        input_element.send_keys(Keys.ARROW_DOWN)
        time.sleep(0.1)
        input_element.send_keys(Keys.ESCAPE)
        time.sleep(0.1)

        # Test clearing
        self.driver.execute_script("arguments[0].value = ''; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", input_element)
        time.sleep(0.1)

        # Check for console errors after interactions
        final_logs = self.driver.get_log('browser')
        final_errors = [log for log in final_logs if log['level'] == 'SEVERE' and 'favicon.ico' not in log['message']]

        # Assert no new errors were introduced
        assert len(final_errors) == len(initial_errors), \
            f"Should have no new console errors. Initial: {len(initial_errors)}, Final: {len(final_errors)}"

        # Test that we can still interact with the page
        current_url = self.driver.current_url
        assert current_url == self.base_url, "Should still be on the correct page after interactions"

        print("✅ Combobox runtime stability test passed")

    def test_combobox_accessibility(self):
        """Additional test: Combobox accessibility features."""
        print("Testing Combobox accessibility...")

        # Test all combobox inputs have proper accessibility
        input_configs = [
            ("combobox-basic-input", "basic combobox"),
            ("combobox-groups-input", "combobox with groups"),
            ("combobox-custom-input", "combobox with custom values")
        ]

        for input_id, description in input_configs:
            input_element = self.find_combobox_input(input_id)

            # Check that input is accessible
            assert input_element.is_displayed(), f"{input_id} should be visible"
            assert input_element.is_enabled(), f"{input_id} should be enabled"

            # Check for proper ARIA attributes
            role = input_element.get_attribute("role")
            assert role == "combobox", f"{input_id} should have role='combobox'"

            aria_expanded = input_element.get_attribute("aria-expanded")
            assert aria_expanded is not None, f"{input_id} should have aria-expanded attribute"

            aria_haspopup = input_element.get_attribute("aria-haspopup")
            assert aria_haspopup == "listbox", f"{input_id} should have aria-haspopup='listbox'"

            aria_autocomplete = input_element.get_attribute("aria-autocomplete")
            assert aria_autocomplete == "list", f"{input_id} should have aria-autocomplete='list'"

        # Test combobox list accessibility
        input_element = self.open_combobox("combobox-basic-input")
        input_element.send_keys("Apple")
        time.sleep(0.3)

        combobox_list = self.find_combobox_list()
        if combobox_list:
            # Check list has proper role
            list_role = combobox_list.get_attribute("role")
            assert list_role == "listbox", "Combobox list should have role='listbox'"

        # Test combobox options accessibility
        options = self.find_combobox_options()
        for option in options[:3]:  # Test first 3 options
            # Check options have proper role
            option_role = option.get_attribute("role")
            assert option_role == "option", "Combobox options should have role='option'"

            # Check options are keyboard accessible
            try:
                option.send_keys(Keys.ENTER)
                time.sleep(0.05)
            except:
                # Fallback to click for div elements
                option.click()
                time.sleep(0.05)

        # Test clear button accessibility
        # Use JavaScript to clear and trigger React events properly
        self.driver.execute_script("arguments[0].value = ''; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", input_element)
        time.sleep(0.1)
        input_element.send_keys("Apple")
        time.sleep(0.3)

        options = self.find_combobox_options()
        if len(options) > 0:
            options[0].click()
            time.sleep(0.1)

            clear_button = self.find_combobox_clear_button()
            if clear_button:
                # Check clear button has proper ARIA attributes
                aria_label = clear_button.get_attribute("aria-label")
                assert aria_label is not None, "Clear button should have aria-label"

                role = clear_button.get_attribute("role")
                assert role == "button", "Clear button should have role='button'"

        # Test empty message accessibility
        # Use JavaScript to clear and trigger React events properly
        self.driver.execute_script("arguments[0].value = ''; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", input_element)
        time.sleep(0.1)
        input_element.send_keys("XYZ")
        time.sleep(0.3)

        empty_message = self.find_combobox_empty()
        if empty_message:
            empty_text = empty_message.text
            assert len(empty_text) > 0, "Empty message should have accessible text"

        # Test keyboard navigation through inputs
        first_input = self.find_combobox_input("combobox-basic-input")
        first_input.send_keys(Keys.TAB)
        time.sleep(0.1)

        # Check that focus moved
        active_element = self.driver.switch_to.active_element
        assert active_element is not None, "Should have focused element after tab"

        # Test that all inputs have accessible names
        for input_id, description in input_configs:
            input_element = self.find_combobox_input(input_id)

            # Check for accessible placeholder or label
            placeholder = input_element.get_attribute("placeholder")
            assert placeholder is not None, f"{input_id} should have placeholder for accessibility"

        print("✅ Combobox accessibility test passed")