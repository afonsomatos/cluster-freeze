import { Entity, ClusterSchema } from "@effect/cluster";
import { Rpc } from "@effect/rpc";
import { Schema } from "effect";
import { DateTime, Duration } from "effect";

const floor = (date: DateTime.DateTime, duration: Duration.Duration) => {
    const nowMillis = DateTime.toEpochMillis(date);
    const bucketMillis = Duration.toMillis(duration);
    const bucketCeil = Math.floor(nowMillis / bucketMillis) * bucketMillis;
    return DateTime.unsafeMake(bucketCeil);
};

export const SitemapRetriever = Entity.make("Omgfg", [
    Rpc.make("index", {
        payload: {
            url: Schema.String,
            date: Schema.DateTimeUtc,
        },
        primaryKey(payload) {
            const time = floor(payload.date, Duration.seconds(5));
            return `${payload.url}/${DateTime.formatIso(time)}`;
        },
        success: Schema.Array(Schema.String),
        error: Schema.Any
    }).annotate(ClusterSchema.Persisted, true)
]);