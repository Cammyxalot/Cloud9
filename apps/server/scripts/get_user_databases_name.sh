get_user_databases_name() {
  username=$1

  # Get user databases
  databases_name=$(mysql -u root -p$DB_ROOT_PASSWORD -h $DB_HOST -e "SELECT DISTINCT table_schema FROM information_schema.schema_privileges WHERE grantee = \"'$username'@'%'\"" -s)

  echo $databases_name
}

get_user_databases_name $1
