import OSS from "ali-oss"


const client = new OSS({
    region: 'oss-cn-hangzhou',
    accessKeyId: "LTAI5tLHrrVfeCY56M7Me8zm",
    accessKeySecret: "vezw1GQphfQltbN6mcznEySPczY2BS",
    bucket: 'feed-fadinglight',
})

// 下载
const downLoadUrl = client.signatureUrl('imgs/0.jpg', {
    expires: 3600,                  // 设置过期时间，默认值为1800秒
    process: "image/resize,h_200", // 设置图片处理参数， `h_200` represent height=200px
})
console.log('download', downLoadUrl)

// 上传
const url = client.signatureUrl('imgs/2.jpg', {
    // 设置过期时间，默认值为1800秒。
    expires: 3600,
    // 设置请求方式为PUT。默认请求方式为GET。
    method: 'PUT'
});
console.log('upload', url);



