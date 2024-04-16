import { ApiProperty } from "@nestjs/swagger";

export class PunishmentItemBody {

  @ApiProperty({ type: String, readOnly: true, required: false })
  id?: string;

  @ApiProperty({ type: Number, format: 'int32' })
  stage: number;
  
  @ApiProperty({ type: Number, format: 'int32' })
  strikes: number;

  @ApiProperty({ type: String })
  additionalPunishment: string;
}

export class PunishmentBody {

  @ApiProperty({ type: Number, format: 'int32' })
  uniqueId: number;
  
  @ApiProperty({ type: String })
  description: string;

  @ApiProperty({ type: PunishmentItemBody, isArray: true, required: false })
  items?: PunishmentItemBody[];
}

export class PunishmentCategoryBody {

  @ApiProperty({ type: Number, format: 'int32' })
  uniqueId: number;

  @ApiProperty({ type: String })
  label: string;

  @ApiProperty({ type: PunishmentBody, required: false })
  punishment?: PunishmentBody;
}

export class BackendPunishmentItem {

  @ApiProperty({ type: String, readOnly: true })
  id: string;

  @ApiProperty({ type: String, readOnly: true })
  punishmentId: string;

  @ApiProperty({ type: Number, format: 'int32' })
  stage: number;
  
  @ApiProperty({ type: Number, format: 'int32' })
  strikes: number;

  @ApiProperty({ type: String })
  additionalPunishment: string;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: Date })
  createdAt: Date;
}

export class BackendPunishment {

  @ApiProperty({ type: String, readOnly: true })
  id: string;

  @ApiProperty({ type: String, readOnly: true })
  categoryId: string;

  @ApiProperty({ type: Number, format: 'int32' })
  uniqueId: number;

  @ApiProperty({ type: String })
  description: string;

  @ApiProperty({ type: BackendPunishmentItem, isArray: true })
  items: BackendPunishmentItem[];

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: Date })
  createdAt: Date;
}

export class BackendPunishmentCategory {

  @ApiProperty({ type: String, readOnly: true })
  id: string;

  @ApiProperty({ type: Number, format: 'int32' })
  uniqueId: number;

  @ApiProperty({ type: String })
  label: string;

  @ApiProperty({ type: BackendPunishment, isArray: true })
  punishments: BackendPunishment[];

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: Date })
  createdAt: Date;

}