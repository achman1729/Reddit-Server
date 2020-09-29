import {MikroORM} from "@mikro-orm/core"
import { __prod__ } from "./constants"
import microConfig from "./mikro-orm.config"
import express, { Application } from "express"
import { ApolloServer} from "apollo-server-express"
import { buildSchema } from "type-graphql"
import { HelloResolver } from "./resolvers/hello"
import { PostResolver } from "./resolvers/post"
import { UserResolver } from "./resolvers/user"
import "reflect-metadata"
import redis from "redis"
import session from "express-session"
import connectRedis from "connect-redis"
import cors from 'cors'


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
    const app: Application = express()
    
    const RedisStore = connectRedis(session)
    // redis config
    const redisClient = redis.createClient({
        host: '127.0.0.1',  
        no_ready_check: true,
        auth_pass: "Man@12345",
    })
    app.use(
        cors({ 
        origin: 'http://localhost:3000',
        credentials: true
        })
    )
    
    // run the session before the apollo middelware
    // the session needs to be used in the apollo middleware
    // TTL is for how long it should last in redis
    // disableTouch keeps the session forever and reduces the number of requests made to redis
    app.use(
      session({
          name: 'qid',
          store: new RedisStore({ 
              client: redisClient,
              disableTouch: true            
            }),
            cookie: {
                maxAge: 1000 * 60 *60 * 24 * 365,     //  1 year
                httpOnly: true,
                sameSite: 'lax',     //  protecting CSRF
                secure: __prod__,   //cookie only works in HTTPS if set to true. Setting it to prod
            },
          secret: 'alksjdfhak;jsldhflkajshdf',
          resave: false,
          saveUninitialized: false
      })
    )
    // apollo server config
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        // context is an object that is accessible by all the resolvers
        // orm.em has everything
        context: ({ req, res }) => ({ em: orm.em, req, res })
    })

    apolloServer.applyMiddleware({
        app, 
        cors: false})

    app.listen(5000, () => {
        console.log('server running on localhost:5000')
    })

}

main().catch(err => {
    console.log(err)
})