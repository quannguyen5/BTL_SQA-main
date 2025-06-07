import { SetMetadata } from '@nestjs/common';

// Tạo một decorator tên là @Roles, với các roles truyền vào dưới dạng mảng
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
