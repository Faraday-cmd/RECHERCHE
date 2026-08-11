import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { IPaymentProvider } from './payment-provider.interface';
import { OrangeMoneyProvider } from './orange-money.provider';
import { MtnMobileMoneyProvider } from './mtn-mobile-money.provider';

@Injectable()
export class PaymentProviderFactory {
  private readonly providers: Map<string, IPaymentProvider> = new Map();

  constructor(
    orangeMoneyProvider: OrangeMoneyProvider,
    mtnMobileMoneyProvider: MtnMobileMoneyProvider,
  ) {
    this.providers.set(orangeMoneyProvider.providerName, orangeMoneyProvider);
    this.providers.set(mtnMobileMoneyProvider.providerName, mtnMobileMoneyProvider);
  }

  getProvider(providerName: string = 'ORANGE_MONEY'): IPaymentProvider {
    if (process.env.NODE_ENV === 'production' && (providerName.includes('MOCK') || providerName.includes('TEST'))) {
      throw new ForbiddenException(`Production Security Violation: Mock/Testing payment provider '${providerName}' is strictly disabled in production mode.`);
    }

    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new BadRequestException(`Unsupported payment provider: ${providerName}`);
    }
    return provider;
  }
}
