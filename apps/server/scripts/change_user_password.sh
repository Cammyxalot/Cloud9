change_user_password() {
  username=$1
  password=$2

  #change user password
  echo "$username:$password" | chpasswd
}

change_user_password "$1" "$2"