create_user_backup() {
    username=$1

    timestamp=$(date +%s)

    mkdir -p /data/backups/$timestamp

    tar -cvzf /data/backups/$timestamp/$username.tar.gz /home/$username
}

create_user_backup $1
