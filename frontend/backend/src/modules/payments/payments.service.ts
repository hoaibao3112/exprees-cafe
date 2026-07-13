import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async initiate(dto: {
    orderId: string;
    method: string; // CASH, MOMO, VNPAY
    amount: number;
  }): Promise<Payment> {
    const order = await this.orderRepository.findOne({ where: { id: dto.orderId } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
    }

    const payment = this.paymentRepository.create({
      orderId: dto.orderId,
      method: dto.method,
      amount: dto.amount,
      status: 'PENDING',
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Mock payment link generation for digital gateways
    if (dto.method === 'MOMO' || dto.method === 'VNPAY') {
      savedPayment.gateway = dto.method;
      // We will attach a simulated payment URL for the frontend in the return object
      (savedPayment as any).paymentUrl = `https://mock-gateway.com/pay?txn=${savedPayment.id}&amount=${dto.amount}&method=${dto.method}`;
    }

    return savedPayment;
  }

  async handleCallback(
    gateway: string,
    payload: {
      txnId: string; // paymentId in our case
      gatewayTxnId: string;
      status: string; // SUCCESS, FAILED
      signature: string;
      rawResponse?: any;
    },
  ): Promise<{ success: boolean; message: string }> {
    // Validate signature simulation
    if (!payload.signature) {
      throw new BadRequestException('Invalid callback signature');
    }

    const payment = await this.paymentRepository.findOne({
      where: { id: payload.txnId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment transaction ${payload.txnId} not found`);
    }

    if (payment.status !== 'PENDING') {
      return { success: true, message: 'Transaction already processed' };
    }

    payment.gatewayTxnId = payload.gatewayTxnId;
    payment.gatewayResponse = payload.rawResponse || payload;
    
    if (payload.status === 'SUCCESS') {
      payment.status = 'COMPLETED';
      payment.paidAt = new Date();
      
      // Update order status directly!
      if (payment.order) {
        payment.order.status = 'CONFIRMED';
        await this.orderRepository.save(payment.order);
      }
    } else {
      payment.status = 'FAILED';
    }

    await this.paymentRepository.save(payment);

    return {
      success: payload.status === 'SUCCESS',
      message: payload.status === 'SUCCESS' ? 'Payment processed successfully' : 'Payment failed',
    };
  }

  async getStatus(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id }, relations: ['order'] });
    if (!payment) {
      throw new NotFoundException(`Payment transaction ${id} not found`);
    }
    return payment;
  }
}
