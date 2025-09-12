import { ClusterCron, RunnerAddress } from "@effect/cluster/index";
import { NodeClusterRunnerSocket, NodeRuntime } from "@effect/platform-node/index";
import { Cron, Effect, Fiber, Layer, Logger, LogLevel, Option } from "effect/index";
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

const cron = ClusterCron.make({
    name: "Repro1020",
    cron: Cron.unsafeParse("*/1 * * * * *"),
    calculateNextRunFromPrevious: true, // predictable cadence
    execute: Effect.sleep(900).pipe(Effect.andThen(Effect.logWarning("running")))
});
const createRunner = (port: number) => Layer.launch(cron.pipe(Layer.provide(makeRunner(port))));

NodeRuntime.runMain(
    Effect.gen(function* () {
        // Start both runners (prod-like: cron registered on both)
        let a = yield* Effect.forkDaemon(createRunner(4021));
        let b = yield* Effect.forkDaemon(createRunner(4022));

        // wait so cron definitely ran at least once before first flap
        yield* Effect.sleep(1200);

        while (true) {
            // align to boundary
            const now = Date.now();
            const toBoundary = 1000 - (now % 1000);
            if (toBoundary > 0) yield* Effect.sleep(toBoundary);

            yield* Effect.logInfo("another cycle");
            // wait ~915ms into the second, right AFTER execute completes
            // (reply is saved) and while ensure() is scheduling next run
            yield* Effect.sleep(915);

            // drop both runners right after reply is written
            yield* Fiber.interruptFork(a);
            yield* Fiber.interruptFork(b);
            yield* Effect.sleep(320); // short window so 'processed' isn't marked

            // bring them back
            a = yield* Effect.forkDaemon(createRunner(4021));
            b = yield* Effect.forkDaemon(createRunner(4022));

            // allow next second to start
            yield* Effect.sleep(800);
        }
    }).pipe(Logger.withMinimumLogLevel(LogLevel.Warning)),
    { disablePrettyLogger: true }
);
