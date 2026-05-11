import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StageCell } from './StageCell';

const mockApp = { id: '1', stage: 'applied' };

describe('StageCell', () => {
  it('renders the stage label', () => {
    render(<StageCell app={mockApp} onUpdate={vi.fn()} />);
    expect(screen.getByText('Applied')).toBeInTheDocument();
  });

  it('opens the select dropdown on click', async () => {
    const user = userEvent.setup();
    render(<StageCell app={mockApp} onUpdate={vi.fn()} />);
    await user.click(screen.getByText('Applied'));
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls onUpdate when a new stage is selected', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(<StageCell app={mockApp} onUpdate={onUpdate} />);
    await user.click(screen.getByText('Applied'));
    await user.selectOptions(screen.getByRole('combobox'), 'interview');
    expect(onUpdate).toHaveBeenCalledWith('1', 'interview');
  });

  it('applies the correct stage CSS class', () => {
    render(<StageCell app={{ id: '2', stage: 'offer' }} onUpdate={vi.fn()} />);
    const badge = screen.getByText('Offer');
    expect(badge).toHaveClass('stage-offer');
  });
});
