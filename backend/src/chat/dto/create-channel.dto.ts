import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length, IsOptional, IsNumber } from "class-validator";
import { 
	ChanMode, 
	User, 
	Message 
} from '@prisma/client';

export class CreateChannelDto {

	@ApiProperty({
		description: 'Name of channel / DM',
	})

	@IsString()
	@IsNotEmpty()
	@Length(2, 30)
	name: string;

	@IsOptional()
	mode: ChanMode;

	@IsOptional()
	password: string;

	owner: User;

	@IsNumber()
	@IsNotEmpty()
	ownerId: number;

	@IsOptional()
	admins      : User[];

	@IsOptional()
	joinedUsers: User[];

	@IsOptional()
	bannedUsers: User[];

	@IsOptional()
	kickedUsers: User[];

	@IsOptional()
	mutedUsers : User[];
	
	@IsOptional()
	messages: Message[];
}