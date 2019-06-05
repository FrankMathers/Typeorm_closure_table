import { Entity, Tree, Column, PrimaryGeneratedColumn, TreeChildren, TreeParent, TreeLevelColumn, CreateDateColumn, Timestamp, UpdateDateColumn } from "typeorm"

export enum ArtifactType {
  BO = 0,
  UICOMPONENT = 1,
  OTHERS = 99
}

@Entity()
@Tree("closure-table")
export class Artifact {

  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column()
  public label: string;

  @Column()
  public type: ArtifactType;

  @Column()
  public filePath: string;

  @TreeChildren()
  public children: Artifact[];

  @TreeParent()
  public parent: Artifact;

  @CreateDateColumn()
  public CreatedAt: Timestamp;

  @UpdateDateColumn()
  public UpdatedAt: Timestamp;

}