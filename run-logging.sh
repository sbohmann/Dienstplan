#!/bin/bash
output_file="$1"
shift
echo Arguments for annotate-output: "[$@]"
# echo in a subshell is required for opening the output file for each line
annotate-output +%Y-%m-%dT%H:%M:%S.%N "$@" | while read line; do (echo "$line" >> "$output_file"); done

