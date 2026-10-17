import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CostCalculator from '@/components/Home/CostCalculator/CostCalculator';
import { useRouter } from 'next/navigation';

describe('CostCalculator Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <CostCalculator />
      </QueryClientProvider>,
    );

  it('renders heading and initial controls properly', () => {
    renderComponent();

    expect(screen.getByText('Calculate your shipping cost')).toBeInTheDocument();
    expect(screen.getByText('Parcel Weight')).toBeInTheDocument();
    expect(screen.getByText('Service Type')).toBeInTheDocument();
    expect(screen.getByText('Ship Parcel')).toBeInTheDocument();
  });

  it('allows changing parcel weight via slider and updates total cost', () => {
    renderComponent();

    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider).toBeInTheDocument();
    expect(slider.value).toBe('1');

    // Simulate dragging slider to 5 KG
    fireEvent.change(slider, { target: { value: '5' } });
    expect(slider.value).toBe('5');

    // Base cost for 5kg: 50 + (5 - 1) * 20 = 130 BDT
    expect(screen.getByText('৳130')).toBeInTheDocument();
  });

  it('toggles between Regular and Express shipping and applies multiplier', () => {
    renderComponent();

    const regularBtn = screen.getByRole('button', { name: /regular/i });
    const expressBtn = screen.getByRole('button', { name: /express/i });

    // Click Express button with default 1 KG parcel (50 * 1.5 = 75 BDT)
    fireEvent.click(expressBtn);
    expect(screen.getByText('৳75')).toBeInTheDocument();

    // Click Regular button to return to base fee (50 BDT)
    fireEvent.click(regularBtn);
    expect(screen.getByText('৳50')).toBeInTheDocument();
  });

  it('navigates to addParcel with prefilled query parameters on Ship Parcel click', () => {
    renderComponent();

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '3' } }); // 50 + 2 * 20 = 90 BDT

    const shipBtn = screen.getByRole('button', { name: /ship parcel/i });
    fireEvent.click(shipBtn);

    const router = useRouter();
    expect(router.push).toHaveBeenCalledWith(
      '/addParcel?predefinedWeight=3&predefinedType=regular&estimatedCost=90',
    );
  });
});
