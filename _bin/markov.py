#!/usr/bin/env python

import sys, json

# allowed letters
letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'ä', 'ö', 'ü']

# a dict of letters with their respective counts (initialized with 0)
histo = dict((letter, 0) for letter in letters)

# modified Markov chain with both successors and predecessors of each letter
markov = dict((letter, { 'succ': histo.copy(), 'pred': histo.copy() }) for letter in letters)

# contains words line by line
word_fn = '../data/de-alle.txt'

for word in [line for line in open(word_fn, 'r', encoding='utf-8')]:
    word = word.strip().replace('ß', 'ss').lower()
    letters = list(word)
    N = len(letters)
    for i in range(0, N):
        letter = letters[i]
        if i < N - 1:
            markov[letter]['succ'][letters[i + 1]] += 1
        if i > 1:
            markov[letter]['pred'][letters[i - 1]] += 1

# calculate probabilities from successor and predecessor counts
for letter in markov:
    for k in ['succ', 'pred']:
        node = markov[letter][k]
        s = sum(map(lambda x: node[x], [l for l in node]))

        # find most probable sucessor/predecessor of letter
        best_chance = 0.0
        best = None
        for l in node:
            node[l] = node[l] / s
            if node[l] > best_chance:
                best_chance = node[l]
                best = l
        node['best'] = best
        
print(json.dumps(markov, indent=2))
