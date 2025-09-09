import { NodeClusterRunnerSocket, NodeRuntime } from "@effect/platform-node";
import { DateTime, Effect, Array, Layer, Random, Chunk } from "effect";
import { ClusterDatabaseLive } from "./database";
import { SitemapRetriever } from "./entity";

const RunnerLive = NodeClusterRunnerSocket.layer({
    storage: "sql",
	clientOnly: true
}).pipe(Layer.provide(ClusterDatabaseLive));

NodeRuntime.runMain(
    Effect.gen(function* () {
        const client = yield* SitemapRetriever.client;
        const id = Chunk.join(yield* Random.shuffle("abcdefghijklmnopqrstuvwxyz1234567890_"), "");

        console.log("It's going to freeze now...");

        yield* Effect.forEach(
            Array.makeBy(5, () => "https://www.mindfulhealthhaven.com/sitemap.xml"),
            Effect.fn(function* (x) {
                yield* client(id).index({ url: x});
            }),
            { concurrency: 5 }
        );

        console.log("It's done!");
    }).pipe(Effect.provide(RunnerLive))
);
