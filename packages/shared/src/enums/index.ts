export enum RoleCode {
  LEHRER = 'LEHRER',
  BETREUER = 'BETREUER',
  VISA_COMPANION = 'VISA_COMPANION',
  DEUTSCH_INSTITUT = 'DEUTSCH_INSTITUT',
}

export enum SubscriptionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRING = 'EXPIRING',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED',
}

export enum InfoStatus {
  PUBLISHED = 'PUBLISHED',
  EXPIRED = 'EXPIRED',
  DELETED = 'DELETED',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export enum ProfileVisibility {
  PUBLIC = 'PUBLIC',
  FRIENDS_ONLY = 'FRIENDS_ONLY',
  PRIVATE = 'PRIVATE',
}

export enum FriendshipStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum ConversationType {
  USER_PROVIDER = 'USER_PROVIDER',
  FRIEND_PRIVATE = 'FRIEND_PRIVATE',
  GROUP = 'GROUP',
}

export enum ReportTarget {
  PROFILE = 'PROFILE',
  INFO = 'INFO',
  COMMENT = 'COMMENT',
  CONVERSATION = 'CONVERSATION',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}
