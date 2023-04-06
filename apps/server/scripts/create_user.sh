create_user() {
  username=$1
  password=$2
  ssh_key=$3

  echo "Creating user $username"

  if [[ -e /home/$username ]]; then
    echo "User $username already exists"
    exit 1
  fi

  # Create user virtual disk of 1GB
  dd if=/dev/zero of=/media/$username.img bs=1M count=1200

  # Create file system
  mkfs -t ext4 /media/$username.img

  # Create user
  adduser $username --disabled-password --gecos ""

  # Set user password
  echo "$username:$password" | chpasswd

  # Mount user disk
  mount -t auto -o loop /media/$username.img /home/$username

  # Remove all files from user directory
  rm -rf /home/$username/*

  # Add ssh key
  mkdir /home/$username/.ssh
  echo $ssh_key > /home/$username/.ssh/authorized_keys

  # Create /home/$username/sites directory
  mkdir /home/$username/sites
  mkdir -p /etc/nginx/sites
  ln -s /home/$username/sites /etc/nginx/sites/$username

  # Add user directory permissions  
  chown -R $username:$username /home/$username
}

create_user $1 $2 $3
