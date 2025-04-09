import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import App from './App';
import { AuthProvider } from './context/AuthProvider';

const MockApp = () => (
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>
);

describe('App Component', () => {
  test('redirects unauthenticated users to login', async () => {
    render(<MockApp />);
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });

  test('renders dashboard after successful login', async () => {
    // Mock implementation
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => 'fake-token');
    
    render(<MockApp />);
    
    await waitFor(() => {
      expect(screen.getByText(/panoramica finanziaria/i)).toBeInTheDocument();
    });
  });

  test('shows 404 page for unknown routes', async () => {
    window.history.pushState({}, '', '/invalid-route');
    
    render(<MockApp />);
    
    expect(await screen.findByText(/404/i)).toBeInTheDocument();
  });

  test('handles errors with error boundary', async () => {
    const ErrorComponent = () => {
      throw new Error('Test Error');
    };
    
    render(
      <BrowserRouter>
        <App>
          <ErrorComponent />
        </App>
      </BrowserRouter>
    );
    
    expect(await screen.findByText(/500/i)).toBeInTheDocument();
  });
});
