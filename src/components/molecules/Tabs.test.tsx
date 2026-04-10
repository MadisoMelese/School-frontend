import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs } from './Tabs';

const tabs = [
  { id: 'tab1', label: 'Tab 1', content: 'Content 1' },
  { id: 'tab2', label: 'Tab 2', content: 'Content 2' },
  { id: 'tab3', label: 'Tab 3', content: 'Content 3' },
];

describe('Tabs Component', () => {
  it('renders all tab labels', () => {
    render(<Tabs tabs={tabs} activeTab="tab1" onChange={vi.fn()} />);

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });

  it('displays content of active tab', () => {
    render(<Tabs tabs={tabs} activeTab="tab1" onChange={vi.fn()} />);

    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('calls onChange when tab is clicked', () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} activeTab="tab1" onChange={onChange} />);

    fireEvent.click(screen.getByText('Tab 2'));
    expect(onChange).toHaveBeenCalledWith('tab2');
  });

  it('updates content when activeTab changes', () => {
    const { rerender } = render(<Tabs tabs={tabs} activeTab="tab1" onChange={vi.fn()} />);

    expect(screen.getByText('Content 1')).toBeInTheDocument();

    rerender(<Tabs tabs={tabs} activeTab="tab2" onChange={vi.fn()} />);

    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('navigates tabs with arrow keys', () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} activeTab="tab1" onChange={onChange} />);

    const tab1 = screen.getByText('Tab 1').closest('button');
    fireEvent.keyDown(tab1!, { key: 'ArrowRight' });

    expect(onChange).toHaveBeenCalledWith('tab2');
  });

  it('navigates to previous tab with ArrowLeft', () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} activeTab="tab2" onChange={onChange} />);

    const tab2 = screen.getByText('Tab 2').closest('button');
    fireEvent.keyDown(tab2!, { key: 'ArrowLeft' });

    expect(onChange).toHaveBeenCalledWith('tab1');
  });

  it('wraps to last tab when pressing ArrowLeft on first tab', () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} activeTab="tab1" onChange={onChange} />);

    const tab1 = screen.getByText('Tab 1').closest('button');
    fireEvent.keyDown(tab1!, { key: 'ArrowLeft' });

    expect(onChange).toHaveBeenCalledWith('tab3');
  });

  it('goes to first tab with Home key', () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} activeTab="tab3" onChange={onChange} />);

    const tab3 = screen.getByText('Tab 3').closest('button');
    fireEvent.keyDown(tab3!, { key: 'Home' });

    expect(onChange).toHaveBeenCalledWith('tab1');
  });

  it('goes to last tab with End key', () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} activeTab="tab1" onChange={onChange} />);

    const tab1 = screen.getByText('Tab 1').closest('button');
    fireEvent.keyDown(tab1!, { key: 'End' });

    expect(onChange).toHaveBeenCalledWith('tab3');
  });

  it('disables disabled tabs', () => {
    const disabledTabs = [
      { id: 'tab1', label: 'Tab 1', content: 'Content 1' },
      { id: 'tab2', label: 'Tab 2', content: 'Content 2', disabled: true },
    ];

    render(<Tabs tabs={disabledTabs} activeTab="tab1" onChange={vi.fn()} />);

    const tab2 = screen.getByText('Tab 2').closest('button');
    expect(tab2).toBeDisabled();
  });

  it('applies line variant styles', () => {
    render(<Tabs tabs={tabs} activeTab="tab1" onChange={vi.fn()} variant="line" />);

    const activeTab = screen.getByText('Tab 1').closest('button');
    expect(activeTab).toHaveClass('border-b-2');
  });

  it('applies pill variant styles', () => {
    render(<Tabs tabs={tabs} activeTab="tab1" onChange={vi.fn()} variant="pill" />);

    const activeTab = screen.getByText('Tab 1').closest('button');
    expect(activeTab).toHaveClass('bg-white');
  });

  it('has proper accessibility attributes', () => {
    render(<Tabs tabs={tabs} activeTab="tab1" onChange={vi.fn()} />);

    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();

    const activeTab = screen.getByText('Tab 1').closest('button');
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
  });

  it('renders tab icons when provided', () => {
    const tabsWithIcons = [
      { id: 'tab1', label: 'Tab 1', content: 'Content 1', icon: <span>Icon1</span> },
    ];

    render(<Tabs tabs={tabsWithIcons} activeTab="tab1" onChange={vi.fn()} />);

    expect(screen.getByText('Icon1')).toBeInTheDocument();
  });
});
