get_cpu_stats() {
  nproc

  top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}'
}

get_cpu_stats