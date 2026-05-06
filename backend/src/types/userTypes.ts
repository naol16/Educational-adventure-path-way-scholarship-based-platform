export enum UserRole {
  STUDENT = "student",
  COUNSELOR = "counselor",
  ADMIN = "admin",
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  role?: UserRole;
  isVerified?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  isVerified?: boolean;
  googleId?: string;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  password?: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
