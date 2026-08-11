import { RoleCode, SubscriptionStatus, UserStatus, ProfileVisibility, InfoStatus } from '../enums/index.js';

export interface IUser {
  id: string;
  email: string;
  name: string;
  sex: string;
  dob: Date;
  permanentLocationGeom?: string;
  bio?: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPrivacySettings {
  id: string;
  userId: string;
  profileVisibility: ProfileVisibility;
  showExactAddress: boolean;
  showAge: boolean;
}

export interface IUserRole {
  id: string;
  userId: string;
  roleId: string;
  roleCode: RoleCode;
  status: string;
}

export interface IProviderProfile {
  id: string;
  userRoleId: string;
  displayName: string;
  shortBio: string;
  fullDescription: string;
  profilePicUrl?: string;
  coverPicUrl?: string;
  phoneNumbers: Record<string, string>[];
  openingHours?: Record<string, string>;
  yearFounded?: number;
}

export interface ICampus {
  id: string;
  providerProfileId: string;
  name: string;
  address: string;
  locationGeom: string;
  contactPhones: string[];
  openingHours: Record<string, string>;
}

export interface IInfo {
  id: string;
  providerProfileId: string;
  title: string;
  summary: string;
  description: string;
  infoType: string;
  contentLang: string;
  photosJson?: string[];
  videoUrl?: string;
  campusId?: string;
  courseId?: string;
  ctaType?: string;
  status: InfoStatus;
  publishedAt: Date;
  expiresAt: Date;
}

export interface ICurrentCourse {
  id: string;
  providerProfileId: string;
  campusId: string;
  title: string;
  level: string;
  language: string;
  shortDescription: string;
  fullDescription: string;
  startDate: Date;
  durationPeriod: string;
  priceXAF: number;
  priceNote?: string;
  capacity?: number;
  enrolledCount: number;
  photosJson?: string[];
  videoUrl?: string;
  publishToInfo: boolean;
  publishToCourses: boolean;
  createdAt: Date;
}
