import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /clarity finance/i })).toBeInTheDocument();
});
