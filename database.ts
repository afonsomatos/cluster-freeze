import { PgClient } from "@effect/sql-pg";
import { Layer, Effect, Config, Function } from "effect";
import { PlatformConfigProvider } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";

export const EnvLoader = Layer.provide(PlatformConfigProvider.layerDotEnvAdd(".env"), NodeFileSystem.layer);

export const ClusterDatabaseLive = Layer.unwrapEffect(
    Effect.gen(function* () {
        const url = yield* Config.redacted("CLUSTER_DATABASE_URL");
        return PgClient.layer({
            url,
            onnotice: Function.constVoid,
        });
    })
).pipe(Layer.provide(EnvLoader));
