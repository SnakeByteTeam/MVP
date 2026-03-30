import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { RefreshNodeSubscriptionRepoPort } from 'src/subscription/application/repository/refresh-node-subscription.repository';
import { SubscriptionCreateDto } from './dtos/subscription.dto';

@Injectable()
export class SubscriptionRepoImpl implements RefreshNodeSubscriptionRepoPort {
  private readonly SUB_DOMAIN: string = process.env.HOST3 || '';
  private readonly callbackUrl: string = process.env.SUB_CALLBACK || '';

  constructor(private readonly httpService: HttpService) {}

  async refreshSub(validToken: string, plantId: string): Promise<boolean> {
    try {
      const lifetimeSeconds = 0; // == valore massimo del server di Vimar

      const secretPassword: string = process.env.SECRET_FOR_SUB || '';
      if (!secretPassword)
        throw new Error('THERE IS NO SECRET FOR SUBSCRPTION CREATION');

      const subscriptionData: SubscriptionCreateDto = {
        data: {
          type: 'subscription',
          relationships: {
            subscriptionNode: {
              data: {
                id: plantId,
                type: 'service',
              },
            },
          },
          attributes: {
            url: this.callbackUrl,
            lifetime: lifetimeSeconds,
            secret: secretPassword,
          },
        },
      };

      await firstValueFrom(
        this.httpService.post(
          `${this.SUB_DOMAIN}/${plantId}/subscriptions`,
          subscriptionData,
          {
            headers: {
              accept: 'application/vnd.api+json',
              'Content-Type': 'application/vnd.api+json',
              Authorization: `Bearer ${validToken}`,
            },
          },
        ),
      );

      console.log(`New subscription created for plant ${plantId}`);
      return true;
    } catch (error: any) {
      console.error('Failed to create subscription');
      return false;
    }
  }
}
