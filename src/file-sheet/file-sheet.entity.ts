import { ApiProperty } from "@nestjs/swagger";

export class FileSheetBody {

  @ApiProperty({ type: String })
  targetId: string;

  @ApiProperty({ type: String })
  punishmentId: string;

  @ApiProperty({ type: Number, format: 'int32' })
  strikes: number;
  
  @ApiProperty({ type: String })
  additionalPunishment: string;

  @ApiProperty({ type: String, required: false })
  notes?: string;

  @ApiProperty({ type: String, isArray: true })
  attachments: string[];

  @ApiProperty({ type: Boolean })
  additionalPunishmentFinished: boolean;
}

export class FileSheetPostBody {

  @ApiProperty({ type: String })
  targetId: string;

  @ApiProperty({ type: String })
  punishmentId: string;

  @ApiProperty({ type: Number, format: 'int32' })
  strikes: number;
  
  @ApiProperty({ type: String })
  additionalPunishment: string;

  @ApiProperty({ type: String, required: false })
  notes?: string;

  @ApiProperty({ type: String, isArray: true })
  attachments: string[];
}

export class FileSheetPatchBody {

  @ApiProperty({ type: Number, format: 'int32' })
  strikes: number;
  
  @ApiProperty({ type: String })
  additionalPunishment: string;

  @ApiProperty({ type: String, required: false })
  notes?: string;

  @ApiProperty({ type: String, isArray: true })
  attachments: string[];

  @ApiProperty({ type: Boolean })
  additionalPunishmentFinished: boolean;
}

export class BackendFileSheetUser {

  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  firstName: string;

  @ApiProperty({ type: String })
  lastName: string;

  @ApiProperty({ type: String })
  phoneNumber: string;

  @ApiProperty({ type: String, required: false })
  groupId?: string;

  @ApiProperty({ type: String, isArray: true, required: false })
  departmentIds?: string[];

  @ApiProperty({ type: Boolean, required: false })
  terminated?: boolean;
}

export class BackendFileSheet {

  @ApiProperty({ type: String, readOnly: true })
  id: string;

  @ApiProperty({ type: String })
  senderId: string;

  @ApiProperty({ type: BackendFileSheetUser, required: false })
  sender?: BackendFileSheetUser;

  @ApiProperty({ type: String })
  targetId: string;

  @ApiProperty({ type: BackendFileSheetUser, required: false })
  target?: BackendFileSheetUser;

  @ApiProperty({ type: String })
  punishmentId: string;
  
  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: Number, format: 'int32' })
  strikes: number;
  
  @ApiProperty({ type: String })
  additionalPunishment: string;

  @ApiProperty({ type: String, required: false })
  notes?: string;

  @ApiProperty({ type: String, isArray: true })
  attachments: string[];

  @ApiProperty({ type: Boolean })
  additionalPunishmentFinished: boolean;

  @ApiProperty({ type: Boolean })
  approved: boolean;

  @ApiProperty({ type: Boolean })
  canceled: boolean;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: Date })
  createdAt: Date;
}


export class FileSheetStrikesTargetResponse {

  @ApiProperty({ type: String, readOnly: true })
  id: string;

  @ApiProperty({ type: String, readOnly: true })
  firstName: string;

  @ApiProperty({ type: String, readOnly: true })
  lastName: string;

  @ApiProperty({ type: String, readOnly: true })
  groupId: string;

  @ApiProperty({ type: String, isArray: true, readOnly: true })
  departmentIds: string[];

  @ApiProperty({ type: Boolean, readOnly: true })
  terminated: boolean;
}

export class FileSheetStrikesItemResponse {

  @ApiProperty({ type: String, readOnly: true })
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

export class FileSheetStrikesResponse {

  @ApiProperty({ type: String, readOnly: true })
  id: string;

  @ApiProperty({ type: Number, format: 'int32' })
  strikes: number;

  @ApiProperty({ type: FileSheetStrikesTargetResponse })
  target: FileSheetStrikesTargetResponse;

  @ApiProperty({ type: FileSheetStrikesItemResponse, isArray: true })
  items: FileSheetStrikesItemResponse[];
}