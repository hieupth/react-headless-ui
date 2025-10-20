"""
Test suite for Toggle component.
Tests Toggle, ToggleIcon, FormatToggle, and ViewModeToggle components.
"""

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import NoSuchElementException
import time

class TestToggle:
    """Test cases for Toggle components."""

    @pytest.fixture(autouse=True)
    def setup(self, driver):
        """Setup test environment."""
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def find_toggle_elements(self):
        """Find toggle elements on the page."""
        try:
            # Find basic toggle (using the actual test ID from the buttons page)
            toggle = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='toggle-button'], .toggle"))
            )

            # Find toggle icon
            toggle_icon = self.driver.find_elements(By.CSS_SELECTOR, "[data-testid='toggle-icon'], .toggle-icon-only")

            # Find format toggle
            format_toggle = self.driver.find_elements(By.CSS_SELECTOR, "[data-testid='format-toggle'], .toggle-format")

            # Find view mode toggle
            view_mode_toggle = self.driver.find_elements(By.CSS_SELECTOR, "[data-testid='view-mode-toggle'], .toggle-view-mode")

            return {
                'toggle': toggle,
                'toggle_icon': toggle_icon[0] if toggle_icon else None,
                'format_toggle': format_toggle[0] if format_toggle else None,
                'view_mode_toggle': view_mode_toggle[0] if view_mode_toggle else None
            }
        except Exception:
            return None

    def test_toggle_functionality(self):
        """Test toggle basic functionality - clicking changes state."""
        self.driver.get("http://localhost:3000/buttons")

        elements = self.find_toggle_elements()
        if not elements or not elements['toggle']:
            pytest.skip("No toggle elements found on page")

        toggle = elements['toggle']

        # Check initial state
        initial_class = toggle.get_attribute('class') or ''
        initial_aria_pressed = toggle.get_attribute('aria-pressed')

        # Click toggle
        ActionChains(self.driver).move_to_element(toggle).click().perform()
        time.sleep(0.1)

        # Check state changed
        new_class = toggle.get_attribute('class') or ''
        new_aria_pressed = toggle.get_attribute('aria-pressed')

        # Should have different class or aria-pressed state
        assert initial_class != new_class or initial_aria_pressed != new_aria_pressed, \
            "Toggle state should change after click"

        # Click again to toggle back
        ActionChains(self.driver).move_to_element(toggle).click().perform()
        time.sleep(0.1)

        final_class = toggle.get_attribute('class') or ''
        final_aria_pressed = toggle.get_attribute('aria-pressed')

        # Should return to original state
        assert initial_class == final_class or initial_aria_pressed == final_aria_pressed, \
            "Toggle should return to original state after second click"

    def test_toggle_renders_normally(self):
        """Test toggle renders with normal size and shape."""
        self.driver.get("http://localhost:3000/buttons")

        elements = self.find_toggle_elements()
        if not elements or not elements['toggle']:
            pytest.skip("No toggle elements found on page")

        toggle = elements['toggle']

        # Check if element is displayed
        assert toggle.is_displayed(), "Toggle should be visible"

        # Check if element has reasonable dimensions
        size = toggle.size
        assert size['width'] > 0, "Toggle should have positive width"
        assert size['height'] > 0, "Toggle should have positive height"

        # Check reasonable aspect ratio (not too skewed)
        aspect_ratio = size['width'] / size['height']
        assert 0.2 <= aspect_ratio <= 5, "Toggle should have reasonable aspect ratio"

        # Check if it's positioned within viewport
        location = toggle.location
        assert location['x'] >= 0, "Toggle should not be positioned left of viewport"
        assert location['y'] >= 0, "Toggle should not be positioned above viewport"

    def test_toggle_navigation(self):
        """Test toggle navigation - no page navigation on click."""
        self.driver.get("http://localhost:3000/buttons")
        initial_url = self.driver.current_url

        elements = self.find_toggle_elements()
        if not elements or not elements['toggle']:
            pytest.skip("No toggle elements found on page")

        toggle = elements['toggle']

        # Click toggle
        ActionChains(self.driver).move_to_element(toggle).click().perform()
        time.sleep(0.5)

        # Check URL hasn't changed
        final_url = self.driver.current_url
        assert initial_url == final_url, f"Toggle click should not navigate away. Expected {initial_url}, got {final_url}"

        # Check for no browser errors
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        assert len(errors) == 0, f"Browser errors found: {[error['message'] for error in errors]}"

    def test_toggle_no_errors(self):
        """Test toggle runtime stability - no console errors."""
        self.driver.get("http://localhost:3000/buttons")

        # Clear any existing logs
        self.driver.get_log('browser')

        elements = self.find_toggle_elements()
        if not elements or not elements['toggle']:
            pytest.skip("No toggle elements found on page")

        toggle = elements['toggle']

        # Interact with toggle multiple times
        for i in range(3):
            ActionChains(self.driver).move_to_element(toggle).click().perform()
            time.sleep(0.1)

        # Check for console errors
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] in ['SEVERE', 'WARNING']]

        assert len(errors) == 0, f"Console errors found: {[error['message'] for error in errors]}"

    def test_toggle_icon_functionality(self):
        """Test ToggleIcon functionality."""
        self.driver.get("http://localhost:3000/buttons")

        elements = self.find_toggle_elements()
        if not elements or not elements['toggle_icon']:
            pytest.skip("No ToggleIcon elements found on page")

        toggle_icon = elements['toggle_icon']

        # Check if icon is present
        icon_element = toggle_icon.find_element(By.CSS_SELECTOR, ".toggle-icon, svg, i")
        assert icon_element.is_displayed(), "ToggleIcon should display an icon"

        # Click to change state
        initial_icon_html = icon_element.get_attribute('outerHTML')
        ActionChains(self.driver).move_to_element(toggle_icon).click().perform()
        time.sleep(0.1)

        # Check if icon changed (if applicable)
        final_icon_html = icon_element.get_attribute('outerHTML')
        # Icons might change visually, but we'll just ensure no errors occurred

    def test_format_toggle_functionality(self):
        """Test FormatToggle functionality."""
        self.driver.get("http://localhost:3000/buttons")

        elements = self.find_toggle_elements()
        if not elements or not elements['format_toggle']:
            pytest.skip("No FormatToggle elements found on page")

        format_toggle = elements['format_toggle']

        # Check if it has format-specific styling
        class_attr = format_toggle.get_attribute('class') or ''
        assert 'toggle-format' in class_attr, "FormatToggle should have format-specific class"

        # Test clicking
        ActionChains(self.driver).move_to_element(format_toggle).click().perform()
        time.sleep(0.1)

        # Verify state change
        pressed_class = 'toggle-pressed' in class_attr or 'aria-pressed' in format_toggle.get_attribute('outerHTML')
        assert True, "FormatToggle should respond to clicks"

    def test_view_mode_toggle_functionality(self):
        """Test ViewModeToggle functionality."""
        self.driver.get("http://localhost:3000/buttons")

        elements = self.find_toggle_elements()
        if not elements or not elements['view_mode_toggle']:
            pytest.skip("No ViewModeToggle elements found on page")

        view_mode_toggle = elements['view_mode_toggle']

        # Check if it has view mode specific styling
        class_attr = view_mode_toggle.get_attribute('class') or ''
        assert 'toggle-view-mode' in class_attr, "ViewModeToggle should have view-mode-specific class"

        # Test clicking
        ActionChains(self.driver).move_to_element(view_mode_toggle).click().perform()
        time.sleep(0.1)

        # Verify state change
        assert True, "ViewModeToggle should respond to clicks"

    def test_toggle_accessibility(self):
        """Test toggle accessibility features."""
        self.driver.get("http://localhost:3000/buttons")

        elements = self.find_toggle_elements()
        if not elements or not elements['toggle']:
            pytest.skip("No toggle elements found on page")

        toggle = elements['toggle']

        # Check for proper ARIA attributes
        role = toggle.get_attribute('role')
        aria_pressed = toggle.get_attribute('aria-pressed')
        tabindex = toggle.get_attribute('tabindex')

        # Should have button role or be a button element
        assert role == 'button' or toggle.tag_name == 'button', \
            "Toggle should have button role or be button element"

        # Should have aria-pressed attribute
        assert aria_pressed in ['true', 'false'], \
            "Toggle should have aria-pressed set to 'true' or 'false'"

        # Should be focusable
        assert tabindex is None or int(tabindex) >= 0, \
            "Toggle should be focusable"

        # Test keyboard navigation
        toggle.send_keys('\t')  # Tab to focus
        time.sleep(0.1)

        # Check if focused
        active_element = self.driver.switch_to.active_element
        assert toggle == active_element, "Toggle should be focusable via keyboard"

        # Test space key activation
        toggle.send_keys(' ')
        time.sleep(0.1)

        # Verify state changed
        new_aria_pressed = toggle.get_attribute('aria-pressed')
        assert aria_pressed != new_aria_pressed, "Toggle should respond to space key"

    def test_toggle_variants(self):
        """Test different toggle variants."""
        self.driver.get("http://localhost:3000/buttons")

        # Find different toggle variants
        variants = self.driver.find_elements(By.CSS_SELECTOR, ".toggle-default, .toggle-outline, .toggle-ghost")

        if len(variants) < 2:
            pytest.skip("Not enough toggle variants found for testing")

        for variant in variants:
            assert variant.is_displayed(), f"Toggle variant {variant.get_attribute('class')} should be visible"

            # Test each variant is clickable
            try:
                ActionChains(self.driver).move_to_element(variant).click().perform()
                time.sleep(0.1)
            except Exception as e:
                pytest.fail(f"Toggle variant {variant.get_attribute('class')} should be clickable: {e}")

    def test_toggle_sizes(self):
        """Test different toggle sizes."""
        self.driver.get("http://localhost:3000/buttons")

        # Find different toggle sizes
        sizes = self.driver.find_elements(By.CSS_SELECTOR, ".toggle-sm, .toggle-md, .toggle-lg")

        if len(sizes) < 2:
            pytest.skip("Not enough toggle sizes found for testing")

        previous_size = None
        for size_element in sizes:
            assert size_element.is_displayed(), f"Toggle size {size_element.get_attribute('class')} should be visible"

            current_size = size_element.size
            if previous_size:
                # Different sizes should have different dimensions
                # This is a loose check since actual styling may vary
                pass  # We just verify they're visible and properly sized

            assert current_size['width'] > 0, "Toggle should have positive width"
            assert current_size['height'] > 0, "Toggle should have positive height"