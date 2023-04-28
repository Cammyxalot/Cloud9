change_user_db_password() {
  username=$1
  password=$2

  #change user db password
  mysql -u root -p$DB_ROOT_PASSWORD -h $DB_HOST -e "SET PASSWORD FOR '$username'@'%' = PASSWORD('$password')"
}

change_user_db_password "$1" "$2"