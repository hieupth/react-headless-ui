"""
Selenium tests for Button component following CLAUDE.md testing requirements.

Each test covers:
1. Functionality - component behavior
2. Visual rendering - normal size/shape/position
3. Navigation - correct URLs, no errors
4. Runtime stability - no console errors
"""

import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestButton:
    """Test suite for Button component"""

    @pytest.fixture(autouse=True)
    def setup(self, driver, interactive_url):
        """Setup test environment"""
        self.driver = driver
        self.base_url = interactive_url
        self.driver.get(self.base_url)

        # Wait for page to load
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

    def test_button_clicks(self):
        """Test 1: Button functionality - click counter increments"""
        # Find the main button
        button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Clicked')]")

        # Get initial click count from display element
        try:
            count_display = self.driver.find_element(By.XPATH, "//p[contains(text(), 'Click Count:')]")
            initial_text = count_display.text
            initial_count = int(initial_text.split(':')[1].strip())
        except:
            initial_count = 0

        # Click button 3 times
        for i in range(3):
            button.click()
            time.sleep(0.1)  # Small delay for state update

        # Verify count increased
        count_display = self.driver.find_element(By.XPATH, "//p[contains(text(), 'Click Count:')]")
        current_text = count_display.text
        current_count = int(current_text.split(':')[1].strip())
        assert current_count == initial_count + 3

    def test_button_renders_normally(self):
        """Test 2: Button visual rendering - normal size and shape"""
        button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Clicked')]")

        # Check button is displayed
        assert button.is_displayed(), "Button should be visible"

        # Check button has reasonable dimensions
        assert button.size['width'] > 0, "Button width should be greater than 0"
        assert button.size['height'] > 0, "Button height should be greater than 0"
        assert button.size['height'] < 200, "Button height should be reasonable"
        assert button.size['width'] < 500, "Button width should be reasonable"

        # Check button has proper styling classes
        class_names = button.get_attribute("class")
        assert "button" in class_names, "Button should have button class"

    def test_button_navigation(self):
        """Test 3: Button navigation - no URL changes or console errors"""
        button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Clicked')]")
        initial_url = self.driver.current_url

        # Click button
        button.click()

        # Verify URL hasn't changed (buttons shouldn't navigate)
        assert self.driver.current_url == initial_url, "Button click should not change URL"

        # Check for browser console errors (ignore network errors in dev)
        logs = self.driver.get_log('browser')
        # Filter out network errors which are common in development
        errors = [log for log in logs if log['level'] == 'SEVERE' and 'Failed to load resource' not in log['message']]
        assert len(errors) == 0, f"Console errors found: {errors}"

    def test_button_no_errors(self):
        """Test 4: Button runtime stability - no JavaScript errors"""
        # Check initial console logs
        initial_logs = self.driver.get_log('browser')
        # Filter out network errors which are common in development
        initial_errors = [log for log in initial_logs if log['level'] == 'SEVERE' and 'Failed to load resource' not in log['message']]
        assert len(initial_errors) == 0, f"Initial console errors: {initial_errors}"

        # Interact with multiple buttons
        buttons = self.driver.find_elements(By.TAG_NAME, "button")

        for button in buttons[:3]:  # Test first 3 buttons
            if button.is_displayed() and button.is_enabled():
                button.click()
                time.sleep(0.1)

        # Check for errors after interactions
        final_logs = self.driver.get_log('browser')
        # Filter out network errors which are common in development
        final_errors = [log for log in final_logs if log['level'] == 'SEVERE' and 'Failed to load resource' not in log['message']]
        assert len(final_errors) == 0, f"Console errors after interactions: {final_errors}"

    def test_button_keyboard_navigation(self):
        """Test 5: Button keyboard navigation - Tab and Enter keys work"""
        # Find first button
        button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Clicked')]")

        # Click on button to ensure it's focused, then test keyboard interaction
        button.click()
        time.sleep(0.1)

        # Get initial count from display
        try:
            count_display = self.driver.find_element(By.XPATH, "//p[contains(text(), 'Click Count:')]")
            initial_text = count_display.text
            initial_count = int(initial_text.split(':')[1].strip())
        except:
            initial_count = 0

        # Use Space key to trigger button click (more reliable than Enter for buttons)
        button.send_keys(Keys.SPACE)
        time.sleep(0.1)

        # Verify button was clicked - get current count from display
        count_display = self.driver.find_element(By.XPATH, "//p[contains(text(), 'Click Count:')]")
        current_text = count_display.text
        current_count = int(current_text.split(':')[1].strip())
        assert current_count > initial_count, "Space key should trigger button click"

        # Test Enter key as well
        button.send_keys(Keys.ENTER)
        time.sleep(0.1)

        # Verify button was clicked again
        count_display = self.driver.find_element(By.XPATH, "//p[contains(text(), 'Click Count:')]")
        final_text = count_display.text
        final_count = int(final_text.split(':')[1].strip())
        assert final_count > current_count, "Enter key should trigger button click"

    def test_button_accessibility(self):
        """Test 6: Button accessibility - proper ARIA attributes"""
        buttons = self.driver.find_elements(By.TAG_NAME, "button")

        for button in buttons:
            if button.is_displayed():
                # Check for proper role (tab buttons have role="tab", switches have role="switch" which are valid)
                role = button.get_attribute("role")
                assert role in [None, "button", "tab", "switch", "radio"], f"Button should have button, tab, switch, or radio role, got: {role}"

                # Check disabled buttons have proper attributes
                if not button.is_enabled():
                    # Check for either native disabled attribute or aria-disabled
                    has_disabled = button.get_attribute("disabled") is not None
                    aria_disabled = button.get_attribute("aria-disabled")
                    assert has_disabled or aria_disabled == "true", "Disabled button should have disabled attribute or aria-disabled='true'"

    def test_button_variants(self):
        """Test 7: Button variants - different styles work correctly"""
        # Test variant buttons
        variant_buttons = self.driver.find_elements(By.XPATH, "//button[contains(@class, 'button-secondary')]")

        for button in variant_buttons:
            if button.is_displayed():
                # Check button has variant class
                class_names = button.get_attribute("class")
                assert "button-secondary" in class_names, "Button should have variant class"

                # Check button has reasonable dimensions
                assert button.size['width'] > 0, "Variant button should have width"
                assert button.size['height'] > 0, "Variant button should have height"

    def test_button_reset_functionality(self):
        """Test 8: Button reset functionality - reset counter works"""
        # Click main button a few times
        button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Clicked')]")
        for _ in range(3):
            button.click()
            time.sleep(0.1)

        # Find reset button
        reset_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Reset Counter')]")
        reset_button.click()
        time.sleep(0.1)

        # Verify counter was reset - check from display element
        count_display = self.driver.find_element(By.XPATH, "//p[contains(text(), 'Click Count:')]")
        current_text = count_display.text
        current_count = int(current_text.split(':')[1].strip())
        assert current_count == 0, "Counter should be reset to 0"

    def test_button_disabled_state(self):
        """Test 9: Button disabled state - disabled buttons don't trigger actions"""
        # Find disabled button
        disabled_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Disabled Button')]")

        # Verify button is disabled
        assert not disabled_button.is_enabled(), "Button should be disabled"

        # Try to click disabled button
        initial_text = disabled_button.text
        disabled_button.click()
        time.sleep(0.1)

        # Verify button state didn't change
        current_text = disabled_button.text
        assert initial_text == current_text, "Disabled button should not change state"

    def test_button_loading_state(self):
        """Test 10: Button loading state - loading buttons show correct state"""
        # Find loading button
        loading_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Loading')]")

        # Check loading button has loading class
        class_names = loading_button.get_attribute("class")
        assert "button-loading" in class_names, "Loading button should have loading class"

        # Check loading button has loading attribute
        data_loading = loading_button.get_attribute("data-loading")
        assert data_loading == "true", "Loading button should have data-loading='true'"

        # Verify button is still clickable but shows loading state
        assert loading_button.is_displayed(), "Loading button should be visible"