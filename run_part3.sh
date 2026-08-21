#!/bin/bash
scripts=$(sed -n '75,111p' all_scripts.txt)
for script in $scripts; do
  echo "Running $script"
  if [[ $script == *.py ]]; then
    python3 "$script"
  elif [[ $script == *.cjs || $script == *.js || $script == *.ts ]]; then
    npx tsx "$script"
  fi
done
