export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  isActive?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
}
