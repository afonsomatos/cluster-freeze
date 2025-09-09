import { NodeClusterRunnerSocket, NodeRuntime } from "@effect/platform-node";
import { DateTime, Effect, Array, Layer, Random, Chunk } from "effect";
import { ClusterDatabaseLive } from "./database";
import { SitemapRetriever } from "./entity";

const RunnerLive = NodeClusterRunnerSocket.layer({
    storage: "sql",
	clientOnly: true
}).pipe(Layer.provide(ClusterDatabaseLive));
const randString =  Random.shuffle("abcdefghijklmnopqrstuvwxyz1234567890_").pipe(Effect.map(Chunk.join("")));

NodeRuntime.runMain(
    Effect.gen(function* () {
        const client = yield* SitemapRetriever.client;
        const id = yield* randString
        const key = yield* randString

        console.log("It's going to freeze now...");

        yield* Effect.all(
            Array.makeBy(5, () => Effect.gen(function* () {
                yield* client(id).index({ url: key });
            })),
            { concurrency: 5 }
        );

        console.log("If this is printed, then bug is fixed!");
    }).pipe(Effect.provide(RunnerLive))
);
