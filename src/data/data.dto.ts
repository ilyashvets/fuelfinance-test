import { IsOptional, IsString } from 'class-validator';

export class FilterDataDto {
    @IsString()
    @IsOptional()
    source: string

    @IsString()
    @IsOptional()
    date: string
}