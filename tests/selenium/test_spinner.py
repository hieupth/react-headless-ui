"""
Spinner component tests for React UI Forge.
Tests cover functionality, visual rendering, navigation, and runtime stability.
"""

import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException


class TestSpinner:
    """Test class for Spinner component functionality."""

    @pytest.fixture(autouse=True)
    def setup(self, driver):
        """Setup test environment."""
        self.driver = driver
        self.wait = WebDriverWait(self.driver, 10)
        self.base_url = "http://localhost:3000"

    def load_page(self):
        """Load the test page."""
        self.driver.get(self.base_url)

        # Wait for page to load
        self.wait.until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

        # Scroll to Spinner components section
        try:
            spinner_section = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//h2[contains(text(), 'Spinner Components')]"))
            )
            self.driver.execute_script("arguments[0].scrollIntoView(true);", spinner_section)
            time.sleep(0.5)
        except TimeoutException:
            # If section not found, page might still be loading
            pass

    def test_spinner_simple_renders(self):
        """Test that simple spinner renders correctly."""
        self.load_page()

        # Find simple spinner
        spinner = self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='spinner-simple']"))
        )

        # Check that spinner is displayed
        assert spinner.is_displayed(), "Simple spinner should be displayed"

        # Check spinner has correct styling
        assert "border-4" in spinner.get_attribute("class"), "Spinner should have border styling"
        assert "rounded-full" in spinner.get_attribute("class"), "Spinner should be rounded"
        assert "animate-spin" in spinner.get_attribute("class"), "Spinner should have animation class"

        # Check accessibility attributes
        assert spinner.get_attribute("role") == "img", "Spinner should have role='img'"
        assert spinner.get_attribute("aria-label") == "Loading", "Spinner should have aria-label"
        assert spinner.get_attribute("aria-busy") == "true", "Spinner should be marked as busy"
        assert spinner.get_attribute("tabindex") == "0", "Spinner should be focusable"

    def test_spinner_dots_renders(self):
        """Test that dots spinner renders correctly."""
        self.load_page()

        # Find dots spinner
        spinner = self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='spinner-dots']"))
        )

        # Check that spinner is displayed
        assert spinner.is_displayed(), "Dots spinner should be displayed"

        # Check that dots are present
        dots = spinner.find_elements(By.TAG_NAME, "div")
        assert len(dots) >= 3, "Dots spinner should have at least 3 dots"

        # Check that dots have correct styling
        for dot in dots[:3]:
            assert "bg-green-600" in dot.get_attribute("class"), "Dots should have green color"
            assert "rounded-full" in dot.get_attribute("class"), "Dots should be rounded"
            assert "animate-pulse" in dot.get_attribute("class"), "Dots should have pulse animation"

        # Check accessibility attributes
        assert spinner.get_attribute("role") == "img", "Dots spinner should have role='img'"
        assert spinner.get_attribute("aria-label") == "Loading", "Dots spinner should have aria-label"
        assert spinner.get_attribute("aria-busy") == "true", "Dots spinner should be marked as busy"

    def test_spinner_bars_renders(self):
        """Test that bars spinner renders correctly."""
        self.load_page()

        # Find bars spinner
        spinner = self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='spinner-bars']"))
        )

        # Check that spinner is displayed
        assert spinner.is_displayed(), "Bars spinner should be displayed"

        # Check that bars are present
        bars = spinner.find_elements(By.TAG_NAME, "div")
        assert len(bars) >= 4, "Bars spinner should have at least 4 bars"

        # Check that bars have correct styling
        for bar in bars[:4]:
            assert "bg-purple-600" in bar.get_attribute("class"), "Bars should have purple color"
            assert "animate-pulse" in bar.get_attribute("class"), "Bars should have pulse animation"

        # Check accessibility attributes
        assert spinner.get_attribute("role") == "img", "Bars spinner should have role='img'"
        assert spinner.get_attribute("aria-label") == "Loading", "Bars spinner should have aria-label"
        assert spinner.get_attribute("aria-busy") == "true", "Bars spinner should be marked as busy"

    def test_spinner_controlled_renders(self):
        """Test that controlled spinner renders correctly."""
        self.load_page()

        # Find controlled spinner
        spinner = self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='spinner-controlled']"))
        )

        # Check that spinner is displayed
        assert spinner.is_displayed(), "Controlled spinner should be displayed"

        # Check spinner has correct styling
        assert "border-4" in spinner.get_attribute("class"), "Controlled spinner should have border styling"
        assert "rounded-full" in spinner.get_attribute("class"), "Controlled spinner should be rounded"
        assert "border-orange-600" in spinner.get_attribute("class"), "Controlled spinner should be orange"

        # Check accessibility attributes
        assert spinner.get_attribute("role") == "img", "Controlled spinner should have role='img'"
        assert spinner.get_attribute("aria-label") == "Loading", "Controlled spinner should have aria-label"
        assert spinner.get_attribute("tabindex") == "0", "Controlled spinner should be focusable"

    def test_spinner_sizes_render(self):
        """Test that spinner sizes render correctly."""
        self.load_page()

        # Test different spinner sizes
        sizes = ["xs", "sm", "md", "lg", "xl"]
        expected_dimensions = {
            "xs": (16, 16),  # w-4 h-4
            "sm": (24, 24),  # w-6 h-6
            "md": (32, 32),  # w-8 h-8
            "lg": (48, 48),  # w-12 h-12
            "xl": (64, 64)   # w-16 h-16
        }

        for size in sizes:
            spinner = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, f"[data-testid='spinner-{size}']"))
            )

            assert spinner.is_displayed(), f"Spinner {size} should be displayed"

            # Check dimensions (approximately, accounting for rendering variations)
            width = spinner.size['width']
            height = spinner.size['height']
            expected_width, expected_height = expected_dimensions[size]

            assert abs(width - expected_width) <= 8, f"Spinner {size} width should be approximately {expected_width}px, got {width}px"
            assert abs(height - expected_height) <= 8, f"Spinner {size} height should be approximately {expected_height}px, got {height}px"

            # Check that spinner has animation
            assert "animate-spin" in spinner.get_attribute("class"), f"Spinner {size} should have animation"

    def test_spinner_with_labels_render(self):
        """Test that spinners with labels render correctly."""
        self.load_page()

        labeled_spinners = ["upload", "processing", "sync", "loading"]

        for spinner_type in labeled_spinners:
            # Find spinner container by looking for the label text
            label_mapping = {
                "upload": "Uploading Files",
                "processing": "Processing Request",
                "sync": "Syncing Data",
                "loading": "Loading Content"
            }

            # Find the spinner by test_id
            try:
                spinner = self.wait.until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, f"[data-testid='spinner-{spinner_type}']"))
                )

                assert spinner.is_displayed(), f"Labeled spinner {spinner_type} should be displayed"

                # Check accessibility attributes
                assert spinner.get_attribute("role") == "img", f"Labeled spinner {spinner_type} should have role='img'"
                assert spinner.get_attribute("aria-busy") == "true", f"Labeled spinner {spinner_type} should be marked as busy"

                # Check that label text is present in the container
                container = spinner.find_element(By.XPATH, "..")
                label_text = container.find_element(By.TAG_NAME, "span").text
                expected_label = label_mapping[spinner_type].split()[0]  # Get first word

                assert expected_label in label_text or "..." in label_text, f"Spinner {spinner_type} should have descriptive label"

            except TimeoutException:
                pytest.skip(f"Spinner {spinner_type} not found on page")

    def test_spinner_accessibility_features(self):
        """Test spinner accessibility features."""
        self.load_page()

        # Find accessible spinner
        spinner = self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='spinner-accessible']"))
        )

        # Check accessibility attributes
        assert spinner.get_attribute("role") == "img", "Accessible spinner should have role='img'"
        assert spinner.get_attribute("aria-label") == "Loading data", "Accessible spinner should have descriptive aria-label"
        assert spinner.get_attribute("aria-busy") == "true", "Accessible spinner should be marked as busy"
        assert spinner.get_attribute("tabindex") == "0", "Accessible spinner should be focusable"

        # Check that spinner has focus styling
        class_attr = spinner.get_attribute("class")
        assert "focus:ring-2" in class_attr, "Accessible spinner should have focus ring styling"

    def test_spinner_keyboard_navigation(self):
        """Test spinner keyboard navigation."""
        self.load_page()

        # Find simple spinner
        spinner = self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='spinner-simple']"))
        )

        # Focus the spinner
        spinner.click()
        time.sleep(0.1)

        # Check that spinner is focused
        assert spinner == self.driver.switch_to.active_element, "Spinner should be focusable"

        # Test space key
        initial_busy_state = spinner.get_attribute("aria-busy")
        spinner.send_keys(Keys.SPACE)
        time.sleep(0.5)  # Wait for state change

        # Check that state changed (from busy to not busy or vice versa)
        new_busy_state = spinner.get_attribute("aria-busy")
        assert new_busy_state != initial_busy_state, "Space key should toggle spinner state"

        # Test enter key
        spinner.send_keys(Keys.ENTER)
        time.sleep(0.5)

        # Check that state changed again
        final_busy_state = spinner.get_attribute("aria-busy")
        assert final_busy_state != new_busy_state, "Enter key should toggle spinner state"

    def test_spinner_toggle_buttons(self):
        """Test spinner toggle functionality via buttons."""
        self.load_page()

        # Find simple spinner and its toggle button
        spinner = self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='spinner-simple']"))
        )

        # Find the toggle button (it should be in the same container)
        container = spinner.find_element(By.XPATH, "../../../..")  # Go up to the grid cell
        toggle_button = container.find_element(By.TAG_NAME, "button")

        # Get initial state
        initial_busy_state = spinner.get_attribute("aria-busy")
        initial_animation = "animate-spin" in spinner.get_attribute("class")

        # Click toggle button
        toggle_button.click()
        time.sleep(0.5)

        # Check that state changed
        new_busy_state = spinner.get_attribute("aria-busy")
        new_animation = "animate-spin" in spinner.get_attribute("class")

        assert new_busy_state != initial_busy_state, "Toggle button should change aria-busy state"
        assert new_animation != initial_animation, "Toggle button should change animation class"

        # Check button text updated
        if initial_busy_state == "true":
            assert "Start" in toggle_button.text, "Button should show 'Start' when spinner is stopped"
        else:
            assert "Stop" in toggle_button.text, "Button should show 'Stop' when spinner is running"

    def test_spinner_visual_appearance(self):
        """Test spinner visual appearance and styling."""
        self.load_page()

        # Test simple spinner appearance
        spinner = self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='spinner-simple']"))
        )

        # Check that spinner has proper dimensions
        assert spinner.size['width'] > 0, "Spinner should have positive width"
        assert spinner.size['height'] > 0, "Spinner should have positive height"
        assert spinner.size['width'] == spinner.size['height'], "Spinner should be square (circular)"

        # Check that spinner is visible
        assert spinner.is_displayed(), "Spinner should be visible"

        # Test dots spinner appearance
        dots_spinner = self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='spinner-dots']"))
        )

        # Check that dots are visible and properly sized
        dots = dots_spinner.find_elements(By.TAG_NAME, "div")
        for dot in dots[:3]:
            assert dot.is_displayed(), "Each dot should be visible"
            assert dot.size['width'] > 0, "Each dot should have positive width"
            assert dot.size['height'] > 0, "Each dot should have positive height"
            assert dot.size['width'] == dot.size['height'], "Each dot should be square (circular)"

    def test_spinner_runtime_stability(self):
        """Test spinner runtime stability with no errors."""
        self.load_page()

        # Check for browser console errors
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']

        assert len(errors) == 0, f"Browser console should have no severe errors, found: {errors}"

        # Test multiple spinner interactions
        spinners_to_test = ["simple", "dots", "bars", "controlled"]

        for spinner_name in spinners_to_test:
            try:
                spinner = self.wait.until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, f"[data-testid='spinner-{spinner_name}']"))
                )

                # Focus and interact with spinner
                spinner.click()
                time.sleep(0.1)

                # Send keyboard events
                spinner.send_keys(Keys.SPACE)
                time.sleep(0.2)
                spinner.send_keys(Keys.ENTER)
                time.sleep(0.2)

                # Remove focus
                spinner.send_keys(Keys.TAB)
                time.sleep(0.1)

            except TimeoutException:
                # Skip if spinner not found
                continue

        # Check for errors after interactions
        final_logs = self.driver.get_log('browser')
        final_errors = [log for log in final_logs if log['level'] == 'SEVERE']

        assert len(final_errors) == 0, f"No browser errors should occur after spinner interactions, found: {final_errors}"

    def test_spinner_navigation(self):
        """Test spinner navigation doesn't cause issues."""
        self.load_page()

        # Find a spinner
        spinner = self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='spinner-simple']"))
        )

        # Click on spinner to potentially trigger navigation
        spinner.click()
        time.sleep(0.5)

        # Check that we're still on the same page
        current_url = self.driver.current_url
        assert self.base_url in current_url, f"Should stay on test page after spinner click, was at {current_url}"

        # Check that page title is correct
        assert "React UI Forge Test" in self.driver.title, "Page title should be correct after spinner interaction"

        # Check no JavaScript errors occurred
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        assert len(errors) == 0, f"No JavaScript errors should occur, found: {errors}"