import { NodeClusterRunnerSocket, NodeRuntime } from "@effect/platform-node";
import { DateTime, Effect, Array, Layer, Random, Chunk } from "effect";
import { ClusterDatabaseLive } from "./database";
import { SitemapRetriever } from "./entity";

const RunnerLive = NodeClusterRunnerSocket.layer({
    storage: "sql",
	clientOnly: true
}).pipe(Layer.provide(ClusterDatabaseLive));

const randString = Random.shuffle("abcdefghijklmnopqrstuvwxyz1234567890_").pipe(Effect.map(Chunk.join("")));

const program = Effect.fn(function* (id: string, key: string) {
    const client = yield* SitemapRetriever.client;
  

    console.log("It's going to freeze now...");

    yield* Effect.all(
        Array.makeBy(20, () => Effect.gen(function* () {
            yield* Effect.sleep(2000);
            yield* client(id).index({ url: key });
        })),
        { concurrency: "unbounded" }
    );

    console.log("If this is printed twice, then bug is fixed!");
}, Effect.provide(RunnerLive))



async function main() {

    const id = await Effect.runPromise(randString);
    const key = await Effect.runPromise(randString);


NodeRuntime.runMain(program(id, key))
NodeRuntime.runMain(program(id, key))
NodeRuntime.runMain(program(id, key))
NodeRuntime.runMain(program(id, key))
NodeRuntime.runMain(program(id, key))
NodeRuntime.runMain(program(id, key))
NodeRuntime.runMain(program(id, key))
}

main()