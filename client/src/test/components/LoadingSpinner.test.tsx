import { render, screen } from '@testing-library/react';
import LoadingSpinner from '@/components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');

    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-6', 'h-6'); // default size 'md'
  });

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = screen.getByRole('status');

    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole('status');

    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('has correct accessibility attributes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');

    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    const spinner = screen.getByRole('status');

    expect(spinner).toHaveClass('custom-class');
  });
});