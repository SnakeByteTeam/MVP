export class SubscriptionAttributesDto {
  lifetime: number;
  url: string;
  secret: string;
}

export class SubscriptionDataRelationDto {
  type: string;
  id: string;
  meta?: {
    expand: boolean;
  };
}

export class SubscriptionRelationshipsDto {
  subscriptionNode?: {
    data: SubscriptionDataRelationDto;
  };

  subscriptionDatapoints?: {
    data: SubscriptionDataRelationDto[];
  };
}

export class SubscriptionDataDto {
  type: string;
  attributes: SubscriptionAttributesDto;
  relationships: SubscriptionRelationshipsDto;
}

export class SubscriptionCreateDto {
  data: SubscriptionDataDto;
}

export class SubscriptionResponseDto {
  data: {
    id: string;
    type: string;
    attributes?: SubscriptionAttributesDto;
  };
}

export class SubscriptionsCollectionDto {
  data: Array<{
    id: string;
    type: string;
    attributes?: SubscriptionAttributesDto;
  }>;
}
