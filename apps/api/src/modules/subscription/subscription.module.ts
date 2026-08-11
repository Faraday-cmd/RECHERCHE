import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { PaymentProviderFactory } from './payment-providers/payment-provider.factory';
import { OrangeMoneyProvider } from './payment-providers/orange-money.provider';
import { MtnMobileMoneyProvider } from './payment-providers/mtn-mobile-money.provider';

@Module({
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    PaymentProviderFactory,
    OrangeMoneyProvider,
    MtnMobileMoneyProvider,
  ],
  exports: [SubscriptionService, PaymentProviderFactory],
})
export class SubscriptionModule {}
