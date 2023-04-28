get_user_ssh_key() {
  username=$1

  cat /home/$username/.ssh/authorized_keys
}

get_user_ssh_key "$1"