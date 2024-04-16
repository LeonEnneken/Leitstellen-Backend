import { ApiProperty } from "@nestjs/swagger";

export class RadioCodeBody {

  @ApiProperty({ type: String, enum: ['NORMAL', 'INFO', 'WARN'] })
  type: 'NORMAL' | 'INFO' | 'WARN';

  @ApiProperty({ type: String })
  code: string;

  @ApiProperty({ type: String })
  description: string;
}

export class BackendRadioCode {

  @ApiProperty({ type: String })
  id: string;
  
  @ApiProperty({ type: String, enum: ['NORMAL', 'INFO', 'WARN'] })
  type: 'NORMAL' | 'INFO' | 'WARN';

  @ApiProperty({ type: String })
  code: string;

  @ApiProperty({ type: String })
  description: string;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: Date })
  createdAt: Date;
}