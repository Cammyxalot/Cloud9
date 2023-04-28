# Import dump_databases function from './dump_databases.sh'
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
. $DIR/dump_databases.sh

create_backup() {
    timestamp=$(date +%s)

    mkdir -p /data/backups/$timestamp

    for file in /home/*; do
        username=$(basename $file)

        dump_databases "$username"

        tar -cvzf /data/backups/$timestamp/$username.tar.gz $file
    done
}

create_backup
