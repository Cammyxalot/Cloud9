dump_databases() {
  username=$1

  # Get the list of databases owned by the user
  databases_name=$(mysql -u root -p$DB_ROOT_PASSWORD -h $DB_HOST -e "SELECT DISTINCT table_schema FROM information_schema.schema_privileges WHERE grantee = \"'$username'@'%'\"" -s)

  # Dump each database
  for database_name in $databases_name
  do
    mysqldump -u root -p$DB_ROOT_PASSWORD -h $DB_HOST $database_name > /home/$username/mysqldumps/$database_name.sql
  done
}
