import { join } from "node:path";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { GraphQLModule } from "@nestjs/graphql";
import type { GraphQLFormattedError } from "graphql";
import { validateEnv, type Env } from "./config/env.schema.js";
import { HealthModule } from "./health/health.module.js";
import { UsersModule } from "./users/users.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { CaslModule } from "./casl/casl.module.js";
import { TasksModule } from "./tasks/tasks.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const isProd = config.get("NODE_ENV", { infer: true }) === "production";
        return {
          autoSchemaFile: join(process.cwd(), "src", "schema.gql"),
          sortSchema: true,
          playground: !isProd,
          introspection: !isProd,
          // CORS is handled once, globally, in main.ts (app.enableCors) so REST and GraphQL share one policy.
          cors: false,
          context: ({ req }: { req: unknown }) => ({ req }),
          formatError: (error: GraphQLFormattedError): GraphQLFormattedError => {
            if (!isProd) return error;
            // Never leak stack traces or internal exception details to a production client.
            return { message: error.message, extensions: { code: error.extensions?.["code"] } };
          }
        };
      }
    }),
    HealthModule,
    UsersModule,
    AuthModule,
    CaslModule,
    TasksModule
  ]
})
export class AppModule {}
