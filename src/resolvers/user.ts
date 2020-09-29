import {
  Resolver,
  Mutation,
  Arg,
  InputType,
  Field,
  Ctx,
  ObjectType,
  Query,
} from "type-graphql"
import { MyContext } from "../types"
import { User } from "../entities/User"
import argon2 from "argon2"
// add resolvers in apollo server
@InputType()
class UsernamePasswordInput {
  @Field()
  username: string
  @Field()
  password: string
}
// we return ObjectType and pass inputTypes

@ObjectType()
class FieldError {
  @Field()
  field: string

  @Field()
  message: string
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  error?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true})
  async me(@Ctx() { req, em }: MyContext) {
    if (!req.session?.userId) {
      return null
    }else {
      const user = await em.findOne(User, {id: req.session.userId})
      return user
    }
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        error: [
          {
            field: "username",
            message: "length must be greater than 2",
          },
        ],
      }
    }
    if (options.password.length < 3) {
      return {
        error: [
          {
            field: "password",
            message: "length must be greater than 3",
          },
        ],
      }
    }
    const hashedPassword = await argon2.hash(options.password)
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    })
    try {
        await em.persistAndFlush(user)
    } catch (err) {
        if(err.detail?.includes("already exists")) {
            // duplicate username error
            return {
                error: [
                  {
                    field: "username",
                    message: "username already taken",
                  },
                ],
              }
        }
    }
    
    return { user }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOneOrFail(User, { username: options.username })
    if (!user) {
      return {
        error: [
          {
            field: "username",
            message: "username doesn't exits",
          },
        ],
      }
    }
    const valid = await argon2.verify(user.password, options.password)
    if (!valid) {
      return {
        error: [
          {
            field: "password",
            message: "password not valid",
          },
        ],
      }
    }
    //  !is the non-nullable expression
    if (req.session)
      req.session.userId = user.id

    return {
      user,
    }
  }
}
