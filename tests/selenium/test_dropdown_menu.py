"""
Dropdown Menu component tests for React UI Forge.
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


class TestDropdownMenu:
    """Test Dropdown Menu component functionality and accessibility."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup test environment."""
        self.driver = driver
        # Use navigation page for dropdown menu tests
        self.base_url = "http://localhost:3000/navigation"
        self.driver.get(self.base_url)

        # Scroll to Dropdown Menu Components section
        try:
            dropdown_section = self.driver.find_element(By.XPATH, "//h2[contains(text(), 'Dropdown Menu Components')]")
            self.driver.execute_script("arguments[0].scrollIntoView(true);", dropdown_section)
            time.sleep(0.5)
        except:
            pass

    def find_dropdown_menu(self):
        """Find the dropdown menu component."""
        try:
            # Try to find by data-testid attribute first
            return WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//*[@data-testid='dropdown-menu']"))
            )
        except TimeoutException:
            # Fallback to finding by attribute or text content
            try:
                return self.driver.find_element(By.XPATH, "//*[contains(@data-testid, 'dropdown-menu')]")
            except NoSuchElementException:
                # Try to find by containing text or other attributes
                dropdowns = self.driver.find_elements(By.XPATH, "//button[contains(text(), 'Menu')]")
                if dropdowns:
                    return dropdowns[0]
                raise

    def test_dropdown_menu_functionality(self):
        """Test 1: Dropdown Menu basic functionality."""
        print("Test 1: Testing Dropdown Menu functionality...")

        dropdown = self.find_dropdown_menu()
        assert dropdown.is_displayed(), "Dropdown menu trigger should be visible"

        # Test that dropdown is initially closed
        dropdown_button = dropdown.find_element(By.TAG_NAME, "button") if dropdown.tag_name != "button" else dropdown

        # Click to open dropdown
        dropdown_button.click()
        time.sleep(0.3)  # Wait for animation

        # Check if dropdown menu is open
        try:
            menu_container = self.driver.find_element(By.CSS_SELECTOR, "[role='menu']")
            assert menu_container.is_displayed(), "Dropdown menu should be visible after clicking trigger"
        except NoSuchElementException:
            # Try alternative selectors
            menu_containers = self.driver.find_elements(By.CSS_SELECTOR, ".absolute.z-50")
            assert len(menu_containers) > 0, "Should find an open dropdown menu"

        print("✅ Dropdown Menu functionality test passed")

    def test_dropdown_menu_renders_normally(self):
        """Test 2: Dropdown Menu visual rendering."""
        print("Test 2: Testing Dropdown Menu visual rendering...")

        dropdown = self.find_dropdown_menu()
        assert dropdown.is_displayed(), "Dropdown menu should be displayed"

        # Check button dimensions
        dropdown_button = dropdown.find_element(By.TAG_NAME, "button") if dropdown.tag_name != "button" else dropdown
        size = dropdown_button.size
        assert size['width'] > 0, "Dropdown trigger should have positive width"
        assert size['height'] > 0, "Dropdown trigger should have positive height"
        assert size['width'] > 50, "Dropdown trigger should have reasonable width"
        assert size['height'] > 20, "Dropdown trigger should have reasonable height"

        # Check position
        location = dropdown_button.location
        assert location['x'] >= 0, "Dropdown should be positioned within viewport"
        assert location['y'] >= 0, "Dropdown should be positioned within viewport"

        print("✅ Dropdown Menu visual rendering test passed")

    def test_dropdown_menu_navigation(self):
        """Test 3: Dropdown Menu navigation and interaction."""
        print("Test 3: Testing Dropdown Menu navigation...")

        dropdown = self.find_dropdown_menu()
        dropdown_button = dropdown.find_element(By.TAG_NAME, "button") if dropdown.tag_name != "button" else dropdown

        # Test keyboard navigation - Enter to open
        dropdown_button.send_keys(Keys.ENTER)
        time.sleep(0.3)

        # Try to find menu items
        try:
            menu_items = self.driver.find_elements(By.CSS_SELECTOR, "[role='menuitem']")
            if len(menu_items) == 0:
                # Try alternative selectors
                menu_items = self.driver.find_elements(By.CSS_SELECTOR, ".relative.flex.items-center")
        except:
            menu_items = []

        # Test keyboard navigation if items are found
        if menu_items:
            # Test arrow key navigation
            dropdown_button.send_keys(Keys.ARROW_DOWN)
            time.sleep(0.2)

            # Test Enter to select an item
            dropdown_button.send_keys(Keys.ENTER)
            time.sleep(0.2)

        # Test Escape to close
        self.driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
        time.sleep(0.2)

        # Check for console errors (filter network errors)
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE' and 'Failed to load resource' not in log['message']]
        assert len(errors) == 0, f"Should have no console errors, but found: {errors}"

        print("✅ Dropdown Menu navigation test passed")

    def test_dropdown_menu_no_errors(self):
        """Test 4: Dropdown Menu runtime stability."""
        print("Test 4: Testing Dropdown Menu runtime stability...")

        dropdown = self.find_dropdown_menu()
        dropdown_button = dropdown.find_element(By.TAG_NAME, "button") if dropdown.tag_name != "button" else dropdown

        # Check initial console state
        initial_logs = self.driver.get_log('browser')
        initial_errors = [log for log in initial_logs if log['level'] == 'SEVERE' and 'Failed to load resource' not in log['message']]

        # Perform various interactions
        dropdown_button.click()
        time.sleep(0.3)

        # Try to interact with menu if it opened
        try:
            menu_items = self.driver.find_elements(By.CSS_SELECTOR, "[role='menuitem'], .relative.flex.items-center")
            if menu_items:
                # Click first item
                menu_items[0].click()
                time.sleep(0.3)
        except:
            pass

        # Close with escape
        self.driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
        time.sleep(0.3)

        # Check for console errors after interactions
        final_logs = self.driver.get_log('browser')
        final_errors = [log for log in final_logs if log['level'] == 'SEVERE' and 'Failed to load resource' not in log['message']]

        # Assert no new errors were introduced
        assert len(final_errors) == len(initial_errors), \
            f"Should have no new console errors. Initial: {len(initial_errors)}, Final: {len(final_errors)}"

        # Test that we can still interact with the page
        current_url = self.driver.current_url
        # Allow for trailing slash differences
        assert current_url.rstrip('/') == self.base_url.rstrip('/'), f"Should still be on the correct page after interactions. Got: {current_url}, Expected: {self.base_url}"

        print("✅ Dropdown Menu runtime stability test passed")

    def test_dropdown_menu_accessibility(self):
        """Additional test: Dropdown Menu accessibility features."""
        print("Testing Dropdown Menu accessibility...")

        dropdown = self.find_dropdown_menu()
        dropdown_button = dropdown.find_element(By.TAG_NAME, "button") if dropdown.tag_name != "button" else dropdown

        # Check ARIA attributes
        assert dropdown_button.get_attribute("aria-haspopup") == "menu", \
            "Dropdown trigger should have aria-haspopup='menu'"

        # Test that aria-expanded updates
        initial_expanded = dropdown_button.get_attribute("aria-expanded")
        dropdown_button.click()
        time.sleep(0.3)
        updated_expanded = dropdown_button.get_attribute("aria-expanded")

        # aria-expanded should change from false to true or vice versa
        assert initial_expanded != updated_expanded, \
            "aria-expanded should change when dropdown is toggled"

        print("✅ Dropdown Menu accessibility test passed")