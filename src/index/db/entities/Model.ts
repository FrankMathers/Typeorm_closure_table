import {
    Entity,
    Tree,
    Column,
    PrimaryGeneratedColumn,
    TreeChildren,
    TreeParent,
    TreeLevelColumn,
    CreateDateColumn,
    Timestamp,
    UpdateDateColumn
} from "typeorm";
import { ModelType } from "../../../model/base/IModel";

@Entity()
@Tree("closure-table")
export class Model {
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column()
    public name: string;

    @Column()
    public type: ModelType;

    @Column()
    public filePath: string;

    @TreeChildren()
    public children: Model[];

    @TreeParent()
    public parent: Model;

    // @TreeLevelColumn()
    // public level: number;

    @CreateDateColumn()
    public CreatedAt: Timestamp;

    @UpdateDateColumn()
    public UpdatedAt: Timestamp;
}
