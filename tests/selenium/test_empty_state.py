"""
Empty State component tests for React UI Forge.
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


class TestEmptyState:
    """Test Empty State component functionality and accessibility."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup test environment."""
        self.driver = driver
        self.base_url = base_url
        # Navigate to data-display page where EmptyState components are located
        data_display_url = self.base_url.replace('/test-interactive', '/data-display')
        self.driver.get(data_display_url)

    def find_empty_state(self, test_id):
        """Find an empty state component by test ID."""
        try:
            return WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, f"//*[@data-testid='{test_id}']"))
            )
        except TimeoutException:
            raise NoSuchElementException(f"Empty state with test-id '{test_id}' not found")

    def test_empty_state_no_data_functionality(self):
        """Test 1: Empty State No Data basic functionality."""
        print("Test 1: Testing Empty State No Data functionality...")

        empty_state = self.find_empty_state("empty-state-no-data")
        assert empty_state.is_displayed(), "Empty state should be visible"

        # Check that title is present
        title = empty_state.find_element(By.TAG_NAME, "h3")
        assert "No Data Found" in title.text, "Empty state should have correct title"

        # Check that description is present
        description = empty_state.find_element(By.TAG_NAME, "p")
        assert description.is_displayed(), "Empty state should have description"
        assert len(description.text) > 0, "Description should not be empty"

        # Check that action buttons are present
        buttons = empty_state.find_elements(By.TAG_NAME, "button")
        assert len(buttons) == 2, "Empty state should have 2 action buttons"

        # Test primary action button
        primary_button = buttons[0]
        assert "Add First Item" in primary_button.text, "Primary button should have correct text"
        primary_button.click()
        time.sleep(0.2)  # Wait for potential action

        # Test secondary action button
        secondary_button = buttons[1]
        assert "Learn More" in secondary_button.text, "Secondary button should have correct text"
        secondary_button.click()
        time.sleep(0.2)  # Wait for potential action

        print("✅ Empty State No Data functionality test passed")

    def test_empty_state_renders_normally(self):
        """Test 2: Empty State visual rendering."""
        print("Test 2: Testing Empty State visual rendering...")

        # Test no-data empty state
        empty_state = self.find_empty_state("empty-state-no-data")
        assert empty_state.is_displayed(), "Empty state should be displayed"

        # Check dimensions
        size = empty_state.size
        assert size['width'] > 0, "Empty state should have positive width"
        assert size['height'] > 0, "Empty state should have positive height"
        assert size['width'] > 200, "Empty state should have reasonable width"
        assert size['height'] > 100, "Empty state should have reasonable height"

        # Check position
        location = empty_state.location
        assert location['x'] >= 0, "Empty state should be positioned within viewport"
        assert location['y'] >= 0, "Empty state should be positioned within viewport"

        # Test search empty state
        search_state = self.find_empty_state("empty-state-search")
        assert search_state.is_displayed(), "Search empty state should be displayed"

        print("✅ Empty State visual rendering test passed")

    def test_empty_state_navigation(self):
        """Test 3: Empty State navigation and interaction."""
        print("Test 3: Testing Empty State navigation...")

        empty_state = self.find_empty_state("empty-state-no-data")

        # Find action buttons
        buttons = empty_state.find_elements(By.TAG_NAME, "button")
        assert len(buttons) >= 1, "Empty state should have at least one button"

        # Test keyboard navigation on primary button
        primary_button = buttons[0]
        assert primary_button.is_enabled(), "Primary button should be enabled"

        # Focus the button
        self.driver.execute_script("arguments[0].focus();", primary_button)
        time.sleep(0.2)

        # Try to activate with Enter
        primary_button.send_keys(Keys.ENTER)
        time.sleep(0.2)

        # Try Space key
        primary_button.send_keys(Keys.SPACE)
        time.sleep(0.2)

        # Test secondary button if available
        if len(buttons) > 1:
            secondary_button = buttons[1]
            assert secondary_button.is_enabled(), "Secondary button should be enabled"

            # Focus secondary button
            self.driver.execute_script("arguments[0].focus();", secondary_button)
            time.sleep(0.2)

            # Click with keyboard
            secondary_button.send_keys(Keys.ENTER)
            time.sleep(0.2)

        # Check for console errors
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        assert len(errors) == 0, f"Should have no console errors, but found: {errors}"

        print("✅ Empty State navigation test passed")

    def test_empty_state_no_errors(self):
        """Test 4: Empty State runtime stability."""
        print("Test 4: Testing Empty State runtime stability...")

        # Check initial console state
        initial_logs = self.driver.get_log('browser')
        initial_errors = [log for log in initial_logs if log['level'] == 'SEVERE']

        # Perform various interactions with all empty states
        test_ids = ["empty-state-no-data", "empty-state-search"]

        for test_id in test_ids:
            try:
                empty_state = self.find_empty_state(test_id)

                # Click all buttons in this empty state
                buttons = empty_state.find_elements(By.TAG_NAME, "button")
                for button in buttons:
                    button.click()
                    time.sleep(0.2)
            except NoSuchElementException:
                continue  # Skip if this empty state doesn't exist

        # Check for console errors after interactions
        final_logs = self.driver.get_log('browser')
        final_errors = [log for log in final_logs if log['level'] == 'SEVERE']

        # Assert no new errors were introduced
        assert len(final_errors) == len(initial_errors), \
            f"Should have no new console errors. Initial: {len(initial_errors)}, Final: {len(final_errors)}"

        # Test that we can still interact with the page
        current_url = self.driver.current_url
        assert current_url == self.base_url, "Should still be on the correct page after interactions"

        print("✅ Empty State runtime stability test passed")

    def test_empty_state_accessibility(self):
        """Additional test: Empty State accessibility features."""
        print("Testing Empty State accessibility...")

        # Test no-data empty state
        empty_state = self.find_empty_state("empty-state-no-data")

        # Check ARIA attributes
        assert empty_state.get_attribute("role") == "status", \
            "Empty state should have role='status'"
        assert empty_state.get_attribute("aria-live") == "polite", \
            "Empty state should have aria-live='polite'"
        assert empty_state.get_attribute("aria-atomic") == "true", \
            "Empty state should have aria-atomic='true'"

        # Test search empty state
        search_state = self.find_empty_state("empty-state-search")
        assert search_state.get_attribute("role") == "status", \
            "Search empty state should have role='status'"
        assert search_state.get_attribute("aria-live") == "polite", \
            "Search empty state should have aria-live='polite'"

        # Check that icons have aria-hidden
        icons = empty_state.find_elements(By.XPATH, ".//*[@role='img']")
        for icon in icons:
            assert icon.get_attribute("aria-hidden") == "true", \
                "Decorative icons should have aria-hidden='true'"

        # Check button accessibility
        buttons = empty_state.find_elements(By.TAG_NAME, "button")
        for button in buttons:
            button_text = button.text
            assert len(button_text.strip()) > 0, \
                f"Button should have accessible text: '{button_text}'"

        print("✅ Empty State accessibility test passed")