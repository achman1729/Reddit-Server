import { __prod__ } from "./constants"
import { Post } from "./entities/Post"
import {MikroORM} from "@mikro-orm/core"
import { User } from "./entities/User";
const path = require('path');

// to type it, use Parameters and the type will change and set it up for first element of the array
export default {
migrations: {
    // path to the folder with migrations
    path: path.join(__dirname, './migrations'),
    // regex pattern for the migration files
    pattern: /^[\w-]+\d+\.[tj]s$/ 
},
  entities: [Post, User],
  dbName: "redditDB",
  type: "postgresql",
  user: "postgres",
  password: "Man@12345",
  debug: true,
} as Parameters<typeof MikroORM.init>[0]
