import {
  IsNotEmpty,
  IsString,
  IsArray,
  ArrayMinSize,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
  IsEmail,
  IsOptional,
} from 'class-validator';
import { ROLE } from '@enums';
import { OmitType } from '@nestjs/swagger';

@ValidatorConstraint()
export class IsRoleArray implements ValidatorConstraintInterface {
  public async validate(roleData: ROLE[]) {
    return (
      Array.isArray(roleData) &&
      roleData.every((role) => Object.values(ROLE).includes(role))
    );
  }
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsOptional()
  @Validate(IsRoleArray, {
    message: 'Enter valid role .',
  })
  roles?: string[] = [ROLE.USER];

  @IsString()
  @IsNotEmpty()
  status: string;
}

export class RegisterUserDto extends OmitType(CreateUserDto, [
  'status',
] as const) {}
