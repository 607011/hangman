#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, json


frequent_letters = []


def letter_choices():
    for letter in freqs:
        yield letter



class Riddle:
    def __init__(word):
        self.word = word
        
        
    


def main():
    global frequent_letters

    # allowed letters
    letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'ä', 'ö', 'ü']

    # a dict of letters with their respective counts (initialized with 0)
    histo = dict((letter, 0) for letter in letters)

    # modified Markov chain with both successors and predecessors of each letter
    markov = dict((letter, { 'succ': histo.copy(), 'pred': histo.copy() }) for letter in letters)

    # named file must contain words line by line
    word_fn = '../data/de-alle.txt'

    all_words = [line for line in open(word_fn, mode='r', encoding='utf-8')]

    for word in all_words:
        word = word.strip().replace('ß', 'ss').lower()
        word_letters = list(word)
        N = len(word_letters)
        for i in range(0, N):
            letter = word_letters[i]
            histo[letter] += 1
            if i < N - 1:
                markov[letter]['succ'][word_letters[i + 1]] += 1
            if i > 1:
                markov[letter]['pred'][word_letters[i - 1]] += 1

    # list of letters with descending frequencies
    frequent_letters = list(map(lambda x: x[0], sorted(histo.items(), key=lambda x: x[1], reverse=True)))

    # calculate probabilities from successor and predecessor counts
    for letter in markov:
        for k in ['succ', 'pred']:
            node = markov[letter][k]
            s = sum(map(lambda x: node[x], [l for l in node]))
            for l in node:
                node[l] = round(node[l] / s, 5)
            node['sorted'] = sorted(map(lambda l: (node[l], l), [l for l in node]),
                                    key=lambda n: n[0],
                                    reverse=True)


    print(json.dumps(markov, indent=2))


    for word in all_words:
        mistakes = 0
        # pick first letter
        while 
    


if __name__ == '__main__':
    main()

