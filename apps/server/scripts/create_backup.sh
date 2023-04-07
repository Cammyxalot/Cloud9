create_backup() {
    timestamp=$(date +%s)
    mkdir -p /data/backups/$timestamp
    for file in /home/*; do
        tar -cvzf /data/backups/$timestamp/$(basename $file).tar.gz $file
    done
}

create_backup
