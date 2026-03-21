import { describe, it, expect } from 'vitest';
import { getAvailableProviders } from '@/lib/payments/router';

describe('Payment Router', () => {
  describe('getAvailableProviders', () => {
    it('returns M-Pesa for Kenya', () => {
      const providers = getAvailableProviders('KE');
      expect(providers.mobileMoney).toContain('mpesa');
    });

    it('returns EcoCash for Zimbabwe', () => {
      const providers = getAvailableProviders('ZW');
      expect(providers.mobileMoney).toContain('ecocash');
    });

    it('returns Orange Money for Botswana', () => {
      const providers = getAvailableProviders('BW');
      expect(providers.mobileMoney).toContain('orange-money');
    });

    it('returns MTN MoMo for Nigeria', () => {
      const providers = getAvailableProviders('NG');
      expect(providers.mobileMoney).toContain('mtn-momo');
    });

    it('returns card support for all countries', () => {
      const countries = ['BW', 'ZW', 'TZ', 'KE', 'ZA', 'NG', 'ZM', 'MZ', 'SL', 'UG'];
      for (const country of countries) {
        expect(getAvailableProviders(country).card).toBe(true);
      }
    });

    it('returns MTN MoMo and Airtel Money for Uganda', () => {
      const providers = getAvailableProviders('UG');
      expect(providers.mobileMoney).toContain('mtn-momo');
      expect(providers.mobileMoney).toContain('airtel-money');
    });

    it('returns bank transfer for all countries', () => {
      const countries = ['BW', 'ZW', 'TZ', 'KE', 'ZA', 'NG', 'ZM', 'MZ', 'SL', 'UG'];
      for (const country of countries) {
        expect(getAvailableProviders(country).bankTransfer).toBe(true);
      }
    });

    it('returns no mobile money for South Africa', () => {
      const providers = getAvailableProviders('ZA');
      expect(providers.mobileMoney).toHaveLength(0);
    });

    it('throws for unknown country', () => {
      expect(() => getAvailableProviders('XX')).toThrow('not supported');
    });
  });
});
