import { Controller, Get, Post, Query, Req, UploadedFiles, UseInterceptors } from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express';
import { DataService } from './data.service';
import { FilterDataDto } from './data.dto';

@Controller('data')
export class DataController {
    constructor(
        private readonly dataService: DataService
    ) {
    }

    @Post('/import')
    @UseInterceptors(FilesInterceptor('file'))
    async importData(@UploadedFiles() uploadedFile, @Req() req) {
        return await this.dataService.importData(uploadedFile, req.user)
    }

    @Get('/report')
    async getReport(@Req() req, @Query() filter: FilterDataDto) {
        return await this.dataService.getReport(filter, req.user)
    }
}
