import '@testing-library/jest-dom';
import { vi } from 'vitest';

const MockIcon = () => null;

vi.mock('lucide-react', () => ({
  Cloud: MockIcon,
  User: MockIcon,
  ShieldCheck: MockIcon,
  X: MockIcon,
}));
