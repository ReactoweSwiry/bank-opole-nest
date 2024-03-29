import { Module } from '@nestjs/common';
import { CurrencyExchangeService } from './currency-exchange.service';
import { CurrencyExchangeController } from './currency-exchange.controller';

@Module({
  controllers: [CurrencyExchangeController],
  providers: [CurrencyExchangeService],
})
export class CurrencyExchangeModule {}
