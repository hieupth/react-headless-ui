import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import {
  Button, Badge, Alert, Switch, Checkbox, RadioGroup, Spinner,
  Separator, Progress, Card, Tabs, Accordion, Avatar, Label, Kbd,
} from '../src';

// Accessibility audit: each interactive component, rendered in a realistic
// minimal state, must pass axe with zero violations. Run with the rest of the
// suite. New violations here block the build (see CI).

const suppress = (consoleErr: unknown) => void consoleErr;
suppress(console.error); // silence React a11y-dev noise during render

async function expectNoViolations(ui: React.ReactElement) {
  const { container } = render(ui);
  const results = await axe(container);
  expect(results.violations).toEqual([]);
}

describe('a11y audit — interactive components', () => {
  it('Button', async () => {
    await expectNoViolations(<Button>Save</Button>);
  });
  it('Badge', async () => {
    await expectNoViolations(<Badge count={5}>Inbox</Badge>);
  });
  it('Alert', async () => {
    await expectNoViolations(<Alert>Saved successfully</Alert>);
  });
  it('Switch', async () => {
    await expectNoViolations(<Switch aria-label="Notifications" />);
  });
  it('Checkbox', async () => {
    await expectNoViolations(<Checkbox aria-label="Agree" />);
  });
  it('RadioGroup', async () => {
    await expectNoViolations(
      <RadioGroup aria-label="Color">
        <RadioGroup.Item value="r">Red</RadioGroup.Item>
        <RadioGroup.Item value="g">Green</RadioGroup.Item>
      </RadioGroup>
    );
  });
  it('Spinner', async () => {
    await expectNoViolations(<Spinner aria-label="Loading" />);
  });
  it('Separator', async () => {
    await expectNoViolations(<Separator />);
  });
  it('Progress', async () => {
    await expectNoViolations(<Progress value={40} aria-label="Upload" />);
  });
  it('Card', async () => {
    await expectNoViolations(<Card>Content</Card>);
  });
  it('Avatar', async () => {
    await expectNoViolations(<Avatar alt="User">U</Avatar>);
  });
  it('Label', async () => {
    await expectNoViolations(<Label>Name</Label>);
  });
  it('Kbd', async () => {
    await expectNoViolations(<Kbd>⌘</Kbd>);
  });
  it('Accordion', async () => {
    await expectNoViolations(
      <Accordion>
        <Accordion.Item value="a">
          <Accordion.Trigger>Section A</Accordion.Trigger>
          <Accordion.Content>Body A</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );
  });
  it('Tabs', async () => {
    await expectNoViolations(
      <Tabs>
        <Tabs.List>
          <Tabs.Trigger value="a">A</Tabs.Trigger>
          <Tabs.Trigger value="b">B</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Content A</Tabs.Content>
        <Tabs.Content value="b">Content B</Tabs.Content>
      </Tabs>
    );
  });
});
