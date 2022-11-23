import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { UserEntity } from './user.entity';

@Entity('data')
export class DataEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    date: string

    @Column()
    sum: number

    @Column()
    source: string

    @Column({nullable: true})
    description: string

    @ManyToOne(() => UserEntity, user => user.data)
    owner: UserEntity
}