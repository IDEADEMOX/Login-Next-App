import "dotenv/config";
import { createClient } from "redis";

const connectionString = `${process.env.REDIS_URL}`;

export const redis = await createClient({ url: connectionString })
  .on("error", (err) => {
    console.error("Redis Client Error");
    console.error(err);
  })
  .connect();
