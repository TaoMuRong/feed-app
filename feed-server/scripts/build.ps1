ssh aliyun "rm -r /root/docker/feed/app/dist; rm /root/docker/feed/app/.env"
scp -r dist aliyun:/root/docker/feed/app/dist
scp -r docker/* aliyun:/root/docker/feed/
scp .env aliyun:/root/docker/feed/app/
scp package.json aliyun:/root/docker/feed/app
ssh aliyun "docker restart feed-app"