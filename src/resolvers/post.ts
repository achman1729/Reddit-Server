import { Resolver, Query, Ctx } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    post(@Ctx() ctx: MyContext): Promise<Post[]> {
        // accessing the post using context
        return ctx.em.find(Post, {})
    }
}