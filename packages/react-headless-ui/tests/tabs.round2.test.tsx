import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tabs, Tab, TabPanel } from '../src/components/Tabs';

// Round-2 fix: the exported Tab/TabPanel components used to be silently
// dropped when composed under <Tabs> (only Tabs.List/Trigger/Content were
// recognized), rendering empty tab list and content containers.
describe('Tabs composed with exported Tab/TabPanel (round-2)', () => {
  it('derives items and content from <Tab> children', () => {
    render(
      <Tabs defaultValue="Alpha">
        <Tab label="Alpha">Alpha body</Tab>
        <Tab label="Bravo">Bravo body</Tab>
      </Tabs>
    );
    expect(screen.getByRole('tab', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Bravo' })).toBeInTheDocument();
    expect(screen.getByText('Alpha body')).toBeInTheDocument();
    expect(screen.getByText('Bravo body')).toBeInTheDocument();
  });

  it('matches <TabPanel> children to tabs positionally', () => {
    render(
      <Tabs defaultValue="Alpha">
        <Tab label="Alpha" />
        <Tab label="Bravo" />
        <TabPanel>Alpha panel</TabPanel>
        <TabPanel>Bravo panel</TabPanel>
      </Tabs>
    );
    expect(screen.getByText('Alpha panel')).toBeInTheDocument();
    expect(screen.getByText('Bravo panel')).toBeInTheDocument();
  });

  it('forwards Tab disabled/icon/badge fields onto the derived item', () => {
    render(
      <Tabs defaultValue="Alpha">
        <Tab label="Alpha">Alpha body</Tab>
        <Tab label="Bravo" disabled badge={3}>Bravo body</Tab>
      </Tabs>
    );
    expect(screen.getByRole('tab', { name: /Bravo/ })).toBeDisabled();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
