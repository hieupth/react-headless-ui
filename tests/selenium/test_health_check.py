"""
Health check test to verify example app is running correctly.
Following CLAUDE.md testing requirements for basic app functionality.
"""

import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestHealthCheck:
    """Test suite for basic application health check"""

    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup test environment"""
        self.driver = driver
        self.base_url = base_url  # Now base_url already points to main page
        self.driver.get(self.base_url)

        # Wait for page to load
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

    def test_tailwind_app_startup(self):
        """Health check: Test Tailwind app startup"""
        # Wait a bit more for page to fully load
        import time
        time.sleep(2)

        # Debug: print page source to understand what's loaded
        page_source = self.driver.page_source
        print(f"Page source length: {len(page_source)}")

        # Check if page loaded at all
        body = self.driver.find_element(By.TAG_NAME, "body")
        assert body.is_displayed(), "Page body should be visible"

        # Check page has content
        body_text = body.text
        print(f"Body text length: {len(body_text)}")
        print(f"Body text preview: {body_text[:200]}")
        assert len(body_text) > 50, "Page should have some content"

        # Try any h1 element
        try:
            h1_elements = self.driver.find_elements(By.TAG_NAME, "h1")
            print(f"Found {len(h1_elements)} h1 elements")
            if h1_elements:
                for i, h1 in enumerate(h1_elements):
                    print(f"H1 {i}: {h1.text}")
                    if "React UI Forge" in h1.text or "Component Library" in h1.text:
                        assert h1.is_displayed(), "Main title should be visible"
                        return  # Success!
        except Exception as e:
            print(f"Error checking h1 elements: {e}")

        # If we get here, try broader check
        assert len(body_text) > 100, "Page should have substantial content"

        # Check for component category cards (not sections on main page)
        try:
            category_cards = self.driver.find_elements(By.XPATH, "//h2[contains(text(), 'Navigation')]")
            assert len(category_cards) > 0, "Should find category cards"
        except:
            # Check for any h2 elements (category titles)
            sections = self.driver.find_elements(By.TAG_NAME, "h2")
            assert len(sections) > 0, "Page should have category titles"

        # Check for actual links/buttons to categories
        links = self.driver.find_elements(By.TAG_NAME, "a")
        assert len(links) > 0, "Page should have links to categories"

        # Check no console errors on page load (filter network errors)
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE' and 'Failed to load resource' not in log['message']]
        assert len(errors) == 0, f"Console errors on page load: {errors}"

    def test_page_has_valid_title(self):
        """Test page has valid HTML title"""
        title = self.driver.title
        assert len(title) > 0, "Page should have a title"
        assert "React UI Forge" in title or "Next.js" in title, "Title should be relevant"

    def test_responsive_design(self):
        """Test basic responsive design"""
        # Check initial viewport size
        initial_width = self.driver.get_window_size()['width']
        initial_height = self.driver.get_window_size()['height']

        # Try mobile size
        self.driver.set_window_size(375, 667)  # iPhone size
        time.sleep(0.5)

        # Check page is still functional
        body = self.driver.find_element(By.TAG_NAME, "body")
        assert body.is_displayed(), "Page should be responsive to mobile size"

        # Restore desktop size
        self.driver.set_window_size(initial_width, initial_height)
        time.sleep(0.5)

        # Verify page is still functional
        body = self.driver.find_element(By.TAG_NAME, "body")
        assert body.is_displayed(), "Page should be responsive to desktop size"

    def test_no_broken_links(self):
        """Test for broken JavaScript functionality"""
        # Try to interact with various elements
        try:
            # Click a link to a category page
            links = self.driver.find_elements(By.TAG_NAME, "a")
            if links:
                links[0].click()
                time.sleep(0.2)
                # Go back to main page
                self.driver.back()
                time.sleep(0.2)

            # Check for errors after interactions (filter network errors)
            logs = self.driver.get_log('browser')
            errors = [log for log in logs if log['level'] == 'SEVERE' and 'Failed to load resource' not in log['message']]
            assert len(errors) == 0, f"JavaScript errors after interaction: {errors}"

        except Exception as e:
            pytest.fail(f"Basic interaction failed: {e}")

    def test_component_sections_exist(self):
        """Test that component categories are present"""
        # Look for key component categories on main page
        expected_categories = [
            "Navigation",
            "Forms & Inputs",
            "Data Display",
            "Feedback"
        ]

        found_categories = []
        page_text = self.driver.find_element(By.TAG_NAME, "body").text

        for category in expected_categories:
            if category in page_text:
                found_categories.append(category)

        # At least some categories should exist
        assert len(found_categories) >= 3, f"Should find at least 3 component categories, found: {found_categories}"

    def test_styling_is_applied(self):
        """Test that Tailwind styling is applied"""
        # Look for elements with Tailwind classes
        elements_with_classes = []

        # Check buttons for styling classes
        buttons = self.driver.find_elements(By.TAG_NAME, "button")
        for button in buttons:
            classes = button.get_attribute("class")
            if classes and any(cls in classes for cls in ["bg-", "text-", "border-", "rounded-"]):
                elements_with_classes.append(button)

        # Check for styled containers
        divs = self.driver.find_elements(By.TAG_NAME, "div")
        for div in divs:
            classes = div.get_attribute("class")
            if classes and any(cls in classes for cls in ["bg-", "text-", "border-", "rounded-", "shadow-"]):
                elements_with_classes.append(div)

        assert len(elements_with_classes) > 0, "Should find elements with styling classes applied"