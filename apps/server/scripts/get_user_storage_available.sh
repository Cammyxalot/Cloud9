get_user_storage_available() {
  username=$1

  df /home/$username | sed 1d | grep -v used | awk '{ print $4 "\t" }'
}

get_user_storage_available "$1"