import {MikroORM} from "@mikro-orm/core"
import { __prod__ } from "./constants"
import microConfig from "./mikro-orm.config"
import express from "express"
import { ApolloServer} from "apollo-server-express"
import { buildSchema } from "type-graphql"
import { HelloResolver } from "./resolvers/hello"
import { PostResolver } from "./resolvers/post"
import { UserResolver } from "./resolvers/user"
import "reflect-metadata"


const main = async () => {

    // DB config
    const orm = await MikroORM.init(microConfig)
    // to run auto migrations
    await orm.getMigrator().up()

    // const post = orm.em.create(Post, {title: "My first post"})
    // // to insert in the database
    // await orm.em.persistAndFlush(post)

    // const posts = await orm.em.find(Post, {})
    // console.log(posts)
    
    // app config
    const app = express()

    // apollo server config
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        // context is an object that is accessible by all the resolvers
        // orm.em has everything
        context: () => ({ em: orm.em })
    })

    apolloServer.applyMiddleware({app})

    app.listen(5000, () => {
        console.log('server running on localhost:5000')
    })

}

main().catch(err => {
    console.log(err)
})