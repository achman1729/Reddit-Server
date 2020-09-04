import {MikroORM} from "@mikro-orm/core"
import { __prod__ } from "./constants"
import { Post } from "./entities/Post"
import microConfig from "./mikro-orm.config"


const main = async () => {

    // DB config
    const orm = await MikroORM.init(microConfig)
    // to run auto migrations
    await orm.getMigrator().up()

    const post = orm.em.create(Post, {title: "My first post"})
    // to insert in the database
    await orm.em.persistAndFlush(post)

    const posts = await orm.em.find(Post, {})
    console.log(posts)

}

main().catch(err => {
    console.log(err)
})