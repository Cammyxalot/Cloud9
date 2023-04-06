copy_imgs() {
    echo "Copying images"
    cp -v /media/*.img /data/backups/$(date +%s)
}

copy_imgs
