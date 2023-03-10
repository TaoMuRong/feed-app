import axios from 'axios'
import * as oss from '../api/oss'

export async function uploadOneImage(file: File): Promise<string> {
  const imgName =
    'chat/' + Math.random() + file.name.substring(file.name.lastIndexOf('.'))
  const { data } = await oss.upload(imgName)
  const uploadUrl = data.url
  const configs = { headers: { 'Content-Type': 'image' } }

  const reader = new FileReader()
  reader.readAsArrayBuffer(file)
  return new Promise((resolve, reject) => {
    reader.onload = (e) => {
      const imgData = e.target!.result as ArrayBuffer
      axios
        .put(uploadUrl, imgData, configs)
        .then(() =>
          resolve(
            `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${imgName}`
          )
        )
        .catch((err) => reject(err))
    }
  })
}
