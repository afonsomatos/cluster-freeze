import { Entity, ClusterSchema } from "@effect/cluster";
import { Rpc } from "@effect/rpc";
import { Schema } from "effect";

export const SitemapRetriever = Entity.make("Omg49", [
    Rpc.make("index", {
        payload: {
            url: Schema.String,
        },
        primaryKey(payload) {
            return payload.url
        },
        success: Schema.Array(Schema.String),
        error: Schema.Any
    }).annotate(ClusterSchema.Persisted, true)
]);