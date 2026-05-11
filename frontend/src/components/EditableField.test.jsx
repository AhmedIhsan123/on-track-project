import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableField } from './EditableField';

describe('EditableField', () => {
  it('renders the label and value', () => {
    render(<EditableField label="Company" name="company_name" value="Acme" onSave={vi.fn()} />);
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Acme')).toBeInTheDocument();
  });

  it('shows placeholder when value is empty', () => {
    render(<EditableField label="Notes" name="notes" value="" onSave={vi.fn()} placeholder="Add notes" />);
    expect(screen.getByText('Add notes')).toBeInTheDocument();
  });

  it('switches to input on click', async () => {
    const user = userEvent.setup();
    render(<EditableField label="Company" name="company_name" value="Acme" onSave={vi.fn()} />);
    await user.click(screen.getByText('Acme'));
    expect(screen.getByDisplayValue('Acme')).toBeInTheDocument();
  });

  it('calls onSave with the new value on blur', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<EditableField label="Company" name="company_name" value="Acme" onSave={onSave} />);
    await user.click(screen.getByText('Acme'));
    const input = screen.getByDisplayValue('Acme');
    await user.clear(input);
    await user.type(input, 'NewCo');
    await user.tab();
    await waitFor(() => expect(onSave).toHaveBeenCalledWith('company_name', 'NewCo'));
  });

  it('does not call onSave when value is unchanged', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EditableField label="Company" name="company_name" value="Acme" onSave={onSave} />);
    await user.click(screen.getByText('Acme'));
    await user.tab();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('reverts to original value on Escape', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EditableField label="Company" name="company_name" value="Acme" onSave={onSave} />);
    await user.click(screen.getByText('Acme'));
    await user.clear(screen.getByDisplayValue('Acme'));
    await user.type(screen.getByRole('textbox'), 'Changed');
    await user.keyboard('{Escape}');
    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});
