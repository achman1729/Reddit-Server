import { __prod__ } from "./constants"
import { Post } from "./entities/Post"
import {MikroORM} from "@mikro-orm/core"
const path = require('path');

// to type it, use Parameters and the type will change and set it up for first element of the array
export default {
migrations: {
    // path to the folder with migrations
    path: path.join(__dirname, './migrations'),
    // regex pattern for the migration files
    pattern: /^[\w-]+\d+\.[tj]s$/ 
},
  entities: [Post],
  dbName: "redditDB",
  type: "postgresql",
  user: "postgres",
  password: "Man@12345",
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0]
