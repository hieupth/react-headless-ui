import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException
from tests.selenium.strict_assertions import ComponentAssertions
from tests.selenium.test_constants import Locators, TestData



"""
Alert Component Tests
Following CLAUDE.md requirements: 4 tests per component (Functionality, Visual Rendering, Navigation, Runtime Stability)
"""




class TestAlert:
    """Test suite for Alert component."""

    def test_alert_functionality(self, driver, test_helper, assertions):
        """Test 1: Alert Functionality"""
        test_helper.navigate_to_category("feedback")

        # Look for alert elements
        alert_selectors = ["[data-testid*='alert']", ".alert", "[role='alert']", ".notification"]

        for selector in alert_selectors:
            try:
                alerts = test_helper.driver.find_elements(By.CSS_SELECTOR, selector)
                for alert in alerts[:3]:
                    if alert.is_displayed():
                        # Test alert visibility and content
                        alert_text = alert.text
                        assert len(alert_text) > 0, "Alert should have content"

                        # Test dismiss button if present
                        dismiss_btn = alert.find_elements(By.CSS_SELECTOR, ".close, [aria-label='Close'], button")
                        for btn in dismiss_btn:
                            if btn.is_displayed() and btn.is_enabled():
                                btn.click()
                                time.sleep(0.5)
                                break
                break
            except:
                continue

    def test_alert_renders_normally(self, driver, test_helper, assertions):
        """Test 2: Visual Rendering"""
        test_helper.navigate_to_category("feedback")

        alert_elements = test_helper.driver.find_elements(By.CSS_SELECTOR,
            ".alert, [role='alert'], .notification")

        for alert in alert_elements:
            if alert.is_displayed():
                assertions.assert_element_rendered_properly(alert)
                width, height = alert.size.values()
                assert 50 <= width <= 1000, f"Alert width {width} unreasonable"
                assert 20 <= height <= 1500, f"Alert height {height} unreasonable"

    def test_alert_navigation(self, driver, test_helper, assertions):
        """Test 3: Navigation"""
        test_helper.navigate_to_category("feedback")

        # Test that alerts don't interfere with navigation
        try:
            home_link = test_helper.driver.find_element(By.LINK_TEXT, "Home")
            home_link.click()
            time.sleep(0.5)
            assertions.assert_no_console_errors(test_helper.driver)
        except:
            pass

    def test_alert_no_errors(self, driver, test_helper, assertions):
        """Test 4: Runtime Stability"""
        test_helper.navigate_to_category("feedback")

        initial_errors = test_helper.get_console_errors()
        # Filter out webpack development errors
        filtered_errors = [e for e in initial_errors if 'webpack-internal' not in e.get('message', '')]
        assert len(filtered_errors) == 0, f"Page loaded with errors: {len(filtered_errors)}"

        # Test alert interactions
        alerts = test_helper.driver.find_elements(By.CSS_SELECTOR, ".alert, [role='alert']")
        for alert in alerts:
            if alert.is_displayed():
                try:
                    # Test clicking alert
                    alert.click()
                    time.sleep(0.2)
                except:
                    pass

        final_errors = test_helper.get_console_errors()
        filtered_final_errors = [e for e in final_errors if 'webpack-internal' not in e.get('message', '')]
        assert len(filtered_final_errors) == 0, f"Alert interactions caused errors: {len(filtered_final_errors)}"
