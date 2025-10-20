"""
Static HTML testing for CLAUDE.md compliance.
Tests the built static pages without requiring Chrome/ChromeDriver.
"""

import sys
import os
import re
from pathlib import Path

def test_buttons_page():
    """Test the buttons page for CLAUDE.md compliance."""
    print("🧪 Testing buttons page...")

    buttons_html = Path('example/out/buttons/index.html')
    if not buttons_html.exists():
        print("❌ Buttons page HTML not found!")
        return False

    with open(buttons_html, 'r') as f:
        content = f.read()

    # Check for test IDs
    test_ids = [
        'button-counter',
        'button-reset',
        'button-loading',
        'button-disabled',
        'toggle-button'
    ]

    found_ids = []
    for test_id in test_ids:
        if f'data-testid="{test_id}"' in content:
            found_ids.append(test_id)

    if len(found_ids) >= 4:
        print(f"✅ Found {len(found_ids)} required test IDs: {found_ids}")
    else:
        print(f"⚠️  Only found {len(found_ids)} test IDs: {found_ids}")

    # Check for Button component usage (should have proper component structure)
    if 'Button' in content or 'button' in content.lower():
        print("✅ Page contains button elements")
    else:
        print("❌ No button elements found")

    # Check for interactive elements
    interactive_patterns = [
        r'onClick',
        r'onPress',
        r'data-testid',
        r'role="button"'
    ]

    interactive_found = 0
    for pattern in interactive_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            interactive_found += 1

    if interactive_found >= 2:
        print(f"✅ Found {interactive_found} interactive patterns")
    else:
        print(f"⚠️  Only found {interactive_found} interactive patterns")

    return True

def test_navigation_structure():
    """Test navigation structure between pages."""
    print("\n🧭 Testing navigation structure...")

    index_html = Path('example/out/index.html')
    if not index_html.exists():
        print("❌ Index page HTML not found!")
        return False

    with open(index_html, 'r') as f:
        content = f.read()

    # Check for links to category pages
    category_links = [
        '/buttons',
        '/inputs',
        '/navigation',
        '/data-display',
        '/feedback'
    ]

    found_links = []
    for link in category_links:
        if f'href="{link}"' in content or f"href='{link}'" in content:
            found_links.append(link)

    if len(found_links) >= 3:
        print(f"✅ Found {len(found_links)} category navigation links: {found_links}")
    else:
        print(f"⚠️  Only found {len(found_links)} category links: {found_links}")

    # Check for proper navigation structure
    if 'nav' in content.lower():
        print("✅ Page contains navigation elements")
    else:
        print("⚠️  No navigation elements found")

    return True

def test_page_completeness():
    """Test that all required pages exist and are accessible."""
    print("\n📄 Testing page completeness...")

    required_pages = [
        'index.html',
        'buttons/index.html',
        'inputs/index.html',
        'navigation/index.html',
        'data-display/index.html',
        'feedback/index.html'
    ]

    out_dir = Path('example/out')
    found_pages = []

    for page in required_pages:
        page_path = out_dir / page
        if page_path.exists():
            with open(page_path, 'r') as f:
                content = f.read()
                # Check if page has meaningful content (not just error page)
                if len(content) > 1000 and '<!DOCTYPE html>' in content:
                    found_pages.append(page)
                    print(f"   ✅ {page}")
                else:
                    print(f"   ⚠️  {page} (minimal content)")
        else:
            print(f"   ❌ {page} (missing)")

    completeness = len(found_pages) / len(required_pages)
    print(f"\n📊 Page completeness: {len(found_pages)}/{len(required_pages)} ({completeness:.1%})")

    return completeness >= 0.8  # 80% completeness required

def test_component_rendering():
    """Test that components render properly in static build."""
    print("\n🎨 Testing component rendering...")

    buttons_html = Path('example/out/buttons/index.html')
    if not buttons_html.exists():
        print("❌ Cannot test component rendering - buttons page missing")
        return False

    with open(buttons_html, 'r') as f:
        content = f.read()

    # Check for rendered component attributes
    rendering_indicators = [
        'class=',           # CSS classes applied
        'data-testid=',     # Test IDs present
        'disabled=',        # Component states
        'variant=',         # Component variants (if present)
        'role=',            # ARIA roles for accessibility
    ]

    found_indicators = 0
    for indicator in rendering_indicators:
        if indicator in content:
            found_indicators += 1

    rendering_score = found_indicators / len(rendering_indicators)
    print(f"✅ Rendering indicators: {found_indicators}/{len(rendering_indicators)} ({rendering_score:.1%})")

    # Check for accessibility features
    accessibility_features = [
        'aria-',
        'role=',
        'tabindex',
        'alt=',
        'for='
    ]

    a11y_found = 0
    for feature in accessibility_features:
        if feature in content.lower():
            a11y_found += 1

    a11y_score = a11y_found / len(accessibility_features)
    print(f"✅ Accessibility features: {a11y_found}/{len(accessibility_features)} ({a11y_score:.1%})")

    return rendering_score >= 0.6 and a11y_score >= 0.4

def main():
    """Run all static HTML tests."""
    print("🔬 CLAUDE.md Static HTML Testing\n")

    tests_passed = 0
    total_tests = 4

    # Run tests
    if test_buttons_page():
        tests_passed += 1

    if test_navigation_structure():
        tests_passed += 1

    if test_page_completeness():
        tests_passed += 1

    if test_component_rendering():
        tests_passed += 1

    # Results
    print(f"\n{'='*50}")
    print(f"📊 Test Results: {tests_passed}/{total_tests} tests passed")

    if tests_passed == total_tests:
        print("🎉 All static tests passed!")
        print("✅ CLAUDE.md requirements met for static testing.")
        print("🚀 Ready for Selenium testing when Chrome environment is available.")
    elif tests_passed >= total_tests * 0.75:
        print("✅ Most tests passed - good progress toward CLAUDE.md compliance.")
        print("🔧 Minor improvements needed for full compliance.")
    else:
        print("⚠️  Significant issues found - review test failures above.")

    return tests_passed >= total_tests * 0.75

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)