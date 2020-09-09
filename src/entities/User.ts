import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field } from "type-graphql";

// add entities in mikro-orm config
@ObjectType()
@Entity()
export class User {

  @Field()
  @PrimaryKey()
  id!: number;    //  ! means non-nullable

  @Field(() => String)
  @Property({type: 'date'})
  createdAt = new Date();

  @Field(() => String)
  @Property({type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field(() => String)
  @Property({type: 'text', unique: true})
  username!: string;

//not allowing to select
  @Property({type: 'text'})
  password!: string;
}