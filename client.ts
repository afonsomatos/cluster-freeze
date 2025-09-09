import { NodeClusterRunnerSocket, NodeRuntime } from "@effect/platform-node";
import { DateTime, Effect, Array, Layer } from "effect";
import { ClusterDatabaseLive } from "./database";
import { SitemapRetriever } from "./entity";

const RunnerLive = NodeClusterRunnerSocket.layer({
    storage: "sql",
	clientOnly: true
}).pipe(Layer.provide(ClusterDatabaseLive));

NodeRuntime.runMain(
    Effect.gen(function* () {
        const client = yield* SitemapRetriever.client;
        console.log("wtf");
        const result = yield* Effect.forEach(
            Array.makeBy(5, () => "https://www.mindfulhealthhaven.com/sitemap.xml"),
            Effect.fn(function* (x) {
                yield* client("1555xxwr").index({ url: x, date: yield* DateTime.now });
            }),
            { concurrency: 5 }
        );
        console.log("wtf!!");
        console.log(result.length);
    }).pipe(Effect.provide(RunnerLive))
);
