import { ApiProperty } from "@nestjs/swagger";

export class GroupBody {

  @ApiProperty({ type: Number, format: 'int32' })
  uniqueId: number;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  shortName: string;

  @ApiProperty({ type: String, required: false })
  division?: string;

  @ApiProperty({ type: String, isArray: true })
  permissions: string[];

  @ApiProperty({ type: Object, required: false })
  data?: Object;

  @ApiProperty({ type: Boolean, required: false })
  showInOverview?: boolean;

}

export class BackendGroup {

  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: Number, format: 'int32' })
  uniqueId: number;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  shortName: string;

  @ApiProperty({ type: String, required: false })
  division?: string;

  @ApiProperty({ type: String, isArray: true })
  permissions: string[];

  @ApiProperty({ type: Object })
  data?: Object;

  @ApiProperty({ type: Boolean, required: false })
  showInOverview?: boolean;

  @ApiProperty({ type: Boolean, default: false })
  default: boolean;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: Date })
  createdAt: Date;
}