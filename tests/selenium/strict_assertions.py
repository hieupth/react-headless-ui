"""
Strict assertion helpers for Selenium component tests.
"""

from __future__ import annotations


class ComponentAssertions:
    """Custom assertion methods for strict component testing."""

    NOISE_PATTERNS = (
        "favicon.ico",
        "webpack-internal",
        "DevTools failed to load",
        "chrome-extension",
        "Failed to load resource: net::ERR_FAILED",
    )

    @staticmethod
    def assert_element_rendered_properly(element):
        """Assert element renders without visual abnormalities."""
        assert element.is_displayed(), "Element should be visible"

        size = element.size
        assert size["width"] > 0, "Element should have positive width"
        assert size["height"] > 0, "Element should have positive height"

        # Check for reasonable size limits (not too large or too small)
        assert size["width"] < 4000, "Element width seems abnormally large"
        assert size["height"] < 3000, "Element height seems abnormally large"

        driver = element._parent
        viewport = driver.execute_script(
            "return { width: window.innerWidth, height: window.innerHeight };"
        )
        location = element.location_once_scrolled_into_view
        assert location["x"] + size["width"] <= viewport["width"] + 100, (
            "Element should be within viewport bounds"
        )
        assert location["y"] + size["height"] <= viewport["height"] + 2000, (
            "Element should not be rendered far outside viewport"
        )

        computed = driver.execute_script(
            """
            const el = arguments[0];
            const style = window.getComputedStyle(el);
            return {
              display: style.display,
              visibility: style.visibility,
              opacity: style.opacity,
            };
            """,
            element,
        )
        assert computed["display"] != "none", "Element should not be display:none"
        assert computed["visibility"] != "hidden", "Element should not be hidden"
        assert float(computed["opacity"]) > 0, "Element should not be transparent"

        tag_name = (element.tag_name or "").lower()
        role = (element.get_attribute("role") or "").lower()
        interactive_tags = {"button", "a", "input", "textarea", "select"}
        interactive_roles = {
            "button",
            "link",
            "textbox",
            "checkbox",
            "radio",
            "switch",
            "combobox",
            "menuitem",
            "tab",
            "option",
        }
        if tag_name in interactive_tags or role in interactive_roles:
            ComponentAssertions.assert_accessible_name(element)

    @staticmethod
    def assert_accessible_name(element):
        """Assert element has an accessible name."""
        aria_label = element.get_attribute("aria-label") or ""
        labelledby = element.get_attribute("aria-labelledby") or ""
        text_content = (element.text or "").strip()
        title = element.get_attribute("title") or ""

        if labelledby:
            driver = element._parent
            labelled_elements = [
                label.strip()
                for label in labelledby.split(" ")
                if label.strip()
            ]
            labelled_text = []
            for label_id in labelled_elements:
                label_el = driver.find_element("id", label_id)
                labelled_text.append(label_el.text.strip())
            text_content = " ".join(labelled_text).strip()

        assert (
            aria_label.strip()
            or text_content
            or title.strip()
        ), "Element should have an accessible name"

    @classmethod
    def _filtered_logs(cls, logs):
        return [
            log
            for log in logs
            if log.get("level") in {"SEVERE", "WARNING"}
            and not any(pattern in log.get("message", "") for pattern in cls.NOISE_PATTERNS)
        ]

    @classmethod
    def assert_no_console_errors(cls, driver):
        """Assert no JavaScript console errors."""
        logs = driver.get_log("browser")
        errors = cls._filtered_logs(logs)

        if errors:
            error_messages = [error["message"] for error in errors]
            assert False, f"JavaScript console issues detected: {error_messages}"

    @classmethod
    def assert_no_js_exceptions(cls, driver):
        """Assert no JavaScript exceptions were thrown."""
        logs = driver.get_log("browser")
        exceptions = [
            log
            for log in cls._filtered_logs(logs)
            if "Uncaught" in log.get("message", "")
        ]
        if exceptions:
            messages = [log["message"] for log in exceptions]
            assert False, f"JavaScript exceptions detected: {messages}"

    @classmethod
    def assert_navigation_works(cls, driver, expected_url_fragment):
        """Assert navigation works without errors."""
        ready_state = driver.execute_script("return document.readyState;")
        assert ready_state == "complete", f"Expected readyState complete, got {ready_state}"

        current_url = driver.current_url
        assert expected_url_fragment in current_url, (
            f"Expected URL fragment '{expected_url_fragment}' not found in '{current_url}'"
        )

        cls.assert_no_console_errors(driver)
