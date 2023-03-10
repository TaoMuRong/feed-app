ssh aliyun "rm -r /root/docker/compose/nginx/templates/www/*"
scp -r  ./build/* aliyun:/root/docker/compose/nginx/templates/www
ssh aliyun "docker restart nginx"