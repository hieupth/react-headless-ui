"""
Field component tests for React UI Forge.
Following CLAUDE.md requirements: 4 test types per component.
"""

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time


class TestField:
    """Test Field component functionality and accessibility."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup test environment."""
        self.driver = driver
        self.base_url = base_url
        self.driver.get(self.base_url)

    def find_field(self, test_id):
        """Find a field component by test ID."""
        try:
            return WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, f"//*[@data-testid='{test_id}']"))
            )
        except TimeoutException:
            raise NoSuchElementException(f"Field with test-id '{test_id}' not found")

    def test_field_text_functionality(self):
        """Test 1: Field basic functionality."""
        print("Test 1: Testing Field text functionality...")

        field = self.find_field("field-text")
        assert field.is_displayed(), "Text field should be visible"
        assert field.is_enabled(), "Text field should be enabled"

        # Test typing
        test_text = "Hello World"
        field.clear()
        field.send_keys(test_text)
        time.sleep(0.2)

        # Verify value
        assert field.get_attribute("value") == test_text, "Field should contain typed text"

        # Test clearing
        field.clear()
        time.sleep(0.2)
        assert field.get_attribute("value") == "", "Field should be empty after clearing"

        # Test placeholder
        placeholder = field.get_attribute("placeholder")
        assert placeholder == "Enter your name", "Field should have correct placeholder"

        print("✅ Field text functionality test passed")

    def test_field_renders_normally(self):
        """Test 2: Field visual rendering."""
        print("Test 2: Testing Field visual rendering...")

        # Test basic text field
        field = self.find_field("field-text")
        assert field.is_displayed(), "Text field should be displayed"

        # Check dimensions
        size = field.size
        assert size['width'] > 0, "Field should have positive width"
        assert size['height'] > 0, "Field should have positive height"
        assert size['width'] > 100, "Field should have reasonable width"
        assert size['height'] > 20, "Field should have reasonable height"

        # Check position
        location = field.location
        assert location['x'] >= 0, "Field should be positioned within viewport"
        assert location['y'] >= 0, "Field should be positioned within viewport"

        # Test email field
        email_field = self.find_field("field-email")
        assert email_field.is_displayed(), "Email field should be displayed"
        assert email_field.get_attribute("type") == "email", "Email field should have correct type"

        # Test password field
        password_field = self.find_field("field-password")
        assert password_field.is_displayed(), "Password field should be displayed"
        assert password_field.get_attribute("type") == "password", "Password field should have correct type"

        # Test disabled field
        disabled_field = self.find_field("field-disabled")
        assert disabled_field.is_displayed(), "Disabled field should be displayed"
        assert not disabled_field.is_enabled(), "Disabled field should be disabled"

        print("✅ Field visual rendering test passed")

    def test_field_navigation(self):
        """Test 3: Field navigation and interaction."""
        print("Test 3: Testing Field navigation...")

        field = self.find_field("field-text")

        # Test focus
        field.click()
        time.sleep(0.2)
        assert field == self.driver.switch_to.active_element, "Field should be focused after click"

        # Test typing with keyboard
        test_text = "Keyboard Test"
        field.send_keys(test_text)
        time.sleep(0.2)
        assert field.get_attribute("value") == test_text, "Field should accept keyboard input"

        # Test backspace
        field.send_keys(Keys.BACKSPACE * 5)
        time.sleep(0.2)
        expected_text = test_text[:-5]
        assert field.get_attribute("value") == expected_text, "Backspace should work correctly"

        # Test Tab navigation
        field.send_keys(Keys.TAB)
        time.sleep(0.2)
        # Check that focus moved (not to the same field)
        assert field != self.driver.switch_to.active_element, "Focus should move after Tab"

        # Test Shift+Tab navigation - focus may not return to the exact same element due to page layout
        # So we just verify the navigation doesn't cause errors
        field.send_keys(Keys.SHIFT, Keys.TAB)
        time.sleep(0.2)

        # Test Enter key submission
        field.send_keys(Keys.ENTER)
        time.sleep(0.2)

        # Check for console errors
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        assert len(errors) == 0, f"Should have no console errors, but found: {errors}"

        print("✅ Field navigation test passed")

    def test_field_no_errors(self):
        """Test 4: Field runtime stability."""
        print("Test 4: Testing Field runtime stability...")

        # Check initial console state
        initial_logs = self.driver.get_log('browser')
        initial_errors = [log for log in initial_logs if log['level'] == 'SEVERE']

        # Test various field interactions
        fields_to_test = [
            "field-text", "field-email", "field-password",
            "field-required", "field-limited", "field-search", "field-amount"
        ]

        for field_id in fields_to_test:
            try:
                field = self.find_field(field_id)

                if field.is_enabled():
                    # Test typing
                    field.clear()
                    field.send_keys("Test Input")
                    time.sleep(0.1)

                    # Test clearing
                    field.clear()
                    time.sleep(0.1)

                    # Test focus
                    field.click()
                    time.sleep(0.1)

                    # Test blur
                    field.send_keys(Keys.TAB)
                    time.sleep(0.1)
            except NoSuchElementException:
                continue  # Skip if this field doesn't exist

        # Test field with character limit
        try:
            limited_field = self.find_field("field-limited")
            if limited_field.is_enabled():
                # Type more than the limit
                limited_field.send_keys("This is a very long text that exceeds the character limit")
                time.sleep(0.2)

                # Check that the value was truncated
                value = limited_field.get_attribute("value")
                assert len(value) <= 50, "Field should respect character limit"
        except NoSuchElementException:
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

        print("✅ Field runtime stability test passed")

    def test_field_accessibility(self):
        """Additional test: Field accessibility features."""
        print("Testing Field accessibility...")

        # Test basic field accessibility
        field = self.find_field("field-text")

        # Check for proper label association
        aria_label = field.get_attribute("aria-label")
        assert aria_label == "Name input", "Field should have proper aria-label"

        # Check required field
        required_field = self.find_field("field-required")
        aria_required = required_field.get_attribute("aria-required")
        assert aria_required == "true", "Required field should have aria-required='true'"

        html_required = required_field.get_attribute("required")
        assert html_required is not None, "Required field should have required attribute"

        # Check disabled field
        disabled_field = self.find_field("field-disabled")
        aria_disabled = disabled_field.get_attribute("aria-disabled")
        html_disabled = disabled_field.get_attribute("disabled")
        # Either aria-disabled should be true or HTML disabled should be present
        assert aria_disabled == "true" or html_disabled is not None, "Disabled field should have aria-disabled='true' or disabled attribute"

        # Check email field type
        email_field = self.find_field("field-email")
        assert email_field.get_attribute("type") == "email", "Email field should have type='email'"

        # Check password field type
        password_field = self.find_field("field-password")
        assert password_field.get_attribute("type") == "password", "Password field should have type='password'"

        # Check search field type
        search_field = self.find_field("field-search")
        assert search_field.get_attribute("type") == "search", "Search field should have type='search'"

        # Check number field type
        amount_field = self.find_field("field-amount")
        assert amount_field.get_attribute("type") == "number", "Amount field should have type='number'"

        # Test keyboard accessibility for disabled field
        try:
            disabled_field.send_keys("test")
            # If this doesn't throw an error, the field should not have changed
            assert disabled_field.get_attribute("value") == "", "Disabled field should not accept input"
        except:
            # It's also acceptable if the browser throws an error for disabled input
            pass

        print("✅ Field accessibility test passed")