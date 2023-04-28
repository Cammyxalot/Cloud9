get_user_databases_size() {
  username=$1

  # Get user databases
  databases_size=$(mysql -u root -p$DB_ROOT_PASSWORD -h $DB_HOST -e "SELECT table_schema \"Database\", SUM(data_length + index_length) / 1024 / 1024 \"Size (MB)\" FROM information_schema.TABLES GROUP BY table_schema" -s)

  echo $databases_size
}

get_user_databases_size "$1"
