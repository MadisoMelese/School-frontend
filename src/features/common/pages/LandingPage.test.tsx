import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

describe('LandingPage', () => {
  it('introduces Harvard Academy and links to the school portal', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /curious minds/i })).toBeInTheDocument();
    expect(screen.getAllByText('Hossana, Ethiopia').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /school portal/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /find us in hossana/i })).toHaveAttribute(
      'href',
      expect.stringContaining('google.com/maps')
    );
  });

  it('opens and closes the mobile navigation', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeInTheDocument();

    const firstMobileLink = screen
      .getByRole('navigation', { name: 'Mobile navigation' })
      .querySelector('a');
    expect(firstMobileLink).not.toBeNull();
    if (firstMobileLink) fireEvent.click(firstMobileLink);
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).not.toBeInTheDocument();
  });

  it('switches between English and Amharic', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Switch language' })[0]);
    expect(screen.getByRole('heading', { name: /ታላላቅ ሐሳቦች/ })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'am');
    expect(document.title).toContain('ሃርቫርድ አካዳሚ');

    fireEvent.click(screen.getAllByRole('button', { name: 'ቋንቋ ቀይር' })[0]);
    expect(screen.getByRole('heading', { name: 'Big ideas.Bright futures.' })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'en');
  });

  it('changes the hero photo with the carousel controls', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const photo = screen.getByRole('img', { name: 'Students learning together in a classroom' });
    const initialSource = photo.getAttribute('src');

    fireEvent.click(screen.getByRole('button', { name: 'Next classroom photo' }));
    expect(
      screen
        .getByRole('img', { name: 'Students learning together in a classroom' })
        .getAttribute('src')
    ).not.toBe(initialSource);

    fireEvent.click(screen.getByRole('button', { name: 'Show classroom photo 3' }));
    expect(
      screen
        .getByRole('img', { name: 'Students learning together in a classroom' })
        .getAttribute('src')
    ).toContain('photo-1503676260728');
  });

  it('opens latest, about, and portal dropdown menus with working destinations', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Latest' })[0]);
    expect(screen.getAllByRole('menuitem', { name: 'News' })[0]).toHaveAttribute(
      'href',
      '/latest/news'
    );
    expect(screen.getAllByRole('menuitem', { name: 'Photo gallery' })[0]).toHaveAttribute(
      'href',
      '/latest/photo-gallery'
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'About' })[0]);
    expect(screen.getAllByRole('menuitem', { name: 'Director' })[0]).toHaveAttribute(
      'href',
      '/about/director'
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Portals' })[0]);
    expect(screen.getAllByRole('menuitem', { name: 'Student portal' })[0]).toHaveAttribute(
      'href',
      '/student'
    );
    expect(screen.getAllByRole('menuitem', { name: 'Parents portal' })[0]).toHaveAttribute(
      'href',
      '/parent'
    );
  });
});
