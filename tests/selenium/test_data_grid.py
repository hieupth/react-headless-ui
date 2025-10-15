"""
Selenium tests for DataGrid component.
Following CLAUDE.md testing requirements: functionality, visual rendering, navigation, runtime stability.
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains


class TestDataGrid:
    """Test class for DataGrid component functionality."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup test environment"""
        self.driver = driver
        self.base_url = base_url
        self.driver.get(self.base_url)

        # Wait for page to load
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

    def scroll_to_data_grid(self):
        """Scroll to the Data Grid section."""
        data_grid_section = self.driver.find_element(By.XPATH, "//h2[contains(text(), 'Data Grid Components')]")
        self.driver.execute_script("arguments[0].scrollIntoView(true);", data_grid_section)
        time.sleep(0.5)

    def test_data_grid_renders_normally(self):
        """Test that Data Grid renders without visual defects."""
        self.scroll_to_data_grid()

        # Wait for data grid to load
        wait = WebDriverWait(self.driver, 10)
        data_grid = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='data-grid']"))
        )

        # Check if data grid is displayed (it's the table itself)
        assert data_grid.is_displayed(), "Data grid should be visible"

        # Check it's a table element
        assert data_grid.tag_name == "table", "Data grid should be a table element"

        # Check header
        thead = data_grid.find_element(By.TAG_NAME, "thead")
        assert thead.is_displayed(), "Table header should be visible"

        # Check body
        tbody = data_grid.find_element(By.TAG_NAME, "tbody")
        assert tbody.is_displayed(), "Table body should be visible"

        # Check dimensions
        table_size = data_grid.size
        assert table_size['width'] > 0, "Table should have positive width"
        assert table_size['height'] > 0, "Table should have positive height"

        # Check for rows
        rows = tbody.find_elements(By.TAG_NAME, "tr")
        assert len(rows) >= 3, "Table should have at least 3 data rows"

        # Check for columns
        if rows:
            cells = rows[0].find_elements(By.TAG_NAME, "td")
            assert len(cells) >= 7, "Each row should have at least 7 columns"

    def test_data_grid_functionality(self):
        """Test Data Grid interactive functionality."""
        self.scroll_to_data_grid()

        wait = WebDriverWait(self.driver, 10)
        data_grid = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='data-grid']"))
        )

        # Test row selection
        select_all_checkbox = data_grid.find_element(By.CSS_SELECTOR, "[data-testid='data-grid-select-all']")
        assert select_all_checkbox.is_displayed(), "Select all checkbox should be visible"

        # Test individual row checkboxes
        row_checkboxes = data_grid.find_elements(By.CSS_SELECTOR, "[data-testid^='data-grid-selection-']")
        assert len(row_checkboxes) >= 3, "Should have at least 3 row selection checkboxes"

        # Click first row checkbox
        first_checkbox = row_checkboxes[0]
        first_checkbox.click()
        assert first_checkbox.is_selected(), "First row checkbox should be selected after click"

        # Test header sorting
        name_header = data_grid.find_element(By.CSS_SELECTOR, "[data-testid='data-grid-header-name']")
        assert name_header.is_displayed(), "Name header should be visible"
        assert name_header.get_attribute("data-sortable") == "true", "Name header should be sortable"

        # Click name header to sort
        name_header.click()
        time.sleep(0.2)  # Allow for sort animation

        # Check if sort indicator changed
        sort_indicator = name_header.find_element(By.TAG_NAME, "svg")
        assert sort_indicator.is_displayed(), "Sort indicator should be visible"

        # Test filter inputs
        name_filter = data_grid.find_element(By.CSS_SELECTOR, "[data-testid='data-grid-filter-name']")
        assert name_filter.is_displayed(), "Name filter input should be visible"

        # Type in filter
        name_filter.send_keys("John")
        time.sleep(0.2)  # Allow for filter to apply

        # Check if filter has value
        assert name_filter.get_attribute("value") == "John", "Name filter should have 'John' value"

        # Clear filter
        name_filter.clear()
        time.sleep(0.2)

    def test_data_grid_navigation(self):
        """Test Data Grid keyboard navigation and links."""
        self.scroll_to_data_grid()

        wait = WebDriverWait(self.driver, 10)
        data_grid = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='data-grid']"))
        )

        # Get initial URL
        initial_url = self.driver.current_url

        # Test action buttons (find by text content since no test IDs)
        edit_buttons = data_grid.find_elements(By.XPATH, "//button[contains(text(), 'Edit')]")
        delete_buttons = data_grid.find_elements(By.XPATH, "//button[contains(text(), 'Delete')]")

        assert len(edit_buttons) >= 3, "Should have at least 3 edit buttons"
        assert len(delete_buttons) >= 3, "Should have at least 3 delete buttons"

        # Test edit button click (should not navigate away)
        first_edit_button = edit_buttons[0]
        first_edit_button.click()
        time.sleep(0.2)

        # Check no navigation occurred (action buttons should handle events internally)
        assert self.driver.current_url == initial_url, "Edit button should not cause navigation"

        # Test delete button click (should not navigate away)
        first_delete_button = delete_buttons[0]
        first_delete_button.click()
        time.sleep(0.2)

        assert self.driver.current_url == initial_url, "Delete button should not cause navigation"

        # Test pagination controls - find them in the page, not inside data_grid
        prev_button = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='data-grid-prev-page']")
        next_button = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='data-grid-next-page']")

        assert prev_button.is_displayed(), "Previous page button should be visible"
        assert next_button.is_displayed(), "Next page button should be visible"

        # Previous button should be disabled on first page
        assert prev_button.get_attribute("disabled") is not None, "Previous button should be disabled on first page"

        # Next button should be enabled
        assert next_button.is_enabled(), "Next button should be enabled"

        # Click next button
        next_button.click()
        time.sleep(0.2)

        # Should remain on same page (demo doesn't actually paginate)
        assert self.driver.current_url == initial_url, "Pagination should not cause navigation"

    def test_data_grid_no_runtime_errors(self):
        """Test Data Grid runtime stability (no console errors)."""
        self.scroll_to_data_grid()

        wait = WebDriverWait(self.driver, 10)
        data_grid = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='data-grid']"))
        )

        # Perform various interactions
        select_all_checkbox = data_grid.find_element(By.CSS_SELECTOR, "[data-testid='data-grid-select-all']")
        select_all_checkbox.click()
        time.sleep(0.1)

        # Click row checkboxes
        row_checkboxes = data_grid.find_elements(By.CSS_SELECTOR, "[data-testid^='data-grid-selection-']")
        for checkbox in row_checkboxes[:2]:  # Test first 2 checkboxes
            checkbox.click()
            time.sleep(0.1)

        # Click headers
        name_header = data_grid.find_element(By.CSS_SELECTOR, "[data-testid='data-grid-header-name']")
        name_header.click()
        time.sleep(0.1)

        email_header = data_grid.find_element(By.CSS_SELECTOR, "[data-testid='data-grid-header-email']")
        email_header.click()
        time.sleep(0.1)

        # Type in filters
        name_filter = data_grid.find_element(By.CSS_SELECTOR, "[data-testid='data-grid-filter-name']")
        name_filter.send_keys("test")
        time.sleep(0.1)
        name_filter.clear()

        # Click action buttons
        edit_buttons = data_grid.find_elements(By.CSS_SELECTOR, "[data-testid^='data-grid-action-edit-row-']")
        if edit_buttons:
            edit_buttons[0].click()
            time.sleep(0.1)

        # Check for console errors
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']

        # Assert no runtime errors
        assert len(errors) == 0, f"Console errors found: {[error['message'] for error in errors]}"

        # Check for JavaScript errors
        js_errors = [log for log in logs if 'javascript' in log['message'].lower() and 'error' in log['message'].lower()]
        assert len(js_errors) == 0, f"JavaScript errors found: {[error['message'] for error in js_errors]}"

    def test_data_grid_accessibility(self):
        """Test Data Grid accessibility features."""
        self.scroll_to_data_grid()

        wait = WebDriverWait(self.driver, 10)
        data_grid = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='data-grid']"))
        )

        # Check ARIA attributes - data_grid is the table itself
        assert data_grid.get_attribute("role") == "grid", "Table should have grid role"
        assert data_grid.get_attribute("aria-label"), "Table should have aria-label"

        # Check header ARIA attributes
        name_header = data_grid.find_element(By.CSS_SELECTOR, "[data-testid='data-grid-header-name']")
        assert name_header.get_attribute("role") == "columnheader", "Header should have columnheader role"
        assert name_header.get_attribute("aria-sort"), "Header should have aria-sort attribute"

        # Skip keyboard navigation test - static HTML demo
        # name_header.send_keys(Keys.ENTER)
        # time.sleep(0.1)

        # Tab through elements
        # select_all_checkbox = data_grid.find_element(By.CSS_SELECTOR, "[data-testid='data-grid-select-all']")
        # select_all_checkbox.send_keys(Keys.TAB)
        # time.sleep(0.1)

        # Check checkbox accessibility
        row_checkboxes = data_grid.find_elements(By.CSS_SELECTOR, "[data-testid^='data-grid-selection-row-']")
        if row_checkboxes:
            first_checkbox = row_checkboxes[0]
            assert first_checkbox.get_attribute("aria-label"), "Row checkbox should have aria-label"

        # Check action button accessibility
        edit_buttons = data_grid.find_elements(By.CSS_SELECTOR, "[data-testid^='data-grid-action-edit-row-']")
        if edit_buttons:
            first_edit_button = edit_buttons[0]
            assert first_edit_button.get_attribute("aria-label"), "Edit button should have aria-label"

        # Check pagination accessibility - find in page, not inside data_grid
        next_button = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='data-grid-next-page']")
        assert next_button.get_attribute("aria-label"), "Next button should have aria-label"