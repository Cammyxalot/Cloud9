create_database() {
  username=$1
  password=$2
  database=$3

  # Create database
  mysql -u root -p$DB_ROOT_PASSWORD -h $DB_HOST -e "CREATE DATABASE $database"

  # Check if user exists, if not create user
  if [[ $(mysql -u root -p$DB_ROOT_PASSWORD -h $DB_HOST -e "SELECT EXISTS(SELECT 1 FROM mysql.user WHERE user = '$username')" -s) == 0 ]]; then
    mysql -u root -p$DB_ROOT_PASSWORD -h $DB_HOST -e "CREATE USER '$username'@'%' IDENTIFIED BY '$password'"
  fi

  # Restrict user to database
  mysql -u root -p$DB_ROOT_PASSWORD -h $DB_HOST -e "GRANT ALL PRIVILEGES ON $database.* TO '$username'@'%'"
}

create_database "$1" "$2" "$3"
