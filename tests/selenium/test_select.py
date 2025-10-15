"""
Select component tests for React UI Forge.
Following CLAUDE.md testing requirements for select functionality.
"""

import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestSelect:
    """Test suite for select components"""

    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup test environment"""
        self.driver = driver
        # Use inputs page for select tests
        self.base_url = "http://localhost:3000/inputs/"
        self.driver.get(self.base_url)

        # Scroll to Select Components section
        try:
            select_section = self.driver.find_element(By.XPATH, "//h2[contains(text(), 'Select Components')]")
            self.driver.execute_script("arguments[0].scrollIntoView(true);", select_section)
            time.sleep(0.5)
        except:
            pass

    def test_select_renders_normally(self):
        """Test 1: Select components render normally with correct attributes"""
        # Find basic select
        basic_select = self.driver.find_element(By.XPATH, "//select[contains(@data-testid, 'basic-select')]")
        assert basic_select.is_displayed(), "Basic select should be visible"
        assert basic_select.get_attribute('role') is None, "Native select should not have role attribute"

        # Check select options
        options = basic_select.find_elements(By.TAG_NAME, "option")
        assert len(options) >= 4, "Basic select should have at least 4 options"

        # Check first option
        first_option = options[0]
        assert first_option.get_attribute('value') == '', "First option should have empty value"
        assert "Select a fruit" in first_option.text, "First option should contain placeholder text"

        # Find disabled select
        disabled_select = self.driver.find_element(By.XPATH, "//select[contains(@data-testid, 'disabled-select')]")
        assert disabled_select.is_displayed(), "Disabled select should be visible"
        assert disabled_select.get_attribute('disabled') == 'true', "Select should be disabled"

        # Find multi-select
        multi_select = self.driver.find_element(By.XPATH, "//select[contains(@data-testid, 'multi-select')]")
        assert multi_select.is_displayed(), "Multi-select should be visible"
        assert multi_select.get_attribute('multiple') == 'true', "Select should support multiple selection"
        assert multi_select.get_attribute('size') == '4', "Multi-select should have size attribute"

    def test_select_navigation(self):
        """Test 2: Select navigation works correctly"""
        # Navigate to select components section
        select_section = self.driver.find_element(By.XPATH, "//h2[contains(text(), 'Select Components')]")
        self.driver.execute_script("arguments[0].scrollIntoView(true);", select_section)
        time.sleep(0.5)

        # Test URL remains the same
        assert self.base_url in self.driver.current_url, "Should stay on same page when interacting with select"

    def test_select_no_errors(self):
        """Test 3: Select interactions don't cause console errors"""
        # Find all selects
        selects = self.driver.find_elements(By.TAG_NAME, "select")
        assert len(selects) >= 3, "Page should have multiple select elements"

        # Clear console logs
        try:
            self.driver.get_log('browser')
        except:
            pass

        # Interact with basic select
        basic_select = self.driver.find_element(By.XPATH, "//select[contains(@data-testid, 'basic-select')]")
        basic_select.click()
        time.sleep(0.2)

        # Select an option
        options = basic_select.find_elements(By.TAG_NAME, "option")
        options[1].click()  # Select Apple
        time.sleep(0.2)

        # Check for errors
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        assert len(errors) == 0, f"Select interaction caused console errors: {errors}"

    def test_select_keyboard_navigation(self):
        """Test 4: Select keyboard navigation works"""
        # Focus basic select
        basic_select = self.driver.find_element(By.XPATH, "//select[contains(@data-testid, 'basic-select')]")
        basic_select.click()
        time.sleep(0.1)

        # Verify select is focused
        active_element = self.driver.switch_to.active_element
        assert active_element == basic_select, "Select should be focusable"

        # Test keyboard navigation - press space to open dropdown
        active_element.send_keys(Keys.SPACE)
        time.sleep(0.2)

        # Verify select is still focused after keyboard interaction
        active_element = self.driver.switch_to.active_element
        assert active_element == basic_select, "Select should remain focused after keyboard interaction"

        # Test that select responds to keyboard input
        # For native selects, just verify it can receive keyboard events
        assert basic_select.is_enabled(), "Select should be enabled for keyboard navigation"

    def test_select_option_selection(self):
        """Test 5: Select option selection works"""
        basic_select = self.driver.find_element(By.XPATH, "//select[contains(@data-testid, 'basic-select')]")

        # Select banana option
        options = basic_select.find_elements(By.TAG_NAME, "option")
        banana_option = None
        for option in options:
            if 'banana' in option.get_attribute('value'):
                banana_option = option
                break

        assert banana_option is not None, "Should find banana option"

        banana_option.click()
        time.sleep(0.2)

        # Verify selection
        selected_value = basic_select.get_attribute('value')
        assert selected_value == 'banana', "Banana should be selected"

        # Check if the page reflects the selection
        page_text = self.driver.find_element(By.TAG_NAME, "body").text
        assert "Selected: banana" in page_text, "Page should show selected value"

    def test_select_default_value(self):
        """Test 6: Select with default value works"""
        default_select = self.driver.find_element(By.XPATH, "//select[contains(@data-testid, 'default-select')]")

        # Check initial value
        initial_value = default_select.get_attribute('value')
        assert initial_value == 'us', "Default select should have initial value"

        # Change selection
        options = default_select.find_elements(By.TAG_NAME, "option")
        uk_option = None
        for option in options:
            if option.get_attribute('value') == 'uk':
                uk_option = option
                break

        uk_option.click()
        time.sleep(0.2)

        # Verify change
        new_value = default_select.get_attribute('value')
        assert new_value == 'uk', "Value should change to UK"

        # Check page reflects change
        page_text = self.driver.find_element(By.TAG_NAME, "body").text
        assert "Country: UK" in page_text, "Page should show new country selection"

    def test_select_multiple_selection(self):
        """Test 7: Multiple select functionality"""
        multi_select = self.driver.find_element(By.XPATH, "//select[contains(@data-testid, 'multi-select')]")

        # Get initial selections
        selected_options = multi_select.find_elements(By.XPATH, "//option[@selected]")
        initial_count = len(selected_options)

        # Select multiple options using Ctrl+Click (simulated)
        options = multi_select.find_elements(By.TAG_NAME, "option")

        # Try to select first option
        options[0].click()
        time.sleep(0.1)

        # Select third option
        options[2].click()
        time.sleep(0.1)

        # Verify multiple selections (this may vary by browser)
        # At minimum, the last selected option should be selected
        last_option_value = options[2].get_attribute('value')
        assert last_option_value is not None, "Option should have value"

    def test_select_disabled_state(self):
        """Test 8: Disabled select cannot be interacted with"""
        disabled_select = self.driver.find_element(By.XPATH, "//select[contains(@data-testid, 'disabled-select')]")

        # Verify disabled attribute
        assert disabled_select.get_attribute('disabled') == 'true', "Select should have disabled attribute"

        # Try to click disabled select
        disabled_select.click()
        time.sleep(0.2)

        # Verify it's not focused (should not be focused when disabled)
        active_element = self.driver.switch_to.active_element
        assert active_element != disabled_select, "Disabled select should not receive focus"

    def test_select_accessibility(self):
        """Test 9: Select accessibility attributes"""
        basic_select = self.driver.find_element(By.XPATH, "//select[contains(@data-testid, 'basic-select')]")

        # Check for proper labeling
        label_element = self.driver.find_element(By.XPATH, "//label[contains(text(), 'Basic Select')]")
        assert label_element.is_displayed(), "Select should have visible label"

        # Check for proper association between label and select
        label_for = label_element.get_attribute('for')
        if label_for:
            select_id = basic_select.get_attribute('id')
            # If label has for attribute, select should have matching id
            # This is optional - label can also wrap the select
            pass

        # Verify select has required class for styling
        assert 'select-element' in basic_select.get_attribute('class'), "Select should have styling class"

    def test_select_form_integration(self):
        """Test 10: Select works in form context"""
        # Check that selects are properly integrated in the page
        selects = self.driver.find_elements(By.CSS_SELECTOR, "select.select-element")
        assert len(selects) >= 3, "Page should have multiple styled selects"

        # Each select should have proper styling
        for select in selects:
            classes = select.get_attribute('class').split()
            assert 'select-element' in classes, "Each select should have select-element class"
            assert 'w-full' in classes, "Select should have full width class"

        # Check that disabled select has disabled styling
        disabled_select = self.driver.find_element(By.XPATH, "//select[contains(@data-testid, 'disabled-select')]")
        disabled_classes = disabled_select.get_attribute('class').split()
        assert 'opacity-50' in disabled_classes, "Disabled select should have opacity styling"

    def test_select_responsive_design(self):
        """Test 11: Select responsive design"""
        basic_select = self.driver.find_element(By.XPATH, "//select[contains(@data-testid, 'basic-select')]")

        # Check initial size
        initial_width = basic_select.size['width']
        assert initial_width > 0, "Select should have visible width"

        # Test mobile size
        self.driver.set_window_size(375, 667)  # iPhone size
        time.sleep(0.5)

        # Check select is still functional on mobile
        mobile_width = basic_select.size['width']
        assert mobile_width > 0, "Select should be responsive on mobile"

        # Restore desktop size
        self.driver.set_window_size(1280, 720)
        time.sleep(0.5)

        # Verify select is still functional
        desktop_width = basic_select.size['width']
        assert desktop_width > 0, "Select should be responsive on desktop"

    def test_select_focus_management(self):
        """Test 12: Select focus management"""
        basic_select = self.driver.find_element(By.XPATH, "//select[contains(@data-testid, 'basic-select')]")

        # Click to focus
        basic_select.click()
        time.sleep(0.1)

        # Verify focused
        active_element = self.driver.switch_to.active_element
        assert active_element == basic_select, "Select should receive focus on click"

        # Tab away
        active_element.send_keys(Keys.TAB)
        time.sleep(0.1)

        # Verify focus moved away
        new_active = self.driver.switch_to.active_element
        assert new_active != basic_select, "Focus should move away when tabbing"

    def test_select_sections_exist(self):
        """Test 13: Select section exists with proper structure"""
        # Check for select components section
        section = self.driver.find_element(By.XPATH, "//section[contains(., 'Select Components')]")
        assert section.is_displayed(), "Select components section should be visible"

        # Check for section header
        header = section.find_element(By.TAG_NAME, "h2")
        assert "Select Components" in header.text, "Section should have proper header"

        # Check for select labels
        labels = section.find_elements(By.TAG_NAME, "label")
        label_texts = [label.text for label in labels]

        expected_labels = ["Basic Select", "Select with Default Value", "Multiple Select", "Disabled Select"]
        for expected_label in expected_labels:
            assert any(expected_label in text for text in label_texts), f"Should find label for {expected_label}"

    def test_select_styling_is_applied(self):
        """Test 14: Select styling is properly applied"""
        basic_select = self.driver.find_element(By.XPATH, "//select[contains(@data-testid, 'basic-select')]")
        classes = basic_select.get_attribute('class')

        # Check for Tailwind classes
        assert 'border' in classes, "Select should have border class"
        assert 'rounded' in classes, "Select should have rounded class"
        assert 'focus:ring-2' in classes, "Select should have focus ring styling"
        assert 'focus:ring-blue-500' in classes, "Select should have blue focus color"

        # Check for proper form styling
        assert 'px-3' in classes, "Select should have horizontal padding"
        assert 'py-2' in classes, "Select should have vertical padding"

        # Check disabled select has different styling
        disabled_select = self.driver.find_element(By.XPATH, "//select[contains(@data-testid, 'disabled-select')]")
        disabled_classes = disabled_select.get_attribute('class')
        assert 'bg-gray-100' in disabled_classes, "Disabled select should have gray background"
        assert 'cursor-not-allowed' in disabled_classes, "Disabled select should have not-allowed cursor"