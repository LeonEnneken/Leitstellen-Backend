import { ApiProperty } from "@nestjs/swagger";

export class SettingsHeaderDetailsBody {

  @ApiProperty({ type: Number, format: 'int32' })
  index: number;

  @ApiProperty({ type: String, enum: ['TOP', 'BOTTOM'] })
  type: 'TOP' | 'BOTTOM';

  @ApiProperty({ type: String })
  label: string;

  @ApiProperty({ type: String })
  value: string;

  @ApiProperty({ type: String })
  color: string;
}

export class SettingsLoginPageBody {

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String })
  description: string;
}

export class SettingsControlCenterStatusBody {
 
  @ApiProperty({ type: String })
  label: string;

  @ApiProperty({ type: String })
  value: string;

  @ApiProperty({ type: String, enum: ['BLUE', 'RED', 'AMBER', 'GREEN'] })
  color: 'BLUE' | 'RED' | 'AMBER' | 'GREEN';
}


export class SettingsBody {

  @ApiProperty({ type: String })
  organisationName: string;

  @ApiProperty({ type: String })
  logoUrl: string;

  @ApiProperty({ type: SettingsLoginPageBody })
  loginPage: SettingsLoginPageBody;

  @ApiProperty({ type: Boolean, required: false })
  hasDutyNumber?: boolean;
}


export class BackendSettingsHeaderDetails {

  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: Number, format: 'int32' })
  index: number;

  @ApiProperty({ type: String, enum: ['TOP', 'BOTTOM'] })
  type: 'TOP' | 'BOTTOM';

  @ApiProperty({ type: String })
  label: string;

  @ApiProperty({ type: String })
  value: string;

  @ApiProperty({ type: String })
  color: string;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: Date })
  createdAt: Date;
}

export class BackendSettingsLoginPage {

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String })
  description: string;
}

export class BackendSettingsOptions {

  @ApiProperty({ type: Boolean, required: false })
  hasDutyNumber: boolean;
}

export class BackendSettingsControlCenterStatus {

  @ApiProperty({ type: String, readOnly: true })
  id: string;

  @ApiProperty({ type: String, readOnly: true })
  settingsId: string;
  
  @ApiProperty({ type: String })
  label: string;

  @ApiProperty({ type: String })
  value: string;

  @ApiProperty({ type: String, enum: ['BLUE', 'RED', 'AMBER', 'GREEN'] })
  color: 'BLUE' | 'RED' | 'AMBER' | 'GREEN';

  @ApiProperty({ type: Date, readOnly: true })
  updatedAt: Date;

  @ApiProperty({ type: Date, readOnly: true })
  createdAt: Date;
}

export class BackendSettings {

  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  organisationName: string;

  @ApiProperty({ type: String })
  logoUrl: string;

  @ApiProperty({ type: String })
  baseUrl: string;

  @ApiProperty({ type: String })
  socketUrl: string;

  @ApiProperty({ type: BackendSettingsLoginPage })
  loginPage: BackendSettingsLoginPage;

  @ApiProperty({ type: Object, required: false })
  fieldOfStudy?: Object;

  @ApiProperty({ type: Object, required: false })
  trainings?: Object;

  @ApiProperty({ type: BackendSettingsOptions, required: false })
  options?: BackendSettingsOptions;

  @ApiProperty({ type: BackendSettingsControlCenterStatus, isArray: true })
  controlCenterStatus: BackendSettingsControlCenterStatus[];

  @ApiProperty({ type: BackendSettingsHeaderDetails, isArray: true })
  headerDetailsTop: BackendSettingsHeaderDetails[];

  @ApiProperty({ type: BackendSettingsHeaderDetails, isArray: true })
  headerDetailsBottom: BackendSettingsHeaderDetails[];

  @ApiProperty({ type: Boolean })
  maintenance: boolean;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: Date })
  createdAt: Date;
}