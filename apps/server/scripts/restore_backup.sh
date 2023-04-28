restore_backup() {
  username=$1
  timestamp=$2

  # Save current user disk
  current_timestamp=$(date +%s)
  mkdir -p /data/backups/$current_timestamp
  tar -cvzf /data/backups/$current_timestamp/$username.tar.gz /home/$username

  # Restore user disk
  rm -rf /home/$username/*
  tar -xvzf /data/backups/$timestamp/$username.tar.gz -C /home/$username

  # Remove restored backup
  rm /data/backups/$timestamp/$username.tar.gz
}

restore_backup "$1" "$2"
