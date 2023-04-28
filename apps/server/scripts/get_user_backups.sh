get_user_backups() {
  username=$1

  find /data/backups/*/$username.tar.gz -type f | sed 's/\/data\/backups\///g' | sed 's/\/'$username'.tar.gz//g'
}

get_user_backups "$1"
