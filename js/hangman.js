﻿var Hangman = (function ($, window) {
    'use strict';

    var Exclamations = ['Yay', 'Prima', 'Super', 'Klasse', 'Gratulation', 'Wouw', 'Toll', 'Dufte', 'Ausgezeichnet', 'Gewonnen'];
    var MaxMistakes = 7;

    var wordsByDifficulty = [];
    var difficulty = 5;
    var minDifficulty;
    var maxDifficulty;
    var word = undefined;
    var wordChars = [];
    var selectedChars = [];
    var badChars = [];
    var mistakes = 0;
    var cheated = false;
    var endOfGame = false;


    function showMessageContainer() {
        $('#message-container').removeClass('invisible');
        $('#message').append('<p><button>Weiter</button></p>');
    }


    function flash() {
        $('body').addClass('flash');
        setTimeout(function () {
            $('body').removeClass('flash');
        }, 150);
    }


    function microFlash() {
        $('body').addClass('micro-flash');
        setTimeout(function () {
            $('body').removeClass('micro-flash');
        }, 250);
    }


    function update() {
        var wordEl = $('#word');
        var guessed = wordChars.map(function (c) {
            return selectedChars.indexOf(c) < 0
                ? '_'
                : c;
        }).join('');
        wordEl.text(guessed);
        $('#mistake-' + mistakes).removeClass('invisible');
        var msgEl = $('#message');
        if (mistakes === MaxMistakes) {
            endOfGame = true;
            msgEl.html('<p>Du hast leider verloren!</p>' +
                '<p>Das gesuchte Wort war &ldquo;' + word + '&rdquo;.</p>');
            showMessageContainer();
        }
        else if (guessed.indexOf('_') < 0) {
            endOfGame = true;
            msgEl.addClass('won').html(cheated
                ? ('<p>Geschafft!</p>' +
                  '<p>&ldquo;' + word + '&rdquo; ist das richtige Wort!</p>' +
                  '<p>Das nächste Mal bekommst du es ohne Hilfe hin, oder?</p>')
                : ('<p>' + (Exclamations[Math.floor(Math.random() * Exclamations.length)]) + '!</p>' +
                  '<p>&ldquo;' + word + '&rdquo; ist das richtige Wort!</p>'));
            showMessageContainer();
        }
    }


    function selectChar(c) {
        if (wordChars.indexOf(c) >= 0) {
            if (selectedChars.indexOf(c) < 0) {
                selectedChars.push(c);
                keyButton(c).addClass('good');
            }
        }
        else {
            if (badChars.indexOf(c) < 0) {
                badChars.push(c);
                ++mistakes;
                keyButton(c).addClass('bad');
                flash();
            }
        }
        update();
    }


    function keyButton(c) {
        return $('#virtual-keyboard button:contains("' + c + '")');
    }


    function pressVirtualKey(c) {
        keyButton(c).click();
    }


    function onKeyPressed(e) {
        var c = String.fromCharCode(e.charCode).toLowerCase();
        if (c === ' ') {
            newGame(difficulty);
        }
        else if (!endOfGame) {
            if (c === '?') {
                cheated = true;
                c = wordChars.find(function (wc) {
                    return selectedChars.indexOf(wc) < 0;
                });
            }
            pressVirtualKey(c);
        }
    }


    function keyButtonClicked() {
        selectChar($(this).text());
    }


    function newGame(newDifficulty) {
        difficulty = newDifficulty;
        document.location.hash = '#difficulty=' + difficulty;
        selectedChars = [];
        badChars = [];
        mistakes = 0;
        endOfGame = false;
        cheated = false;
        microFlash();
        $('#message').empty();
        $('#message-container').removeClass().addClass('invisible');
        $('[id^=mistake-]').addClass('invisible');
        var dIdx = difficulty - 1 + minDifficulty;
        var wIdx = Math.floor(Math.random() * wordsByDifficulty[dIdx].length)
        word = wordsByDifficulty[dIdx][wIdx];
        wordChars = word.toLowerCase().split('');
        $('#word').removeClass();
        $('#bad-characters').removeClass();
        if (word[0].toUpperCase() === word[0]) {
            $('#word').addClass('noun');
            $('#bad-characters').addClass('noun');
        }
        $('#virtual-keyboard button').removeClass();
        update();
    }


    function wordsLoaded(data) {
        var words = data.split("\n").map(function (word) {
            return word.replace('ß', 'ss');
        });
        $('#n-words').text(words.length);
        var histo = {};
        var nChars = 0;
        words.forEach(function (word) {
            word.split('').forEach(function (c) {
                histo[c] = histo[c] || 0
                ++histo[c];
                ++nChars;
            });
        });
        wordsByDifficulty = [];
        minDifficulty = Number.MAX_VALUE;
        maxDifficulty = Number.MIN_VALUE;
        words.forEach(function (word) {
            var charset = [];
            var allChars = word.split('');
            allChars.forEach(function (c) {
                if (charset.indexOf(c) < 0) {
                    charset.push(c);
                }
            });
            var d = charset.reduce(
                function sumDifficulty(previousValue, currentValue) {
                    return previousValue + Math.exp(1 - histo[currentValue] / nChars);
                }, 0);
            d = Math.floor(d * charset.length / allChars.length / 3);
            wordsByDifficulty[d] = wordsByDifficulty[d] || [];
            wordsByDifficulty[d].push(word);
            minDifficulty = Math.min(d, minDifficulty);
            maxDifficulty = Math.max(d, maxDifficulty);
        });
        var selectEl = $('#difficulties');
        for (var i in wordsByDifficulty) {
            selectEl.append($('<option></option>')
                .attr('value', i)
                .text(i - minDifficulty + 1));
        }
        selectEl.change(function (e) {
            newGame(parseInt($(this).val()) - minDifficulty + 1);
            $(this).blur();
        });
        selectEl.val(difficulty).change();
    }


    function newKeypressEvent(charCode) {
        var e = jQuery.Event('keypress');
        e.keyCode = e.which = e.charCode = charCode;
        return e;
    }


    function typeKey(c) {
        $(window).trigger(newKeypressEvent(c.charCodeAt()));
    }


    function doInit() {
        console.log('%c c\'t %c Hangman v1.0.7', 'background-color: #1358A3; color: white; font-weight: bold; font-style: italic; font-size: 150%;', 'background-color: white; color: #1358A3; font-weight: bold; font-size: 150%;');
        console.log('%cCopyright © 2016 Oliver Lau <ola@ct.de>, Heise Medien GmbH & Co. KG. Alle Rechte vorbehalten.', 'color: #1358A3; font-weight: bold;');
        $(window).on({
            keypress: onKeyPressed
        });
        $('#virtual-keyboard button').click(keyButtonClicked);
        $('#new-button').click(function () {
            typeKey(' ');
        });
        $('#hint-button').click(function () {
            typeKey('?');
        });
        $('#message-container').click(function () {
            newGame(difficulty);
        });
        $.ajax({
            url: 'data/de-alle.txt',
            method: 'GET',
            type: 'text/plain',
            success: wordsLoaded
        });
    }

    return {
        init: doInit
    };

})($, window);

$(document).ready(Hangman.init);
