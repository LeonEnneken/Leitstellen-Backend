import { ApiProperty } from "@nestjs/swagger";

export class MemberUserBody {

  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  firstName: string;

  @ApiProperty({ type: String })
  lastName: string;

  @ApiProperty({ type: String })
  phoneNumber: string;
}

export class MemberBody {

  @ApiProperty({ type: MemberUserBody, required: false })
  user?: MemberUserBody;

  @ApiProperty({ type: String })
  groupId: string;

  @ApiProperty({ type: String, isArray: true })
  departmentIds: string[];

  @ApiProperty({ type: String, required: false })
  dutyNumber?: string;

  @ApiProperty({ type: String, required: false })
  notes?: string;

  @ApiProperty({ type: Object, required: false })
  data?: Object;

  @ApiProperty({ type: Date })
  hiredDate: Date;

  @ApiProperty({ type: Date })
  lastPromotionDate: Date;
}

export class BackendMemberUser {

  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  firstName: string;

  @ApiProperty({ type: String })
  lastName: string;

  @ApiProperty({ type: String })
  phoneNumber: string;

  @ApiProperty({ type: String, enum: ['ON_DUTY', 'OFF_DUTY', 'OFFLINE'] })
  status: 'ON_DUTY' | 'OFF_DUTY' | 'OFFLINE';
}

export class BackendMember {

  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  userId: string;

  @ApiProperty({ type: BackendMemberUser, required: false })
  user?: BackendMemberUser;

  @ApiProperty({ type: String })
  organisationId: string;

  @ApiProperty({ type: String })
  groupId: string;

  @ApiProperty({ type: String, isArray: true })
  departmentIds: string[];

  @ApiProperty({ type: String, required: false })
  dutyNumber?: string;

  @ApiProperty({ type: String, required: false })
  notes?: string;

  @ApiProperty({ type: Object, required: false })
  data?: Object;

  @ApiProperty({ type: Date })
  hiredDate: Date;

  @ApiProperty({ type: Date })
  lastPromotionDate: Date;

  @ApiProperty({ type: Boolean })
  terminated: boolean;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: Date })
  createdAt: Date;
}

export class BackendMemberPhoneNumber {
  
  @ApiProperty({ type: String })
  userId: string;

  @ApiProperty({ type: String })
  avatar: string;

  @ApiProperty({ type: String })
  fullName: string;

  @ApiProperty({ type: String })
  phoneNumber: string;
}