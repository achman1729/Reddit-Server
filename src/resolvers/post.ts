import { Resolver, Query, Ctx, Arg, Int, Mutation } from "type-graphql"
import { Post } from "../entities/Post"
import { MyContext } from "../types"

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() ctx: MyContext): Promise<Post[]> {
    // accessing all the post using context
    return ctx.em.find(Post, {})
  }
  // Query is for reading/getting data
  @Query(() => Post, { nullable: true })
  post(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    // accessing one post by id
    return em.findOne(Post, { id })
  }

  // Mutations are for writing and deleting data

  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post> {
    const post = em.create(Post, { title })
    await em.persistAndFlush(post)
    return post
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String, { nullable: true}) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
      const post = await em.findOne(Post, {id})
      if (!post) {
          return null
      } else if(typeof title !== 'undefined') {
            post.title = title
            await em.persistAndFlush(post)
      }
    return post
  }
// native delete not working
  @Mutation(() => Boolean)
  async deletePost(
      @Arg('id') id: number,
      @Ctx() { em }: MyContext): Promise<boolean> {
          await em.nativeDelete(Post, { id })
          return true
  }
}
