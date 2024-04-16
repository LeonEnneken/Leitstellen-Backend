import { ApiProperty } from "@nestjs/swagger";

export class BackendTrackingsItem {

  @ApiProperty({ type: String, readOnly: true })
  id: string;

  @ApiProperty({ type: String, readOnly: true })
  controlCenterId: string;

  @ApiProperty({ type: Number, format: 'int64', readOnly: true })
  startDate: number;

  @ApiProperty({ type: Number, format: 'int64', readOnly: true })
  endDate: number;

  @ApiProperty({ type: Number, format: 'int64', readOnly: true })
  time: number;

  @ApiProperty({ type: Boolean, readOnly: true })
  finished: boolean;
}

export class BackendTrackingsUser {

  @ApiProperty({ type: String, readOnly: true })
  id: string;

  @ApiProperty({ type: String, readOnly: true })
  firstName: string;

  @ApiProperty({ type: String, readOnly: true })
  lastName: string;

  @ApiProperty({ type: String, readOnly: true })
  phoneNumber: string;

  @ApiProperty({ type: String, readOnly: true })
  groupId: string;

  @ApiProperty({ type: String, isArray: true, readOnly: true })
  departmentIds: string[];
}

export class BackendTrackings {

  @ApiProperty({ type: String, readOnly: true })
  id: string;

  @ApiProperty({ type: BackendTrackingsUser, readOnly: true })
  user: BackendTrackingsUser;
  
  @ApiProperty({ type: BackendTrackingsItem, isArray: true })
  items: BackendTrackingsItem[];

  @ApiProperty({ type: Number, format: 'int64' })
  totalTime: number;
}