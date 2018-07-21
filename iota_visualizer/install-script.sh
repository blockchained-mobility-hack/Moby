#!/bin/sh


# check operating system
OPERATING_SYSTEM=$(uname)
KERNEL_VERSION=$(uname -r | head -c1)

if [ "$OPERATING_SYSTEM" = "Darwin" ]; then
  echo "OSX operating system detected"
elif [ "$OPERATING_SYSTEM" = "Linux" ]; then
	echo "Linux operating system detected"
  # check kernel version
  if [ "$KERNEL_VERSION" -lt '3' ]; then
    echo "Mesh Node requires kernel version 3.0 or higher"
    echo "Please update your kernel in order to run Mesh Node"
    exit 2
  else
		echo "Valid Linux kernel detected (version 3.0+)"
	fi
else
  echo "Unsupported operating system detected!"
  echo "Install DLTStax Node on one of supported operating systems:"
  echo " - Linux"
  echo " - OSX"
  exit 3
fi
# check docker installation
if [ ! $(which docker) ]; then
  echo "Docker not found!"
  echo "Please install docker in order to start DLTStax Node"
  exit 4
else
	echo "Docker is already installed"
fi
# check user permissions
docker run --rm hello-world 1> /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "You don't have required permissions to run docker"
    echo "Add your user to the \"docker\" group with command like:"
    echo
    echo "  sudo usermod -aG docker $(whoami)"
    echo
    echo "or"
    echo
    echo "  su -c 'usermod -aG docker $(whoami)'"
    echo
    echo "Remember that you have to log out and back in for this to take effect."
    echo "Afterwards run this script again."
    exit 5
else
		echo "User has permissions required to run docker"
fi
# check docker-compose installation
if [ ! $(which docker-compose) ]; then
    echo "Docker-compose not found!"
    echo "Please install docker-compose in order to start DLTStax Node"
    exit 6
else
	echo "Docker-compose is already installed"
fi
# read nexus credentials
NEXUS_URL="registry.hashstax.eu"
NEXUS_USER="dahoam"
NEXUS_PASSWORD="dahoam2018"

# login to nexus
echo $NEXUS_PASSWORD | docker login --username $NEXUS_USER --password-stdin $NEXUS_URL
if [ $? -ne 0 ]; then
  echo "Login failed, provided credentials are invalid"
  exit 7
fi


start_dltstax_node () {
  docker-compose up -d

}

install_dltstax_node () {

  docker network create iota_network
  docker volume create --name=iota_node
  docker-compose build
  start_dltstax_node
}

DOCKER_COMPOSE_FILE_NAME="docker-compose.yml"

# download docker-compose file
 STATUS=$(curl -s -o /dev/null -I -w "%{http_code}" "https://ui.hashstax.eu/api/namespaces/Dahoam%20Hackathon/projects/IOTA%20private%20Tangle%20on%20device%20(NUCs)/docker-compose")
 if [ "$STATUS" != "200" ]; then
   echo "Download failed, file $DOCKER_COMPOSE_FILE_NAME not found on server"
   exit 8
 fi
 curl -G "https://ui.hashstax.eu/api/namespaces/Dahoam%20Hackathon/projects/IOTA%20private%20Tangle%20on%20device%20(NUCs)/docker-compose" -o $DOCKER_COMPOSE_FILE_NAME

# get vpn ip-address
export VPN_IP=$(ip addr | grep 10.177 | cut -d't' -f 2 | cut -d' ' -f 2 | cut -d'/' -f 1)

# start node
install_dltstax_node
if [ $? -ne 0 ]; then
  echo "Starting DLTStax Node failed"
  exit 9
fi

# cleanup
rm $DOCKER_COMPOSE_FILE_NAME

echo "DLTStax Node is up and running"
exit 0
