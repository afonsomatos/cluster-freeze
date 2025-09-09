import { NodeClusterRunnerSocket, NodeRuntime } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { ClusterDatabaseLive } from "./database";
import { SitemapRetriever } from "./entity";

const RunnerLive = NodeClusterRunnerSocket.layer({
    storage: "sql"
}).pipe(Layer.provide(ClusterDatabaseLive));

export const SitemapRetrieverLive = SitemapRetriever.toLayer(
    Effect.gen(function* () {
        return {
            index: Effect.fn("SitemapRetriever.index")(function* ({ payload: { url } }) {
				console.log("running")
                return [];
            })
        };
    }),
    { concurrency: 2 }
).pipe(Layer.provide(RunnerLive));

NodeRuntime.runMain(SitemapRetrieverLive.pipe(Layer.launch))