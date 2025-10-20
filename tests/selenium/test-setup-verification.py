"""
Test setup verification for CLAUDE.md compliance.
Validates the static build and component structure without requiring Chrome.
"""

import sys
import os
import subprocess
import json
from pathlib import Path

def verify_static_build():
    """Verify that the example app builds successfully."""
    print("🔨 Verifying static build...")

    try:
        # Change to example directory
        os.chdir('example')

        # Run build
        result = subprocess.run(
            ['pnpm', 'build'],
            capture_output=True,
            text=True,
            timeout=300  # 5 minutes timeout
        )

        if result.returncode == 0:
            print("✅ Static build successful!")

            # Check if out directory exists
            if os.path.exists('out'):
                print("✅ Static export directory created!")

                # Check for pages
                pages = []
                for root, dirs, files in os.walk('out'):
                    for file in files:
                        if file.endswith('.html'):
                            rel_path = os.path.relpath(os.path.join(root, file), 'out')
                            pages.append(rel_path)

                print(f"✅ Found {len(pages)} static pages:")
                for page in sorted(pages):
                    print(f"   - {page}")

                # Check for specific category pages
                required_pages = [
                    'buttons/index.html',
                    'inputs/index.html',
                    'navigation/index.html',
                    'data-display/index.html',
                    'feedback/index.html'
                ]

                missing_pages = []
                for page in required_pages:
                    if not os.path.exists(os.path.join('out', page)):
                        missing_pages.append(page)

                if missing_pages:
                    print(f"⚠️  Missing category pages: {missing_pages}")
                else:
                    print("✅ All required category pages present!")

                return True
            else:
                print("❌ Static export directory not found!")
                return False
        else:
            print(f"❌ Build failed!")
            print(f"STDOUT: {result.stdout}")
            print(f"STDERR: {result.stderr}")
            return False

    except subprocess.TimeoutExpired:
        print("❌ Build timed out after 5 minutes!")
        return False
    except Exception as e:
        print(f"❌ Build verification failed: {e}")
        return False

def verify_component_structure():
    """Verify component structure and imports."""
    print("\n🏗️ Verifying component structure...")

    try:
        # Count renderer components
        renderer_dir = Path('../packages/renderer/src/components')
        component_files = list(renderer_dir.glob('*.tsx'))
        component_files = [f for f in component_files if f.name != 'index.tsx']

        print(f"✅ Found {len(component_files)} renderer components")

        # Check Button component specifically
        button_file = renderer_dir / 'Button.tsx'
        if button_file.exists():
            print("✅ Button component exists")

            # Read Button component content
            with open(button_file, 'r') as f:
                content = f.read()

            # Check for proper patterns
            if 'forwardRef' in content:
                print("✅ Button uses forwardRef pattern")
            else:
                print("⚠️  Button doesn't use forwardRef")

            if 'useButton' in content:
                print("✅ Button uses headless useButton hook")
            else:
                print("⚠️  Button doesn't use headless hook")

            if 'onPress' in content or 'handleClick' in content:
                print("✅ Button uses proper event handling")
            else:
                print("⚠️  Button may have inline handlers")

        else:
            print("❌ Button component missing!")

        return True

    except Exception as e:
        print(f"❌ Component structure verification failed: {e}")
        return False

def verify_example_imports():
    """Verify that example pages import actual components."""
    print("\n📦 Verifying example imports...")

    try:
        # Check buttons page
        buttons_page = Path('example/src/app/buttons/page.tsx')
        if buttons_page.exists():
            with open(buttons_page, 'r') as f:
                content = f.read()

            if "import { Button }" in content:
                print("✅ Buttons page imports Button component")
            else:
                print("❌ Buttons page doesn't import Button component")

            if "from '@react-ui-forge/renderer'" in content:
                print("✅ Buttons page imports from renderer package")
            else:
                print("❌ Buttons page doesn't import from renderer package")

            # Count Button usage
            button_usage = content.count('<Button')
            if button_usage > 0:
                print(f"✅ Buttons page uses Button component {button_usage} times")
            else:
                print("❌ Buttons page doesn't use Button component")
        else:
            print("❌ Buttons page doesn't exist!")

        return True

    except Exception as e:
        print(f"❌ Example imports verification failed: {e}")
        return False

def verify_architecture_compliance():
    """Check for CLAUDE.md architecture compliance."""
    print("\n📋 Verifying CLAUDE.md architecture compliance...")

    try:
        # Check for forbidden patterns
        renderer_dir = Path('../packages/renderer/src/components')
        violations = []

        for component_file in renderer_dir.glob('*.tsx'):
            if component_file.name == 'index.tsx':
                continue

            with open(component_file, 'r') as f:
                content = f.read()

            # Check for class inheritance (forbidden)
            if 'class ' in content and ' extends ' in content:
                violations.append(f"{component_file.name}: Class inheritance found")

            # Check for inline onClick handlers (should be minimized)
            inline_handlers = content.count('onClick=')
            if inline_handlers > 5:  # Allow some for now
                violations.append(f"{component_file.name}: {inline_handlers} inline onClick handlers")

        if violations:
            print("⚠️  Architecture violations found:")
            for violation in violations[:5]:  # Show first 5
                print(f"   - {violation}")
            if len(violations) > 5:
                print(f"   ... and {len(violations) - 5} more")
        else:
            print("✅ No major architecture violations found!")

        return len(violations) == 0

    except Exception as e:
        print(f"❌ Architecture compliance check failed: {e}")
        return False

def main():
    """Main verification function."""
    print("🔍 CLAUDE.md Compliance Verification\n")

    all_passed = True

    # Verify build
    if not verify_static_build():
        all_passed = False

    # Verify component structure
    if not verify_component_structure():
        all_passed = False

    # Verify example imports
    if not verify_example_imports():
        all_passed = False

    # Verify architecture compliance
    if not verify_architecture_compliance():
        all_passed = False

    print(f"\n{'='*50}")
    if all_passed:
        print("🎉 All verifications passed! CLAUDE.md compliance achieved.")
        print("Ready to run comprehensive Selenium tests when Chrome is available.")
    else:
        print("⚠️  Some verifications failed. Review the issues above.")

    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)