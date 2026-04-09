export interface NotificationLinkDto {
  self: string;
}

export interface NotificationAttributesDto {
  value?: string | number;
  timestamp?: string;
  lastModified: string;
}

export interface NotificationDataDto {
  id: string;
  type: string;
  attributes: NotificationAttributesDto;
  links: NotificationLinkDto;
}

export interface SubNotificationPayloadDto {
  data: NotificationDataDto[];
}
