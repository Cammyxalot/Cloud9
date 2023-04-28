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

  # Copy user files to temporary directory
  mkdir /tmp/$username
  cp -a /home/$username/. /tmp/$username/

  # Mount user disk
  mount -t auto -o loop /media/$username.img /home/$username

  # Copy user files back to home directory
  cp -a /tmp/$username/. /home/$username/

  # Clean up
  rm -r /tmp/$username

  # Add ssh key
  echo $ssh_key > /home/$username/.ssh/authorized_keys

  # Add user directory permissions  
  chown -R $username:$username /home/$username
}

create_user $1 $2 $3
