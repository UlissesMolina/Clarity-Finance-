import '@testing-library/jest-dom/vitest';

// jsdom does not include IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: readonly number[] = [];
  observe = () => null;
  unobserve = () => null;
  disconnect = () => null;
  takeRecords = () => [];
}
window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
