import { createClient } from 'redis';


export const redis = createClient({
    url: process.env.REDIS_URL,
});
export async function init() {
    redis.on('error', (err) => console.log('Redis Client Error', err));
    await redis.connect();
}
export async function close() {
    await redis.disconnect()
}


