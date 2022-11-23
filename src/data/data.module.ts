import { Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataEntity } from '../entities/data.entity';
import { UserEntity } from '../entities/user.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([DataEntity, UserEntity])
  ],
  controllers: [DataController],
  providers: [DataService]
})
export class DataModule {}
