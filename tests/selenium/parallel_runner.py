"""
Parallel test runner for Selenium tests.

Runs pytest on multiple test file batches in parallel processes and aggregates results.
"""

from __future__ import annotations

import argparse
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from subprocess import Popen
from typing import List


@dataclass
class BatchResult:
    """Structured result for a pytest batch."""

    index: int
    files: List[Path]
    return_code: int


def _discover_tests(root: Path, pattern: str) -> List[Path]:
    """Discover test files matching the glob pattern."""
    return sorted(root.glob(pattern))


def _split_batches(items: List[Path], workers: int) -> List[List[Path]]:
    """Split items into round-robin batches for workers."""
    batches = [[] for _ in range(workers)]
    for index, item in enumerate(items):
        batches[index % workers].append(item)
    return [batch for batch in batches if batch]


def _run_batch(index: int, files: List[Path], pytest_args: List[str]) -> BatchResult:
    """Run pytest for a batch of files and return the result."""
    command = ["pytest", *pytest_args, *[str(path) for path in files]]
    process = Popen(command)
    return BatchResult(index=index, files=files, return_code=process.wait())


def main() -> int:
    """Run Selenium tests in parallel processes and aggregate exit codes."""
    parser = argparse.ArgumentParser(description="Parallel Selenium pytest runner.")
    parser.add_argument(
        "--workers",
        type=int,
        default=min(os.cpu_count() or 2, 8),
        help="Number of parallel workers.",
    )
    parser.add_argument(
        "--pattern",
        type=str,
        default="test_*.py",
        help="Glob pattern for test files.",
    )
    parser.add_argument(
        "--pytest-args",
        type=str,
        default="-v",
        help="Extra arguments passed to pytest.",
    )
    args = parser.parse_args()

    root = Path(__file__).resolve().parent
    tests = _discover_tests(root, args.pattern)
    if not tests:
        print("No tests found matching pattern.", file=sys.stderr)
        return 1

    workers = max(1, args.workers)
    batches = _split_batches(tests, workers)
    pytest_args = args.pytest_args.split()

    results: List[BatchResult] = []
    processes: List[Popen] = []
    commands: List[BatchResult] = []
    for index, files in enumerate(batches):
        command = ["pytest", *pytest_args, *[str(path) for path in files]]
        process = Popen(command)
        processes.append(process)
        commands.append(BatchResult(index=index, files=files, return_code=0))

    for process, batch in zip(processes, commands):
        batch.return_code = process.wait()
        results.append(batch)

    failed = [result for result in results if result.return_code != 0]
    if failed:
        print("\nFailed batches:")
        for result in failed:
            file_list = ", ".join(path.name for path in result.files)
            print(f"- Batch {result.index}: {file_list}")
        return 1

    print("\nAll batches passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
