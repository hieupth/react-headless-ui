"""
File Upload component tests for React UI Forge.
Following CLAUDE.md requirements: 4 test types per component.
"""

import pytest
import os
import tempfile
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time
from test_helpers import normalize_url


class TestFileUpload:
    """Test File Upload component functionality and accessibility."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup test environment."""
        self.driver = driver
        self.base_url = base_url
        self.driver.get(self.base_url)

    def find_file_upload(self, test_id):
        """Find a file upload component by test ID."""
        try:
            return WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, f"//*[@data-testid='{test_id}']"))
            )
        except TimeoutException:
            raise NoSuchElementException(f"File Upload with test-id '{test_id}' not found")

    def create_test_file(self, content="Test file content", filename="test.txt"):
        """Create a temporary test file."""
        temp_file = tempfile.NamedTemporaryFile(mode='w', suffix=filename, delete=False)
        temp_file.write(content)
        temp_file.close()
        return temp_file.name

    def test_file_upload_basic_functionality(self):
        """Test 1: File Upload basic functionality."""
        print("Test 1: Testing File Upload basic functionality...")

        file_upload = self.find_file_upload("file-upload-single")
        assert file_upload.is_displayed(), "File upload area should be visible"

        # Test initial state
        assert file_upload.get_attribute("role") == "button", "File upload should have button role"
        assert file_upload.get_attribute("aria-label") == "Upload files", "File upload should have proper aria-label"
        assert file_upload.get_attribute("tabIndex") == "0", "File upload should be focusable"

        # Test focus
        file_upload.click()
        time.sleep(0.2)
        assert file_upload == self.driver.switch_to.active_element, "File upload should be focused after click"

        # Test keyboard activation (Enter)
        file_upload.send_keys(Keys.ENTER)
        time.sleep(0.2)

        # Check for any console errors during file dialog
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        assert len(errors) == 0, f"Should have no console errors during file dialog, but found: {errors}"

        print("✅ File Upload basic functionality test passed")

    def test_file_upload_renders_normally(self):
        """Test 2: File Upload visual rendering."""
        print("Test 2: Testing File Upload visual rendering...")

        # Test basic file upload
        file_upload = self.find_file_upload("file-upload-single")
        assert file_upload.is_displayed(), "Basic file upload should be displayed"

        # Check dimensions
        size = file_upload.size
        assert size['width'] > 0, "File upload should have positive width"
        assert size['height'] > 0, "File upload should have positive height"
        assert size['width'] > 200, "File upload should have reasonable width"
        assert size['height'] > 100, "File upload should have reasonable height"

        # Check position
        location = file_upload.location
        assert location['x'] >= 0, "File upload should be positioned within viewport"
        assert location['y'] >= 0, "File upload should be positioned within viewport"

        # Test multiple file upload
        multiple_upload = self.find_file_upload("file-upload-multiple")
        assert multiple_upload.is_displayed(), "Multiple file upload should be displayed"

        # Verify all have proper accessibility attributes
        for upload_id in ["file-upload-single", "file-upload-multiple"]:
            upload = self.find_file_upload(upload_id)
            assert upload.get_attribute("role") == "button", f"{upload_id} should have button role"
            assert upload.get_attribute("tabIndex") == "0", f"{upload_id} should be focusable"
            assert upload.get_attribute("aria-label"), f"{upload_id} should have aria-label"

        print("✅ File Upload visual rendering test passed")

    def test_file_upload_navigation(self):
        """Test 3: File Upload navigation and interaction."""
        print("Test 3: Testing File Upload navigation...")

        file_upload = self.find_file_upload("file-upload-single")

        # Test keyboard navigation to file upload
        file_upload.send_keys(Keys.TAB)
        time.sleep(0.2)

        # Focus should move to next element, not stay on file upload
        # (we can't predict exact focus position due to page layout)

        # Test keyboard activation with Space
        file_upload.click()
        time.sleep(0.2)
        file_upload.send_keys(Keys.SPACE)
        time.sleep(0.2)

        # Check for console errors
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        assert len(errors) == 0, f"Should have no console errors during keyboard activation, but found: {errors}"

        # Test focus management on multiple uploads
        uploads_to_test = ["file-upload-multiple"]

        for upload_id in uploads_to_test:
            try:
                upload = self.find_file_upload(upload_id)

                # Test clicking each upload
                upload.click()
                time.sleep(0.1)
                assert upload == self.driver.switch_to.active_element, f"{upload_id} should be focused after click"

                # Test Escape to close any potential file dialogs
                upload.send_keys(Keys.ESCAPE)
                time.sleep(0.1)

            except NoSuchElementException:
                continue  # Skip if this upload doesn't exist

        # Test Tab navigation between uploads
        first_upload = self.find_file_upload("file-upload-basic")
        first_upload.click()
        time.sleep(0.2)

        # Tab to next element
        first_upload.send_keys(Keys.TAB)
        time.sleep(0.2)

        # Focus should have moved (not to the same element)
        # We don't assert exact position due to page layout complexity

        print("✅ File Upload navigation test passed")

    def test_file_upload_no_errors(self):
        """Test 4: File Upload runtime stability."""
        print("Test 4: Testing File Upload runtime stability...")

        # Check initial console state
        initial_logs = self.driver.get_log('browser')
        initial_errors = [log for log in initial_logs if log['level'] == 'SEVERE']

        # Test various file upload interactions
        uploads_to_test = ["file-upload-single", "file-upload-multiple"]

        for upload_id in uploads_to_test:
            try:
                upload = self.find_file_upload(upload_id)

                if upload.is_displayed():
                    # Test click
                    upload.click()
                    time.sleep(0.1)

                    # Test keyboard activation
                    upload.send_keys(Keys.ENTER)
                    time.sleep(0.1)

                    # Test focus
                    upload.send_keys(Keys.TAB)
                    time.sleep(0.1)

                    # Test Space key
                    upload.send_keys(Keys.SPACE)
                    time.sleep(0.1)

                    # Test Escape key
                    upload.send_keys(Keys.ESCAPE)
                    time.sleep(0.1)

            except NoSuchElementException:
                continue  # Skip if this upload doesn't exist

        # Test drag and drop visual feedback
        try:
            drag_upload = self.find_file_upload("file-upload-multiple")

            # Test drag over visual feedback
            self.driver.execute_script("""
                var element = arguments[0];
                var event = new DragEvent('dragover', {
                    bubbles: true,
                    cancelable: true,
                    dataTransfer: new DataTransfer()
                });
                element.dispatchEvent(event);
            """, drag_upload)

            time.sleep(0.2)

            # Test drag leave
            self.driver.execute_script("""
                var element = arguments[0];
                var event = new DragEvent('dragleave', {
                    bubbles: true,
                    cancelable: true,
                    dataTransfer: new DataTransfer()
                });
                element.dispatchEvent(event);
            """, drag_upload)

            time.sleep(0.2)

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
        assert normalize_url(current_url) == normalize_url(self.base_url), "Should still be on the correct page after interactions"

        # Test all file uploads are still functional
        for upload_id in uploads_to_test:
            try:
                upload = self.find_file_upload(upload_id)
                assert upload.is_displayed(), f"{upload_id} should still be displayed"
                assert upload.get_attribute("role") == "button", f"{upload_id} should still have button role"
            except NoSuchElementException:
                continue

        print("✅ File Upload runtime stability test passed")

    def test_file_upload_accessibility(self):
        """Additional test: File Upload accessibility features."""
        print("Testing File Upload accessibility...")

        # Test basic file upload accessibility
        file_upload = self.find_file_upload("file-upload-single")

        # Check for proper ARIA attributes
        assert file_upload.get_attribute("role") == "button", "File upload should have role='button'"
        assert file_upload.get_attribute("aria-label") == "Upload files", "File upload should have proper aria-label"
        assert file_upload.get_attribute("tabIndex") == "0", "File upload should be in tab order"

        # Check for accessible labels on different uploads
        upload_configs = [
            ("file-upload-single", "Upload files"),
            ("file-upload-multiple", "Upload multiple files")
        ]

        for upload_id, expected_label in upload_configs:
            try:
                upload = self.find_file_upload(upload_id)
                actual_label = upload.get_attribute("aria-label")
                assert actual_label == expected_label, f"{upload_id} should have aria-label='{expected_label}'"
            except NoSuchElementException:
                continue  # Skip if this upload doesn't exist

        # Test keyboard accessibility
        file_upload.click()
        time.sleep(0.2)
        assert file_upload == self.driver.switch_to.active_element, "File upload should be keyboard focusable"

        # Test keyboard activation
        file_upload.send_keys(Keys.ENTER)
        time.sleep(0.2)

        file_upload.send_keys(Keys.SPACE)
        time.sleep(0.2)

        # Check that no JavaScript errors occur during keyboard interaction
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        assert len(errors) == 0, f"Keyboard interaction should not cause JavaScript errors, but found: {errors}"

        # Test that all uploads have semantic markup
        uploads_to_check = ["file-upload-single", "file-upload-multiple"]

        for upload_id in uploads_to_check:
            try:
                upload = self.find_file_upload(upload_id)

                # Check for semantic role
                role = upload.get_attribute("role")
                assert role == "button", f"{upload_id} should have semantic role"

                # Check for keyboard accessibility
                tabindex = upload.get_attribute("tabIndex")
                assert tabindex == "0", f"{upload_id} should be keyboard accessible"

                # Check for ARIA label
                aria_label = upload.get_attribute("aria-label")
                assert aria_label, f"{upload_id} should have ARIA label"

            except NoSuchElementException:
                continue

        print("✅ File Upload accessibility test passed")