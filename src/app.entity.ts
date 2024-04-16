import { ApiProperty } from "@nestjs/swagger";

export class Pagination {

  @ApiProperty({ type: Number, format: 'int32' })
  count: number;

  @ApiProperty({ type: Number, format: 'int32' })
  page: number;

  @ApiProperty({ type: Number, format: 'int32' })
  last_page: number;

  @ApiProperty({ type: Number, format: 'int32' })
  per_page: number;
}