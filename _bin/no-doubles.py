#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys

words = set()

for line in sys.stdin:
	words.add(line.strip())

print("\n".join(sorted(list(words))))

