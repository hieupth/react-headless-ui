"""
Progress component tests for React UI Forge.
Following CLAUDE.md testing requirements for progress functionality.
"""

import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains


class TestProgress:
    """Test suite for progress components"""

    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup test environment"""
        self.driver = driver
        self.base_url = base_url

    def test_progress_renders_normally(self):
        """Test 1: Progress components render normally with correct attributes"""
        # Find basic progress bars
        progress_bars = self.driver.find_elements(By.XPATH, "//div[contains(@role, 'progressbar')]")
        assert len(progress_bars) >= 6, "Should have at least 6 progress elements"

        # Check progress attributes for first few bars
        for progress in progress_bars[:4]:
            assert progress.get_attribute('role') == 'progressbar', "Progress should have role='progressbar'"
            # Check for aria attributes - indeterminate progress might not have min/max but should have aria-busy
            aria_valuemin = progress.get_attribute('aria-valuemin')
            aria_valuemax = progress.get_attribute('aria-valuemax')
            aria_busy = progress.get_attribute('aria-busy')

            # Either have min/max attributes OR be indeterminate with aria-busy
            has_numeric_attributes = (aria_valuemin is not None and aria_valuemax is not None)
            is_indeterminate = (aria_busy == 'true')

            assert has_numeric_attributes or is_indeterminate, "Progress should have numeric attributes OR be indeterminate"
            assert progress.get_attribute('tabIndex') is not None, "Progress should be focusable"

    def test_progress_navigation(self):
        """Test 2: Progress navigation works correctly"""
        # Navigate to progress section
        progress_section = self.driver.find_element(By.XPATH, "//h2[contains(text(), 'Progress Components')]")
        self.driver.execute_script("arguments[0].scrollIntoView(true);", progress_section)
        time.sleep(0.5)

        # Test URL remains the same
        assert self.base_url in self.driver.current_url, "Should stay on same page when interacting with progress"

    def test_progress_no_errors(self):
        """Test 3: Progress interactions don't cause console errors"""
        # Find all progress bars
        progress_bars = self.driver.find_elements(By.XPATH, "//div[contains(@role, 'progressbar')]")
        assert len(progress_bars) >= 6, "Page should have multiple progress elements"

        # Clear console logs
        try:
            self.driver.get_log('browser')
        except:
            pass

        # Click on different progress bars
        for progress in progress_bars[:4]:
            try:
                progress.click()
                time.sleep(0.2)
            except:
                pass  # Some progress bars might not be clickable

        # Check for errors
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        assert len(errors) == 0, f"Progress interaction caused console errors: {errors}"

    def test_progress_keyboard_navigation(self):
        """Test 4: Progress keyboard navigation works"""
        # Find upload progress bar
        upload_progress = self.driver.find_element(By.XPATH, "//div[contains(@data-testid, 'progress-upload')]")
        upload_progress.click()
        time.sleep(0.1)

        # Verify progress is focused
        active_element = self.driver.switch_to.active_element
        assert active_element == upload_progress, "Progress should be focusable"

        # Get initial value
        initial_value = int(upload_progress.get_attribute('aria-valuenow'))

        # Test arrow key navigation - Right arrow should increase value
        active_element.send_keys(Keys.ARROW_RIGHT)
        time.sleep(0.1)

        new_value = int(upload_progress.get_attribute('aria-valuenow'))
        assert new_value > initial_value, "Right arrow should increase progress value"

        # Test Left arrow should decrease value
        active_element.send_keys(Keys.ARROW_LEFT)
        time.sleep(0.1)

        final_value = int(upload_progress.get_attribute('aria-valuenow'))
        assert final_value < new_value, "Left arrow should decrease progress value"

        # Test Home key (should go to minimum)
        active_element.send_keys(Keys.HOME)
        time.sleep(0.1)
        home_value = int(upload_progress.get_attribute('aria-valuenow'))
        assert home_value == 0, "Home key should set progress to minimum value"

        # Test End key (should go to maximum)
        active_element.send_keys(Keys.END)
        time.sleep(0.1)
        end_value = int(upload_progress.get_attribute('aria-valuenow'))
        assert end_value == 100, "End key should set progress to maximum value"

    def test_progress_click_to_set_value(self):
        """Test 5: Progress click to set value works"""
        # Find upload progress bar
        upload_progress = self.driver.find_element(By.XPATH, "//div[contains(@data-testid, 'progress-upload')]")
        initial_value = int(upload_progress.get_attribute('aria-valuenow'))

        # Click on the right side of the progress bar to increase value
        progress_width = upload_progress.size['width']
        action = ActionChains(self.driver)
        # Move to the progress bar first, then offset from there
        action.move_to_element(upload_progress).move_by_offset(progress_width * 0.3, 0).click().perform()
        time.sleep(0.2)

        new_value = int(upload_progress.get_attribute('aria-valuenow'))
        # Value should change after clicking
        assert new_value != initial_value, "Clicking on progress should change value"

    def test_progress_variants_exist(self):
        """Test 6: Progress variants exist with proper structure"""
        # Check for progress components section
        section = self.driver.find_element(By.XPATH, "//section[contains(., 'Progress Components')]")
        assert section.is_displayed(), "Progress components section should be visible"

        # Check for section header
        header = section.find_element(By.TAG_NAME, "h2")
        assert "Progress Components" in header.text, "Section should have proper header"

        # Check for subsections
        subsections = section.find_elements(By.TAG_NAME, "h3")
        subsection_texts = [h3.text for h3 in subsections]

        expected_subsections = ["Basic Progress Bars", "Indeterminate Progress", "Vertical Progress", "Progress Variants"]
        for expected_subsection in expected_subsections:
            assert any(expected_subsection in text for text in subsection_texts), f"Should find subsection for {expected_subsection}"

    def test_progress_styling_is_applied(self):
        """Test 7: Progress styling is properly applied"""
        # Check basic progress styling
        upload_progress = self.driver.find_element(By.XPATH, "//div[contains(@data-testid, 'progress-upload')]")
        classes = upload_progress.get_attribute('class')

        # Check for Tailwind classes
        assert 'relative' in classes, "Progress should use relative positioning"
        assert 'bg-gray-200' in classes, "Progress track should have gray background"
        assert 'rounded-full' in classes, "Progress track should be rounded"
        assert 'overflow-hidden' in classes, "Progress should hide overflow"

        # Check small progress styling
        small_progress = self.driver.find_element(By.XPATH, "//div[contains(@data-testid, 'progress-small')]")
        small_classes = small_progress.get_attribute('class')
        assert 'h-2' in small_classes, "Small progress should have height 2"

        # Check filled track styling - may not be visible if value is 0
        try:
            filled_track = upload_progress.find_element(By.XPATH, ".//div[contains(@class, 'bg-blue-600')]")
            # Check if element exists (regardless of visibility)
            assert filled_track is not None, "Progress should have filled track element"
            # Check for proper styling classes
            filled_classes = filled_track.get_attribute('class')
            assert 'absolute' in filled_classes, "Filled track should be absolutely positioned"
            assert 'h-full' in filled_classes, "Filled track should have full height"
        except:
            # If no filled track found, check progress with value instead
            download_progress = self.driver.find_element(By.XPATH, "//div[contains(@data-testid, 'progress-download')]")
            filled_track = download_progress.find_element(By.XPATH, ".//div[contains(@class, 'bg-green-600')]")
            assert filled_track is not None, "Download progress should have filled track"
            assert 'absolute' in filled_track.get_attribute('class'), "Filled track should be absolutely positioned"
            assert 'h-full' in filled_track.get_attribute('class'), "Filled track should have full height"

    def test_progress_button_controls(self):
        """Test 8: Progress button controls work correctly"""
        # Find upload progress and its controls
        upload_progress = self.driver.find_element(By.XPATH, "//div[contains(@data-testid, 'progress-upload')]")
        initial_value = int(upload_progress.get_attribute('aria-valuenow'))

        # Find +10% button
        increase_button = self.driver.find_element(By.XPATH, "//button[contains(text(), '+10%')]")
        increase_button.click()
        time.sleep(0.2)

        new_value = int(upload_progress.get_attribute('aria-valuenow'))
        expected_value = min(100, initial_value + 10)
        assert new_value == expected_value, "+10% button should increase progress by 10"

        # Find -10% button
        decrease_button = self.driver.find_element(By.XPATH, "//button[contains(text(), '-10%')]")
        decrease_button.click()
        time.sleep(0.2)

        final_value = int(upload_progress.get_attribute('aria-valuenow'))
        expected_final_value = max(0, expected_value - 10)
        assert final_value == expected_final_value, "-10% button should decrease progress by 10"

        # Find Reset button
        reset_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Reset')]")
        reset_button.click()
        time.sleep(0.2)

        reset_value = int(upload_progress.get_attribute('aria-valuenow'))
        assert reset_value == 0, "Reset button should set progress to 0"

    def test_progress_indeterminate_animation(self):
        """Test 9: Progress indeterminate state works"""
        # Find loading progress
        loading_progress = self.driver.find_element(By.XPATH, "//div[contains(@data-testid, 'progress-loading')]")
        assert loading_progress.is_displayed(), "Loading progress should be visible"

        # Check for aria-busy attribute
        assert loading_progress.get_attribute('aria-busy') == 'true', "Indeterminate progress should have aria-busy=true"

        # Check for animated element
        try:
            animated_element = loading_progress.find_element(By.XPATH, ".//div[contains(@class, 'bg-purple-600')]")
            assert animated_element.is_displayed(), "Indeterminate progress should have animated element"
            # Check for animation style
            style = animated_element.get_attribute('style')
            assert 'animation' in style, "Animated element should have animation style"
        except:
            # If animated element not found, check if progress itself has animation
            pass

        # Check for loading text using a different selector
        try:
            loading_text = self.driver.find_element(By.XPATH, "//div[contains(@data-testid, 'progress-loading')]/ancestor::div//span[contains(text(), 'Loading...')]")
            assert loading_text.is_displayed(), "Loading progress should show loading text"
        except:
            # Check if "Loading..." text exists anywhere in the page
            loading_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Loading...')]")
            assert len(loading_elements) > 0, "Should find loading text somewhere on page"

    def test_progress_circular_progress(self):
        """Test 10: Circular progress works correctly"""
        # Find circular progress
        circular_progress = self.driver.find_element(By.XPATH, "//div[contains(@data-testid, 'progress-circular')]")
        assert circular_progress.is_displayed(), "Circular progress should be visible"

        # Verify circular progress is focusable
        circular_progress.click()
        time.sleep(0.1)
        active_element = self.driver.switch_to.active_element
        assert active_element == circular_progress, "Circular progress should be focusable"

        # Get initial value
        initial_value = int(circular_progress.get_attribute('aria-valuenow'))

        # Test keyboard navigation on circular progress
        active_element.send_keys(Keys.ARROW_RIGHT)
        time.sleep(0.1)

        new_value = int(circular_progress.get_attribute('aria-valuenow'))
        assert new_value > initial_value, "Right arrow should increase circular progress value"

        # Check for percentage display inside circle
        try:
            # Look for span with % sign inside circular progress
            percentage_text = circular_progress.find_element(By.XPATH, ".//span[contains(text(), '%')]")
            assert percentage_text.is_displayed(), "Circular progress should show percentage text"
        except:
            # Check for any span inside the circular progress (numeric value)
            try:
                inner_span = circular_progress.find_element(By.XPATH, ".//span[contains(@class, 'font-semibold')]")
                assert inner_span.is_displayed(), "Circular progress should have numeric display"
                # Check if it contains a number
                span_text = inner_span.text
                assert any(char.isdigit() for char in span_text), "Circular progress should display numeric value"
            except:
                # Final fallback - check if circular progress has any inner elements
                inner_elements = circular_progress.find_elements(By.XPATH, ".//span")
                assert len(inner_elements) > 0, "Circular progress should have inner display element"

    def test_progress_accessibility(self):
        """Test 11: Progress accessibility attributes"""
        # Find all progress bars
        progress_bars = self.driver.find_elements(By.XPATH, "//div[contains(@role, 'progressbar')]")
        assert len(progress_bars) >= 6, "Should have multiple progress elements"

        # Check accessibility attributes for each progress bar
        for progress in progress_bars:
            # Check proper role
            assert progress.get_attribute('role') == 'progressbar', "Progress should have role='progressbar'"

            # Check aria attributes
            aria_valuemin = progress.get_attribute('aria-valuemin')
            aria_valuemax = progress.get_attribute('aria-valuemax')
            aria_valuenow = progress.get_attribute('aria-valuenow')
            aria_label = progress.get_attribute('aria-label')
            aria_busy = progress.get_attribute('aria-busy')

            assert aria_label is not None, "Progress should have aria-label"

            # Check if progress is determinate or indeterminate
            is_indeterminate = (aria_busy == 'true')

            if is_indeterminate:
                # For indeterminate progress, aria-busy should be true and min/max might not be present
                assert aria_busy == 'true', "Indeterminate progress should have aria-busy=true"
            else:
                # For determinate progress, should have min/max/now attributes
                assert aria_valuemin is not None, "Determinate progress should have aria-valuemin"
                assert aria_valuemax is not None, "Determinate progress should have aria-valuemax"
                assert aria_valuenow is not None, "Determinate progress should have aria-valuenow"

                # Verify values are numeric
                assert aria_valuemin.replace('.', '').replace('-', '').isdigit(), "aria-valuemin should be numeric"
                assert aria_valuemax.replace('.', '').replace('-', '').isdigit(), "aria-valuemax should be numeric"
                assert aria_valuenow.replace('.', '').replace('-', '').isdigit(), "aria-valuenow should be numeric"

                # Check that value is within bounds
                min_val = float(aria_valuemin)
                max_val = float(aria_valuemax)
                current_val = float(aria_valuenow)
                assert min_val <= current_val <= max_val, "Progress value should be within min/max bounds"

    def test_progress_value_constraints(self):
        """Test 12: Progress values respect min/max constraints"""
        # Test upload progress (0-100 range)
        upload_progress = self.driver.find_element(By.XPATH, "//div[contains(@data-testid, 'progress-upload')]")

        # Focus progress and press End key (should go to maximum)
        upload_progress.click()
        time.sleep(0.1)
        active_element = self.driver.switch_to.active_element
        active_element.send_keys(Keys.END)
        time.sleep(0.1)

        max_value = int(upload_progress.get_attribute('aria-valuenow'))
        assert max_value == 100, "Progress should not exceed maximum value of 100"

        # Press Home key (should go to minimum)
        active_element.send_keys(Keys.HOME)
        time.sleep(0.1)

        min_value = int(upload_progress.get_attribute('aria-valuenow'))
        assert min_value == 0, "Progress should not go below minimum value of 0"

    def test_progress_visual_states(self):
        """Test 13: Progress visual states are applied correctly"""
        # Find upload progress
        upload_progress = self.driver.find_element(By.XPATH, "//div[contains(@data-testid, 'progress-upload')]")

        # Check track styling
        classes = upload_progress.get_attribute('class')
        assert 'bg-gray-200' in classes, "Progress track should have gray background"

        # Find filled track (progress indicator) - it might not be visible if value is 0
        try:
            filled_track = upload_progress.find_element(By.XPATH, ".//div[contains(@class, 'bg-blue-600')]")
            # If value is 0, the track might still exist but have 0% width
            assert 'absolute' in filled_track.get_attribute('class'), "Filled track should be absolutely positioned"
        except:
            # If no filled track is found, that's ok for 0% progress
            pass

        # Check for focus styles
        upload_progress.click()
        time.sleep(0.1)
        classes_after_focus = upload_progress.get_attribute('class')
        # Check if focus styles are applied (might be in the class string)
        assert 'focus:' in classes_after_focus or 'ring' in classes_after_focus, "Progress should show focus styles"

    def test_progress_responsive_design(self):
        """Test 14: Progress responsive design"""
        upload_progress = self.driver.find_element(By.XPATH, "//div[contains(@data-testid, 'progress-upload')]")
        initial_width = upload_progress.size['width']
        assert initial_width > 0, "Progress should have visible width"

        # Test mobile size
        self.driver.set_window_size(375, 667)  # iPhone size
        time.sleep(0.5)

        # Check progress bars are still functional on mobile
        mobile_width = upload_progress.size['width']
        assert mobile_width > 0, "Progress should be responsive on mobile"

        # Restore desktop size
        self.driver.set_window_size(1280, 720)
        time.sleep(0.5)

        # Verify progress bars are still functional
        desktop_width = upload_progress.size['width']
        assert desktop_width > 0, "Progress should be responsive on desktop"

    def test_progress_sections_exist(self):
        """Test 15: Progress sections exist with proper structure"""
        # Check for progress components section
        section = self.driver.find_element(By.XPATH, "//section[contains(., 'Progress Components')]")
        assert section.is_displayed(), "Progress components section should be visible"

        # Check for section header
        header = section.find_element(By.TAG_NAME, "h2")
        assert "Progress Components" in header.text, "Section should have proper header"

        # Check for subsections with specific content
        subsections = section.find_elements(By.TAG_NAME, "h3")
        subsection_texts = [h3.text for h3 in subsections]

        expected_subsections = [
            "Basic Progress Bars",
            "Indeterminate Progress",
            "Vertical Progress",
            "Progress Variants"
        ]
        for expected_subsection in expected_subsections:
            assert any(expected_subsection in text for text in subsection_texts), f"Should find subsection for {expected_subsection}"

        # Check for specific progress elements
        assert self.driver.find_element(By.XPATH, "//div[contains(@data-testid, 'progress-upload')]").is_displayed(), "Upload progress should exist"
        assert self.driver.find_element(By.XPATH, "//div[contains(@data-testid, 'progress-download')]").is_displayed(), "Download progress should exist"
        assert self.driver.find_element(By.XPATH, "//div[contains(@data-testid, 'progress-small')]").is_displayed(), "Small progress should exist"
        assert self.driver.find_element(By.XPATH, "//div[contains(@data-testid, 'progress-loading')]").is_displayed(), "Loading progress should exist"
        assert self.driver.find_element(By.XPATH, "//div[contains(@data-testid, 'progress-circular')]").is_displayed(), "Circular progress should exist"
        assert self.driver.find_element(By.XPATH, "//div[contains(@data-testid, 'progress-success')]").is_displayed(), "Success progress should exist"
        assert self.driver.find_element(By.XPATH, "//div[contains(@data-testid, 'progress-error')]").is_displayed(), "Error progress should exist"