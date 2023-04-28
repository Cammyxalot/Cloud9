get_user_storage_used() {
  username=$1

  df /home/$username | sed 1d | grep -v used | awk '{ print $3 "\t" }'
}

get_user_storage_used "$1"