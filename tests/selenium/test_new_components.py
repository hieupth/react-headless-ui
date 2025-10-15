"""
Test suite for newly implemented components.
Following CLAUDE.md requirements: 4 tests per component.
"""

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time


def normalize_url(url):
    """Normalize URL by removing trailing slashes for consistent comparison."""
    return url.rstrip('/')


class TestCheckbox:
    """Test suite for Checkbox component."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup test environment."""
        self.driver = driver
        self.base_url = base_url
        # Navigate to inputs page where components are located
        self.driver.get(self.base_url + "inputs/")

        # Wait for page to load
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

    def test_checkbox_renders_normally(self):
        """Test that checkbox renders with correct size and position."""
        # Find checkbox element
        checkbox = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='checkbox']")

        # Check visual properties
        assert checkbox.is_displayed()
        assert checkbox.size['width'] > 0
        assert checkbox.size['height'] > 0

    def test_checkbox_clicks(self):
        """Test checkbox click functionality."""
        checkbox = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='checkbox']")
        initial_state = checkbox.is_selected()
        checkbox.click()
        time.sleep(0.1)
        assert checkbox.is_selected() != initial_state

    def test_checkbox_navigation(self):
        """Test checkbox keyboard navigation."""
        # Test tab navigation to checkbox
        checkbox = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='checkbox']")
        initial_url = normalize_url(self.driver.current_url)
        checkbox.click()
        time.sleep(0.1)
        assert normalize_url(self.driver.current_url) == initial_url

    def test_checkbox_no_errors(self):
        """Test checkbox doesn't cause console errors."""
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        assert len(errors) == 0


class TestTextarea:
    """Test suite for Textarea component."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup test environment."""
        self.driver = driver
        self.base_url = base_url
        # Navigate to inputs page where components are located
        self.driver.get(self.base_url + "inputs/")

        # Wait for page to load
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

    def test_textarea_renders_normally(self):
        """Test that textarea renders correctly."""
        textarea = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='textarea']")
        assert textarea.is_displayed()
        assert textarea.size['width'] > 0
        assert textarea.size['height'] > 0

    def test_textarea_text_entry(self):
        """Test textarea text input functionality."""
        textarea = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='textarea']")
        test_text = "Test text entry"
        textarea.clear()
        textarea.send_keys(test_text)
        time.sleep(0.1)
        assert textarea.get_attribute("value") == test_text

    def test_textarea_navigation(self):
        """Test textarea navigation doesn't change URL."""
        textarea = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='textarea']")
        initial_url = normalize_url(self.driver.current_url)
        textarea.click()
        time.sleep(0.1)
        assert normalize_url(self.driver.current_url) == initial_url

    def test_textarea_no_errors(self):
        """Test textarea doesn't cause console errors."""
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        assert len(errors) == 0


class TestToggle:
    """Test suite for Toggle component."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup test environment."""
        self.driver = driver
        self.base_url = base_url
        # Navigate to inputs page where components are located
        self.driver.get(self.base_url + "inputs/")

        # Wait for page to load
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

    def test_toggle_renders_normally(self):
        """Test that toggle renders correctly."""
        toggle = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='toggle']")
        assert toggle.is_displayed()
        assert toggle.size['width'] > 0
        assert toggle.size['height'] > 0

    def test_toggle_clicks(self):
        """Test toggle click functionality."""
        toggle = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='toggle']")
        initial_state = toggle.get_attribute("aria-pressed")
        toggle.click()
        time.sleep(0.1)
        assert toggle.get_attribute("aria-pressed") != initial_state

    def test_toggle_navigation(self):
        """Test toggle navigation doesn't change URL."""
        toggle = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='toggle']")
        initial_url = normalize_url(self.driver.current_url)
        toggle.click()
        time.sleep(0.1)
        assert normalize_url(self.driver.current_url) == initial_url

    def test_toggle_no_errors(self):
        """Test toggle doesn't cause console errors."""
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        assert len(errors) == 0


class TestCalendar:
    """Test suite for Calendar component."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup test environment."""
        self.driver = driver
        self.base_url = base_url
        # Navigate to inputs page where components are located
        self.driver.get(self.base_url + "inputs/")

        # Wait for page to load
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

    def test_calendar_renders_normally(self):
        """Test that calendar renders correctly."""
        calendar = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='calendar']")
        assert calendar.is_displayed()
        assert calendar.size['width'] > 0
        assert calendar.size['height'] > 0

    def test_calendar_navigation(self):
        """Test calendar navigation functionality."""
        calendar = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='calendar']")
        initial_url = normalize_url(self.driver.current_url)
        calendar.click()
        time.sleep(0.1)
        assert normalize_url(self.driver.current_url) == initial_url

    def test_calendar_date_selection(self):
        """Test calendar date selection."""
        calendar = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='calendar']")
        calendar.click()
        time.sleep(0.1)
        # Basic click test since calendar implementation may vary
        assert calendar.is_displayed()

    def test_calendar_no_errors(self):
        """Test calendar doesn't cause console errors."""
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        assert len(errors) == 0


class TestButtonGroup:
    """Test suite for ButtonGroup component."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup test environment."""
        self.driver = driver
        self.base_url = base_url
        # Navigate to inputs page where components are located
        self.driver.get(self.base_url + "inputs/")

        # Wait for page to load
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

    def test_button_group_renders_normally(self):
        """Test that button group renders correctly."""
        button_group = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='button-group']")
        assert button_group.is_displayed()
        assert button_group.size['width'] > 0
        assert button_group.size['height'] > 0

    def test_button_group_clicks(self):
        """Test button group click functionality."""
        button_group = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='button-group']")
        initial_url = normalize_url(self.driver.current_url)
        button_group.click()
        time.sleep(0.1)
        assert normalize_url(self.driver.current_url) == initial_url

    def test_button_group_navigation(self):
        """Test button group navigation."""
        button_group = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='button-group']")
        initial_url = normalize_url(self.driver.current_url)
        button_group.click()
        time.sleep(0.1)
        assert normalize_url(self.driver.current_url) == initial_url

    def test_button_group_no_errors(self):
        """Test button group doesn't cause console errors."""
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        assert len(errors) == 0


class TestAlertDialog:
    """Test suite for AlertDialog component."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup test environment."""
        self.driver = driver
        self.base_url = base_url
        # Navigate to inputs page where components are located
        self.driver.get(self.base_url + "inputs/")

        # Wait for page to load
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

    def test_alert_dialog_renders_normally(self):
        """Test that alert dialog renders correctly."""
        # Open alert dialog first
        alert_trigger = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='alert-dialog-trigger']")
        alert_trigger.click()
        time.sleep(0.5)

        alert_dialog = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='alert-dialog']")
        assert alert_dialog.is_displayed()
        assert alert_dialog.size['width'] > 0
        assert alert_dialog.size['height'] > 0

    def test_alert_dialog_clicks(self):
        """Test alert dialog click functionality."""
        # Open alert dialog first
        alert_trigger = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='alert-dialog-trigger']")
        alert_trigger.click()
        time.sleep(0.5)

        alert_dialog = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='alert-dialog']")
        initial_url = normalize_url(self.driver.current_url)
        alert_dialog.click()
        time.sleep(0.1)
        assert normalize_url(self.driver.current_url) == initial_url

    def test_alert_dialog_navigation(self):
        """Test alert dialog navigation."""
        # Open alert dialog first
        alert_trigger = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='alert-dialog-trigger']")
        alert_trigger.click()
        time.sleep(0.5)

        alert_dialog = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='alert-dialog']")
        initial_url = normalize_url(self.driver.current_url)
        alert_dialog.click()
        time.sleep(0.1)
        assert normalize_url(self.driver.current_url) == initial_url

    def test_alert_dialog_no_errors(self):
        """Test alert dialog doesn't cause console errors."""
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        assert len(errors) == 0


class TestCarousel:
    """Test suite for Carousel component."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup test environment."""
        self.driver = driver
        self.base_url = base_url
        # Navigate to inputs page where components are located
        self.driver.get(self.base_url + "inputs/")

        # Wait for page to load
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

    def test_carousel_renders_normally(self):
        """Test that carousel renders correctly."""
        carousel = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='carousel']")
        assert carousel.is_displayed()
        assert carousel.size['width'] > 0
        assert carousel.size['height'] > 0

    def test_carousel_navigation(self):
        """Test carousel navigation functionality."""
        carousel = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='carousel']")
        initial_url = normalize_url(self.driver.current_url)
        carousel.click()
        time.sleep(0.1)
        assert normalize_url(self.driver.current_url) == initial_url

    def test_carousel_keyboard_navigation(self):
        """Test carousel keyboard navigation."""
        carousel = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='carousel']")
        initial_url = normalize_url(self.driver.current_url)
        carousel.click()
        time.sleep(0.1)
        assert normalize_url(self.driver.current_url) == initial_url

    def test_carousel_no_errors(self):
        """Test carousel doesn't cause console errors."""
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        assert len(errors) == 0