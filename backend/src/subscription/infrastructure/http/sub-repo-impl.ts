import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { SubscriptionCreateDto } from './dtos/subscription.dto';
import { SubscriptionRepositoryPort } from 'src/subscription/application/repository/subscription.repository';

@Injectable()
export class SubscriptionRepoImpl implements SubscriptionRepositoryPort {
  private readonly SUB_DOMAIN: string = process.env.HOST3 || '';

  constructor(private readonly httpService: HttpService) {}

  async refreshSub(validToken: string, plantId: string): Promise<boolean> {
    try {
      const { callbackUrl, secretPassword, lifetimeSeconds } =
        this.getNodeSubscriptionConfig();

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
            url: callbackUrl,
            lifetime: lifetimeSeconds,
            secret: secretPassword,
          },
        },
      };

      await this.createSubscription(validToken, plantId, subscriptionData);
      console.log(`New subscription created for plant ${plantId}`);
      return true;
    } catch (err) {
      console.error(`Failed to create subscription for plant ${plantId}`);
      return false;
    }
  }

  async refreshDatapointSub(
    validToken: string,
    plantId: string,
  ): Promise<boolean> {
    try {
      const { callbackUrl, secretPassword, lifetimeSeconds } =
        this.getDatapointSubscriptionConfig();

      const response = await firstValueFrom(
        this.httpService.get(`${this.SUB_DOMAIN}/${plantId}/locations/`, {
          headers: { Authorization: `Bearer ${validToken}` },
        }),
      );

      if (!response.data.data[0].id)
        throw new Error('Failed to retrieve location data');
      const siteId = response.data.data[0].id;

      const subscriptionData: SubscriptionCreateDto = {
        data: {
          type: 'subscription',
          relationships: {
            subscriptionDatapoints: {
              data: [
                {
                  id: siteId,
                  type: 'location',
                  meta: {
                    expand: true,
                  },
                },
              ],
            },
          },
          attributes: {
            url: callbackUrl,
            lifetime: lifetimeSeconds,
            secret: secretPassword,
          },
        },
      };

      await this.createSubscription(validToken, plantId, subscriptionData);
      console.log(
        `New subscription created for datapoints of plant ${plantId}`,
      );
      return true;
    } catch (err) {
      console.error(
        `Failed to create subscription for datapoints of plant ${plantId}`,
      );
      return false;
    }
  }

  private getNodeSubscriptionConfig(): {
    callbackUrl: string;
    secretPassword: string;
    lifetimeSeconds: number;
  } {
    const lifetimeSeconds = 0;
    const callbackUrl: string = process.env.NODE_SUB_CALLBACK || '';
    const secretPassword: string = process.env.SECRET_FOR_SUB || '';

    if (!secretPassword || !callbackUrl)
      throw new Error(
        'Secret password or callback url are missing for subscription creation',
      );

    return { callbackUrl, secretPassword, lifetimeSeconds };
  }

  private getDatapointSubscriptionConfig(): {
    callbackUrl: string;
    secretPassword: string;
    lifetimeSeconds: number;
  } {
    const lifetimeSeconds = 0;
    const callbackUrl: string = process.env.DATAPOINT_SUB_CALLBACK || '';
    const secretPassword: string = process.env.SECRET_FOR_SUB || '';

    if (!secretPassword || !callbackUrl)
      throw new Error(
        'Secret password or callback url are missing for subscription creation',
      );

    return { callbackUrl, secretPassword, lifetimeSeconds };
  }

  private async createSubscription(
    validToken: string,
    plantId: string,
    subscriptionData: SubscriptionCreateDto,
  ): Promise<void> {
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
  }
}
