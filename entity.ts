import { Entity, ClusterSchema } from "@effect/cluster";
import { Rpc } from "@effect/rpc";
import { Schema } from "effect";

export const SitemapRetriever = Entity.make("SitemapRetriever", [
    Rpc.make("index", {
        payload: {
            url: Schema.String,
            date: Schema.DateTimeUtc
        },
        primaryKey(payload) {
            return `${payload.url}555`;
        },
        success: Schema.Array(Schema.String),
        error: Schema.Any
    }).annotate(ClusterSchema.Persisted, true)
]);