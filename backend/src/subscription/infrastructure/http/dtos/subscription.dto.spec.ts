import {
  SubscriptionAttributesDto,
  SubscriptionDataRelationDto,
  SubscriptionRelationshipsDto,
  SubscriptionDataDto,
  SubscriptionCreateDto,
  SubscriptionResponseDto,
  SubscriptionsCollectionDto,
} from './subscription.dto';

describe('SubscriptionDtos', () => {
  it('should instantiate dto classes at runtime', () => {
    const attributes = new SubscriptionAttributesDto();
    attributes.lifetime = 0;
    attributes.url = 'https://callback.example.com';
    attributes.secret = 'secret';

    const relation = new SubscriptionDataRelationDto();
    relation.type = 'service';
    relation.id = 'plant-1';

    const relationships = new SubscriptionRelationshipsDto();
    relationships.subscriptionNode = { data: relation };

    const data = new SubscriptionDataDto();
    data.type = 'subscription';
    data.attributes = attributes;
    data.relationships = relationships;

    const create = new SubscriptionCreateDto();
    create.data = data;

    const response = new SubscriptionResponseDto();
    response.data = { id: 'sub-1', type: 'subscription' };

    const collection = new SubscriptionsCollectionDto();
    collection.data = [response.data];

    expect(create.data.relationships.subscriptionNode?.data.id).toBe('plant-1');
    expect(collection.data[0].id).toBe('sub-1');
  });

  describe('SubscriptionAttributesDto', () => {
    it('should create valid subscription attributes', () => {
      const attributes: SubscriptionAttributesDto = {
        lifetime: 3600,
        url: 'https://callback.example.com',
        secret: 'secret-key-123',
      };

      expect(attributes.lifetime).toBe(3600);
      expect(attributes.url).toBe('https://callback.example.com');
      expect(attributes.secret).toBe('secret-key-123');
    });

    it('should allow zero lifetime', () => {
      const attributes: SubscriptionAttributesDto = {
        lifetime: 0,
        url: 'https://callback.example.com',
        secret: 'secret',
      };

      expect(attributes.lifetime).toBe(0);
    });
  });

  describe('SubscriptionDataRelationDto', () => {
    it('should create valid relation without meta', () => {
      const relation: SubscriptionDataRelationDto = {
        type: 'service',
        id: 'plant-1',
      };

      expect(relation.type).toBe('service');
      expect(relation.id).toBe('plant-1');
      expect(relation.meta).toBeUndefined();
    });

    it('should create valid relation with meta', () => {
      const relation: SubscriptionDataRelationDto = {
        type: 'location',
        id: 'loc-123',
        meta: {
          expand: true,
        },
      };

      expect(relation.type).toBe('location');
      expect(relation.id).toBe('loc-123');
      expect(relation.meta?.expand).toBe(true);
    });
  });

  describe('SubscriptionRelationshipsDto', () => {
    it('should create relationships with only subscriptionNode', () => {
      const relationships: SubscriptionRelationshipsDto = {
        subscriptionNode: {
          data: {
            type: 'service',
            id: 'plant-1',
          },
        },
      };

      expect(relationships.subscriptionNode?.data.id).toBe('plant-1');
      expect(relationships.subscriptionDatapoints).toBeUndefined();
    });

    it('should create relationships with only subscriptionDatapoints', () => {
      const relationships: SubscriptionRelationshipsDto = {
        subscriptionDatapoints: {
          data: [
            {
              type: 'location',
              id: 'loc-1',
            },
            {
              type: 'location',
              id: 'loc-2',
            },
          ],
        },
      };

      expect(relationships.subscriptionDatapoints?.data.length).toBe(2);
      expect(relationships.subscriptionNode).toBeUndefined();
    });

    it('should create relationships with both types', () => {
      const relationships: SubscriptionRelationshipsDto = {
        subscriptionNode: {
          data: {
            type: 'service',
            id: 'plant-1',
          },
        },
        subscriptionDatapoints: {
          data: [
            {
              type: 'location',
              id: 'loc-1',
            },
          ],
        },
      };

      expect(relationships.subscriptionNode?.data.id).toBe('plant-1');
      expect(relationships.subscriptionDatapoints?.data[0].id).toBe('loc-1');
    });
  });

  describe('SubscriptionDataDto', () => {
    it('should create subscription data with required fields', () => {
      const data: SubscriptionDataDto = {
        type: 'subscription',
        attributes: {
          lifetime: 3600,
          url: 'https://callback.example.com',
          secret: 'secret',
        },
        relationships: {
          subscriptionNode: {
            data: {
              type: 'service',
              id: 'plant-1',
            },
          },
        },
      };

      expect(data.type).toBe('subscription');
      expect(data.attributes?.lifetime).toBe(3600);
      expect(data.relationships.subscriptionNode?.data.id).toBe('plant-1');
    });

    it('should create subscription data with datapoints', () => {
      const data: SubscriptionDataDto = {
        type: 'subscription',
        attributes: {
          lifetime: 7200,
          url: 'https://example.com/callback',
          secret: 'secret123',
        },
        relationships: {
          subscriptionDatapoints: {
            data: [
              {
                type: 'location',
                id: 'loc-1',
              },
            ],
          },
        },
      };

      expect(data.attributes.lifetime).toBe(7200);
      expect(data.relationships.subscriptionDatapoints?.data).toHaveLength(1);
    });
  });

  describe('SubscriptionCreateDto', () => {
    it('should create valid subscription create request', () => {
      const createDto: SubscriptionCreateDto = {
        data: {
          type: 'subscription',
          attributes: {
            lifetime: 0,
            url: 'https://callback.example.com',
            secret: 'secret-123',
          },
          relationships: {
            subscriptionNode: {
              data: {
                type: 'service',
                id: 'plant-abc-123',
              },
            },
          },
        },
      };

      expect(createDto.data.type).toBe('subscription');
      expect(createDto.data.attributes?.url).toBe(
        'https://callback.example.com',
      );
      expect(createDto.data.relationships.subscriptionNode?.data.id).toBe(
        'plant-abc-123',
      );
    });

    it('should create subscription with datapoint relationships', () => {
      const createDto: SubscriptionCreateDto = {
        data: {
          type: 'subscription',
          attributes: {
            lifetime: 0,
            url: 'https://callback.example.com',
            secret: 'secret',
          },
          relationships: {
            subscriptionDatapoints: {
              data: [
                {
                  type: 'location',
                  id: 'loc-1',
                  meta: { expand: true },
                },
                {
                  type: 'location',
                  id: 'loc-2',
                  meta: { expand: true },
                },
              ],
            },
          },
        },
      };

      expect(
        createDto.data.relationships.subscriptionDatapoints?.data,
      ).toHaveLength(2);
      expect(
        createDto.data.relationships.subscriptionDatapoints?.data[0].meta
          ?.expand,
      ).toBe(true);
    });
  });

  describe('SubscriptionResponseDto', () => {
    it('should parse subscription response with attributes', () => {
      const response: SubscriptionResponseDto = {
        data: {
          id: 'sub-123',
          type: 'subscription',
          attributes: {
            lifetime: 3600,
            url: 'https://callback.example.com',
            secret: 'secret',
          },
        },
      };

      expect(response.data.id).toBe('sub-123');
      expect(response.data.type).toBe('subscription');
      expect(response.data.attributes?.lifetime).toBe(3600);
    });

    it('should parse subscription response without attributes', () => {
      const response: SubscriptionResponseDto = {
        data: {
          id: 'sub-456',
          type: 'subscription',
        },
      };

      expect(response.data.id).toBe('sub-456');
      expect(response.data.attributes).toBeUndefined();
    });
  });

  describe('SubscriptionsCollectionDto', () => {
    it('should parse collection of subscriptions', () => {
      const collection: SubscriptionsCollectionDto = {
        data: [
          {
            id: 'sub-1',
            type: 'subscription',
            attributes: {
              lifetime: 3600,
              url: 'https://callback1.example.com',
              secret: 'secret1',
            },
          },
          {
            id: 'sub-2',
            type: 'subscription',
            attributes: {
              lifetime: 7200,
              url: 'https://callback2.example.com',
              secret: 'secret2',
            },
          },
        ],
      };

      expect(collection.data).toHaveLength(2);
      expect(collection.data[0].id).toBe('sub-1');
      expect(collection.data[1].attributes?.lifetime).toBe(7200);
    });

    it('should parse empty collection', () => {
      const collection: SubscriptionsCollectionDto = {
        data: [],
      };

      expect(collection.data).toHaveLength(0);
    });

    it('should parse collection without attributes', () => {
      const collection: SubscriptionsCollectionDto = {
        data: [
          {
            id: 'sub-1',
            type: 'subscription',
          },
          {
            id: 'sub-2',
            type: 'subscription',
          },
        ],
      };

      expect(collection.data).toHaveLength(2);
      expect(collection.data[0].attributes).toBeUndefined();
    });
  });
});
