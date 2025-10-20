"""
Setup script for Selenium tests with automatic ChromeDriver management.
Follows CLAUDE.md requirements for comprehensive testing.
"""

import sys
import subprocess
import time
import os

def install_requirements():
    """Install required Python packages."""
    packages = [
        'pytest>=8.4.0',
        'selenium>=4.37.0',
        'webdriver-manager>=4.0.0'
    ]

    for package in packages:
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
        print(f"✓ {package} installed successfully")

def setup_chrome_driver():
    """Test ChromeDriver setup using webdriver-manager."""
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.service import Service
        from webdriver_manager.chrome import ChromeDriverManager
        from selenium.webdriver.chrome.options import Options

        print("Setting up ChromeDriver automatically...")

        # Configure Chrome options for headless testing
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1280,720')

        # Install and configure ChromeDriver automatically
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)

        # Test the driver
        driver.get("https://www.google.com")
        title = driver.title
        print(f"✓ ChromeDriver setup successful! Google title: {title}")

        driver.quit()
        return True

    except Exception as e:
        print(f"❌ ChromeDriver setup failed: {e}")
        return False

def start_example_app():
    """Start the example app for testing."""
    try:
        print("Starting example app...")
        # Change to example directory and start dev server
        os.chdir('example')

        # Start the development server in background
        process = subprocess.Popen(
            [sys.executable, '-m', 'http.server', '3000'],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )

        # Wait for server to start
        time.sleep(3)

        # Check if server is running
        try:
            import urllib.request
            response = urllib.request.urlopen('http://localhost:3000')
            if response.getcode() == 200:
                print("✓ Example app is running on http://localhost:3000")
                return process
        except:
            pass

        # Try with Next.js dev server
        process.terminate()
        process = subprocess.Popen(
            ['pnpm', 'dev'],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )

        # Wait longer for Next.js
        time.sleep(10)

        try:
            import urllib.request
            response = urllib.request.urlopen('http://localhost:3000')
            if response.getcode() == 200:
                print("✓ Next.js example app is running on http://localhost:3000")
                return process
        except:
            pass

        process.terminate()
        print("❌ Failed to start example app")
        return None

    except Exception as e:
        print(f"❌ Failed to start example app: {e}")
        return None

def main():
    """Main setup function."""
    print("🚀 Setting up Selenium test environment for CLAUDE.md compliance...")

    # Step 1: Install requirements
    print("\n📦 Installing Python packages...")
    install_requirements()

    # Step 2: Setup ChromeDriver
    print("\n🌐 Setting up ChromeDriver...")
    if not setup_chrome_driver():
        print("❌ ChromeDriver setup failed. Cannot proceed with tests.")
        return False

    # Step 3: Start example app
    print("\n🏗️ Starting example application...")
    app_process = start_example_app()
    if not app_process:
        print("❌ Failed to start example app. Cannot proceed with tests.")
        return False

    print("\n✅ Test environment setup complete!")
    print("You can now run: python -m pytest tests/selenium/ --all -v")

    # Keep the app running
    try:
        print("Press Ctrl+C to stop the example app...")
        app_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Stopping example app...")
        app_process.terminate()
        app_process.wait()

    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)