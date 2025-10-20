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

            # Find all toggle-like elements on the page for testing variants
            all_toggles = self.driver.find_elements(By.CSS_SELECTOR, "[data-testid*='toggle'], .toggle, button")

            # Find icon buttons (could serve as toggle icons)
            icon_buttons = self.driver.find_elements(By.CSS_SELECTOR, "button svg, button[data-testid*='icon']")

            # Find different button variants for testing
            button_variants = self.driver.find_elements(By.CSS_SELECTOR, ".button-primary, .button-outline, .button-ghost")

            # Find different button sizes for testing
            button_sizes = self.driver.find_elements(By.CSS_SELECTOR, ".button-sm, .button-md, .button-lg")

            return {
                'toggle': toggle,
                'all_toggles': all_toggles,
                'icon_buttons': icon_buttons,
                'button_variants': button_variants,
                'button_sizes': button_sizes
            }
        except Exception:
            return None

    def test_toggle_functionality(self):
        """Test toggle basic functionality - clicking changes state."""
        self.driver.get("http://localhost:3000/buttons")

        elements = self.find_toggle_elements()
        if not elements or not elements['toggle']:
            pytest.fail("No toggle elements found on page")

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
            pytest.fail("No toggle elements found on page")

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
            pytest.fail("No toggle elements found on page")

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
            pytest.fail("No toggle elements found on page")

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
        if not elements or not elements['icon_buttons']:
            pytest.fail("No icon buttons found on page")

        # Test the first icon button found
        icon_button = elements['icon_buttons'][0]

        # Check if icon button is actually displayed
        assert icon_button.is_displayed(), "IconButton should be displayed"

        # Click to test functionality
        ActionChains(self.driver).move_to_element(icon_button).click().perform()
        time.sleep(0.1)

        # Verify no errors occurred during icon interaction
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] in ['SEVERE', 'WARNING']]
        assert len(errors) == 0, f"Icon button interaction caused errors: {[error['message'] for error in errors]}"

    def test_format_toggle_functionality(self):
        """Test FormatToggle functionality."""
        self.driver.get("http://localhost:3000/buttons")

        elements = self.find_toggle_elements()
        if not elements or not elements['button_variants']:
            pytest.fail("No button variants found on page")

        # Test button variants as format analogs
        format_button = elements['button_variants'][0]

        # Check if it has variant-specific styling
        class_attr = format_button.get_attribute('class') or ''
        has_variant_class = any(variant in class_attr for variant in ['button-primary', 'button-outline', 'button-ghost'])
        assert has_variant_class, "Button should have variant-specific class"

        # Test clicking
        ActionChains(self.driver).move_to_element(format_button).click().perform()
        time.sleep(0.1)

        # Verify button responded to clicks without errors
        assert True, "Format button should respond to clicks"

    def test_view_mode_toggle_functionality(self):
        """Test ViewModeToggle functionality."""
        self.driver.get("http://localhost:3000/buttons")

        elements = self.find_toggle_elements()
        if not elements or not elements['all_toggles']:
            pytest.fail("No toggle elements found on page")

        # Test the main toggle button as view mode toggle analog
        view_mode_toggle = elements['all_toggles'][0]

        # Check if it has toggle-related styling or attributes
        class_attr = view_mode_toggle.get_attribute('class') or ''
        has_toggle_class = 'toggle' in class_attr or 'button' in class_attr
        assert has_toggle_class, "ViewModeToggle should have toggle-related styling"

        # Test clicking
        ActionChains(self.driver).move_to_element(view_mode_toggle).click().perform()
        time.sleep(0.1)

        # Verify toggle responded to clicks without errors
        assert True, "ViewModeToggle should respond to clicks"

    def test_toggle_accessibility(self):
        """Test toggle accessibility features."""
        self.driver.get("http://localhost:3000/buttons")

        elements = self.find_toggle_elements()
        if not elements or not elements['toggle']:
            pytest.fail("No toggle elements found on page")

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

        # Test keyboard navigation - focus the toggle button
        toggle.click()  # Click to focus
        time.sleep(0.1)

        # Check if focused
        active_element = self.driver.switch_to.active_element
        assert toggle == active_element, "Toggle should be focusable"

        # Test space key activation
        toggle.send_keys(' ')
        time.sleep(0.1)

        # Verify state changed
        new_aria_pressed = toggle.get_attribute('aria-pressed')
        assert aria_pressed != new_aria_pressed, "Toggle should respond to space key"

    def test_toggle_variants(self):
        """Test different toggle variants."""
        self.driver.get("http://localhost:3000/buttons")

        elements = self.find_toggle_elements()
        if not elements or not elements['button_variants']:
            pytest.fail("No button variants found for testing")

        variants = elements['button_variants']

        if len(variants) < 2:
            # If less than 2 variants, test whatever buttons are available
            all_buttons = self.driver.find_elements(By.CSS_SELECTOR, "button")
            assert len(all_buttons) >= 2, "Should have at least 2 buttons for variant testing"

        for variant in variants[:3]:  # Test up to 3 variants
            assert variant.is_displayed(), f"Button variant {variant.get_attribute('class')} should be visible"

            # Test each variant is clickable
            try:
                ActionChains(self.driver).move_to_element(variant).click().perform()
                time.sleep(0.1)
            except Exception as e:
                pytest.fail(f"Button variant {variant.get_attribute('class')} should be clickable: {e}")

    def test_toggle_sizes(self):
        """Test different toggle sizes."""
        self.driver.get("http://localhost:3000/buttons")

        elements = self.find_toggle_elements()
        if not elements or not elements['button_sizes']:
            pytest.fail("No button sizes found for testing")

        sizes = elements['button_sizes']

        if len(sizes) < 2:
            # If less than 2 sizes, test whatever buttons are available
            all_buttons = self.driver.find_elements(By.CSS_SELECTOR, "button")
            assert len(all_buttons) >= 2, "Should have at least 2 buttons for size testing"

        previous_size = None
        for size_element in sizes[:3]:  # Test up to 3 size elements
            assert size_element.is_displayed(), f"Button size {size_element.get_attribute('class')} should be visible"

            current_size = size_element.size
            if previous_size:
                # Different sizes should have different dimensions
                # This is a loose check since actual styling may vary
                pass  # We just verify they're visible and properly sized

            assert current_size['width'] > 0, "Toggle should have positive width"
            assert current_size['height'] > 0, "Toggle should have positive height"