#!/usr/bin/env python

import sys

words = set()

for line in sys.stdin:
	words.add(line.strip())

print("\n".join(sorted(list(words))))

