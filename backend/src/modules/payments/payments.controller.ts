import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a payment transaction for an order' })
  initiate(
    @Body()
    dto: {
      orderId: string;
      method: string; // CASH, MOMO, VNPAY
      amount: number;
    },
  ) {
    return this.paymentsService.initiate(dto);
  }

  @Public() // Webhooks from MOMO/VNPAY are public
  @Post('callback/:gateway')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive gateway callback (Webhook)' })
  callback(
    @Param('gateway') gateway: string,
    @Body()
    payload: {
      txnId: string;
      gatewayTxnId: string;
      status: string; // SUCCESS, FAILED
      signature: string;
      rawResponse?: any;
    },
  ) {
    return this.paymentsService.handleCallback(gateway, payload);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get payment status by transaction ID' })
  getStatus(@Param('id') id: string) {
    return this.paymentsService.getStatus(id);
  }
}
