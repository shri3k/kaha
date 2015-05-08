./deploy_kaha.sh prod

docker logs <container_name>

docker stop kaha_prod
docker start kaha_prod_previous

$GOPATH/bin/captainhook -listen-addr=<server_ip_addr> -echo -configdir ~/captainhook_configs
