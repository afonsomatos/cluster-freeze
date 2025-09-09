import { NodeClusterShardManagerSocket, NodeRuntime } from "@effect/platform-node";
import { Layer } from "effect";
import { ClusterDatabaseLive } from "./database";

// Yes, it's just this.
NodeClusterShardManagerSocket.layer({ storage: "sql" }).pipe(
    Layer.provide(ClusterDatabaseLive),
    Layer.launch,
	NodeRuntime.runMain
);
