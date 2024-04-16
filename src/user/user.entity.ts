import { ApiProperty } from "@nestjs/swagger";

export class SetupBody {

  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  firstName: string;

  @ApiProperty({ type: String })
  lastName: string;

  @ApiProperty({ type: String })
  phoneNumber: string;
}

export class StatusBody {
  
  @ApiProperty({ type: String, enum: ['OFFLINE', 'AWAY_FROM_KEYBOARD', 'OFF_DUTY', 'ON_DUTY'] })
  status: 'OFFLINE' | 'AWAY_FROM_KEYBOARD' | 'OFF_DUTY' | 'ON_DUTY';
}

export class BackendUserGroup {

  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: Number, format: 'int32' })
  uniqueId: number;

  @ApiProperty({ type: String })
  name: string;
}

export class BackendUserAccount {

  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  username: string;

  @ApiProperty({ type: String })
  discriminator: string;

  @ApiProperty({ type: String })
  avatar: string;
}

export class BackendUserDetails {

  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  firstName: string;

  @ApiProperty({ type: String })
  lastName: string;

  @ApiProperty({ type: String })
  phoneNumber: string;
}

export class BackendUser {

  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: BackendUserAccount })
  account: BackendUserAccount;

  @ApiProperty({ type: BackendUserDetails, required: false })
  details?: BackendUserDetails;

  @ApiProperty({ type: String, enum: ['USER', 'MODERATOR', 'ADMINISTRATOR'] })
  role: 'USER' | 'MODERATOR' | 'ADMINISTRATOR';
  
  @ApiProperty({ type: String, enum: ['OFFLINE', 'AWAY_FROM_KEYBOARD', 'OFF_DUTY', 'ON_DUTY'] })
  status: 'OFFLINE' | 'AWAY_FROM_KEYBOARD' | 'OFF_DUTY' | 'ON_DUTY';

  @ApiProperty({ type: String, required: false })
  dutyNumber?: string;

  @ApiProperty({ type: BackendUserGroup, required: false })
  group?: BackendUserGroup;

  @ApiProperty({ type: String, isArray: true, required: false })
  permissions?: string[];

  @ApiProperty({ type: Date, required: false })
  hiredDate?: Date;
  
  @ApiProperty({ type: Date, required: false })
  lastPromotionDate?: Date;

  @ApiProperty({ type: Object, required: false })
  data?: Object;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: Date })
  createdAt: Date;
}

export class BackendUserSearch {
  
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  userId: string;

  @ApiProperty({ type: String })
  firstName: string;

  @ApiProperty({ type: String })
  lastName: string;

  @ApiProperty({ type: String })
  phoneNumber: string;
}

export class BackendUserActiveFileSheet {
  
  @ApiProperty({ type: String })
  id: string;
  
  @ApiProperty({ type: String })
  title: string;
  
  @ApiProperty({ type: Number, format: 'int32' })
  strikes: number;
  
  @ApiProperty({ type: String })
  additionalPunishment: string;
  
  @ApiProperty({ type: Date })
  createdAt: Date;
}