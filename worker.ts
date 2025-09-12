import { ClusterCron, RunnerAddress } from "@effect/cluster/index";
import { NodeClusterRunnerSocket, NodeRuntime } from "@effect/platform-node/index";
import { Chunk, Cron, Deferred, Effect, Fiber, Layer, Logger, LogLevel, Option, Random } from "effect/index";
import { ClusterDatabaseLive } from "./database";

const makeRunner = (port: number) =>
    NodeClusterRunnerSocket.layer({
        storage: "sql",
        shardingConfig: {
            runnerAddress: Option.some(RunnerAddress.make("localhost", port)),
            runnerListenAddress: Option.some(RunnerAddress.make("localhost", port))
            // keep all other defaults (prod-like)
        }
    }).pipe(Layer.provide(ClusterDatabaseLive));

let trigger!: Deferred.Deferred<void>;

const cron = Layer.unwrapEffect(
    Effect.gen(function*() {
        return ClusterCron.make({
            name: `Repro38hnc`,
            cron: Cron.unsafeParse("*/1 * * * * *"),
            calculateNextRunFromPrevious: true, // predictable cadence
            execute: Effect.gen(function* () {
                // finish near the end of the second so scheduling happens immediately after
                yield* Effect.sleep(950);
                yield* Effect.logWarning("running");
                // signal outer loop that the reply has been saved
                if (trigger) {
                    yield* Deferred.succeed(trigger, void 0);
                }
            })
    });
}));

const createRunner = (port: number) => Layer.launch(cron.pipe(Layer.provide(makeRunner(port))));

NodeRuntime.runMain(
    Effect.gen(function* () {
        // Start both runners (prod-like: cron registered on both)
        let a = yield* Effect.forkDaemon(createRunner(4021));
        let b = yield* Effect.forkDaemon(createRunner(4022));

        // wait so cron definitely ran at least once before first flap
        yield* Effect.sleep(1500);

        while (true) {
            // wait for current tick to complete (reply saved), then cut runners
            trigger = yield* Deferred.make<void>();
            yield* Deferred.await(trigger);

            // drop both runners right after reply is written
            yield* Fiber.interrupt(a);
            yield* Fiber.interrupt(b);

            // keep them down long enough to avoid immediate processed marking
            yield* Effect.sleep(450);

            // bring them back
            a = yield* Effect.forkDaemon(createRunner(4021));
            b = yield* Effect.forkDaemon(createRunner(4022));

            // give runners time to bind and next tick to actually run before next cycle
            yield* Effect.sleep(1200);
        }
    }).pipe(Logger.withMinimumLogLevel(LogLevel.Warning)),
    { disablePrettyLogger: true }
);
