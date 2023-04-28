get_memory_stats() {
  free -m | awk '/^Mem/ {printf "%.1fMB/%.1fMB", $3, $2}'
}

get_memory_stats