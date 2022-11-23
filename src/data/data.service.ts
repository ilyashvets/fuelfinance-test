import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { Duplex } from 'stream';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DataEntity } from '../entities/data.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class DataService {
    constructor(
        @InjectRepository(DataEntity) private readonly dataRepository: Repository<DataEntity>,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
    ) {
    }

    async importData(uploadedFile, {id}) {

        /*
         *  ===IMPORTANT===
         *  Current method correctly parses only files with the static template.
         *  Also this method can be implemented without client's waiting for response
         *  but with uploading status (useful for big CSV/XLS files)
         */

        const user = await this.userRepository.findOne({ where: {id}})
        if (!user) throw new HttpException('Access denied', HttpStatus.FORBIDDEN)

        const workbook = new Workbook();

        const stream = new Duplex()
        stream.push(uploadedFile[0].buffer)
        stream.push(null)

        await workbook.csv.read(stream)

        const dataToSave = []

        for (let sheetIndex = 0; sheetIndex < workbook.worksheets.length; sheetIndex++) {
            const worksheet = workbook.worksheets[sheetIndex]

            for (let rowIndex = 2; rowIndex < worksheet.rowCount + 1; rowIndex++) {
                const row = worksheet.getRow(rowIndex)

                const rowData = {
                    date: null,
                    filterDate: null,
                    sum: null,
                    source: null,
                    description: null,
                    owner: user
                }

                for (let cellIndex = 1; cellIndex < row.cellCount + 1; cellIndex++) {
                    const cell = row.getCell(cellIndex)

                    let date = null;

                    if (cellIndex === 1) {
                        if (typeof cell.value === 'string') {
                            const [day, month, year] = cell.value.split('-').map(i => parseInt(i))
                            date = new Date(year, month - 1, day)
                        }
                        else date = cell.value

                        if (Object.prototype.toString.call(date) !== '[object Date]') {
                            throw new HttpException(`CSV parsing error on [${rowIndex}, ${cellIndex}]`, HttpStatus.BAD_REQUEST)
                        }
                        rowData.date = date.toLocaleDateString().replaceAll('.', '-')
                    }
                    else if (cellIndex === 2) rowData.sum = cell.value
                    else if (cellIndex === 3) rowData.source = cell.value
                    else rowData.description = cell.value
                }

                dataToSave.push(rowData)
            }
        }

        await this.dataRepository.save(dataToSave)

        return 'Data has been imported'
    }

    async getReport(filter, {id}) {

        const user = await this.userRepository.findOne({where: {id}})
        if (!user) throw new HttpException('Access denied', HttpStatus.FORBIDDEN)

        const where = {}
        if ('source' in filter) where['source'] = filter.source.toLowerCase()
        if ('date' in filter) where['date'] = Like(`%${filter.date}`)

        const data = await this.dataRepository.find({where})

        const response = []

        for (const item of data) {
            const datePattern = item.date.slice(3)

            const existSource = response.find(i => i.source === item.source)
            if (!existSource) response.push({
                source: item.source,
                data: [{date: datePattern, total: item.sum}]
            })
            else {
                const existDate = existSource.data.find(i => i.date === datePattern)
                if (existDate) existDate.total+=item.sum
                else existSource.data.push({
                    date: datePattern, total: item.sum
                })
            }
        }

        return response.map(src => ({
            ...src,
            data: src.data.sort((a, b) => {
                const [aMonth, aYear] = a.date.split('-').map(i => parseInt(i))
                const [bMonth, bYear] = b.date.split('-').map(i => parseInt(i))
                return new Date(aYear, aMonth - 1).getTime() - new Date(bYear, bMonth - 1).getTime()
            })
        }))
    }
}
