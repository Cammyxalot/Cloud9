# Import dump_databases function from './dump_databases.sh'
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
. $DIR/dump_databases.sh

create_user_backup() {
    username=$1

    dump_databases "$username"

    timestamp=$(date +%s)

    mkdir -p /data/backups/$timestamp

    tar -cvzf /data/backups/$timestamp/$username.tar.gz /home/$username
}

create_user_backup "$1"
