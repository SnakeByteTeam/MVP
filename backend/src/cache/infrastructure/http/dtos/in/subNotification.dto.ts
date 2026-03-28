export interface NotificationLinkDto {
  self: string;
}

export interface NotificationAttributesDto {
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
