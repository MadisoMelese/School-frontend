import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { apiClient } from '@services/api/client';
import SchoolInfoPage from './SchoolInfoPage';

vi.mock('@services/api/client', () => ({
  apiClient: { get: vi.fn() },
}));

describe('SchoolInfoPage', () => {
  beforeEach(() => {
    window.localStorage.setItem('school-site-language', 'en');
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { data: { items: [] } },
    } as never);
  });

  afterEach(() => {
    window.localStorage.removeItem('school-site-language');
  });

  it('shows a clear placeholder for a page without published school content', async () => {
    render(
      <MemoryRouter initialEntries={['/latest/academic-calendar']}>
        <Routes>
          <Route path="/latest/:section" element={<SchoolInfoPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Academic calendar' })).toBeInTheDocument();
    expect(await screen.findByText('This page is getting ready')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Student portal' })).toHaveAttribute(
      'href',
      '/student'
    );
  });

  it('provides school location and map directions on the contact page', async () => {
    render(
      <MemoryRouter initialEntries={['/contact']}>
        <Routes>
          <Route path="/contact" element={<SchoolInfoPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Contact us' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /find harvard academy on a map/i })).toHaveAttribute(
      'href',
      expect.stringContaining('google.com/maps')
    );
  });

  it('renders published content using the saved Amharic language', async () => {
    window.localStorage.setItem('school-site-language', 'am');
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        data: {
          items: [{
            _id: 'published-news',
            title: { en: 'School update', am: 'የትምህርት ቤት ዝማኔ' },
            summary: { en: 'An update', am: 'ዝማኔ' },
            body: { en: '', am: '' },
          }],
        },
      },
    } as never);

    render(
      <MemoryRouter initialEntries={['/latest/news']}>
        <Routes>
          <Route path="/latest/:section" element={<SchoolInfoPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'የትምህርት ቤት ዝማኔ' })).toBeInTheDocument();
  });
});
