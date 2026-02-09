# React UI Forge - Production-Ready Headless UI

## Purpose
Build a headless React UI system inspired by Flutter patterns with production-grade testing, accessibility, and documentation. For detailed laws and implementation guidance, see the `.guide/` directory.

## Core Principles
- Composition over inheritance (Widget-style)
- Behavior mixins for reusable logic
- Immutable theme extensions
- Semantic-first accessibility
- Data-driven traversal rendering

## Source of Truth
All enforceable rules live in `.guide/QUALITY_LAWS.md`. This file is a short index only. If instructions conflict, `.guide/QUALITY_LAWS.md` is authoritative.

## Required References
- `.guide/QUALITY_LAWS.md` — non-negotiable laws
- `.guide/TESTING.md` — strict test cases, fixtures, and coverage rules
- `.guide/EXAMPLE_APP.md` — shadcn-style example app layout and UX expectations

## Quick Reminder
If a request conflicts with `.guide/QUALITY_LAWS.md`, the response must refuse and cite the law by ID.
