import OSS from 'ali-oss'

export function getOssClient() {
  return new OSS({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    accessKeySecret: process.env.ACCESS_KEY_SECRET,
    bucket: process.env.BUCKET,
  })
}
