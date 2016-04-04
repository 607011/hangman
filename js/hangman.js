var Hangman = (function ($, window) {
    'use strict';

    var AllowedChars = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
        'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'ä', 'ö', 'ü', 'ß'
    ];
    var Verbs = [];
    var word = undefined;
    var wordChars = [];
    var selectedChars = [];
    var badChars = [];
    var mistakes = 0;
    var MaxMistakes = 7;
    var hinted = false;
    var endOfGame = false;

    function flash() {
        $('body').addClass('flash');
        setTimeout(function () {
            $('body').removeClass('flash');
        }, 150);
    }


    function update() {
        var wordEl = $('#word');
        var guessed = $.map(wordChars, function (c) {
            return selectedChars.indexOf(c) < 0
                ? '_'
                : c;
        }).join('');
        wordEl.text(guessed);
        if (badChars.length > 0) {
            $('#bad-characters').html(badChars.join(' '));
        }
        $('#mistake-' + mistakes).removeClass('invisible');
        var msgEl = $('#message');
        if (mistakes === MaxMistakes) {
            endOfGame = true;
            msgEl.text('Du hast verloren! Das gesuchte Wort war "' + word + '".');
        }
        else {
            if (guessed.indexOf('_') < 0) {
                endOfGame = true;
                msgEl.addClass('won').text(hinted
                    ? 'Geschafft! Das nächste Mal schaffst du es ohne Hilfe, oder?'
                    : 'Yay! - Du hast gewonnen!');
            }
        }
    }


    function onKeyPressed(e) {
        var c = String.fromCharCode(e.charCode).toLowerCase();
        if (!endOfGame) {
            if (c === '?') {
                hinted = true;
                for (var i = 0; i < wordChars.length; ++i) {
                    if (selectedChars.indexOf(wordChars[i]) < 0) {
                        c = wordChars[i];
                        break;
                    }
                }
            }
            if (AllowedChars.indexOf(c) >= 0) {
                if (wordChars.indexOf(c) >= 0) {
                    if (selectedChars.indexOf(c) < 0) {
                        selectedChars.push(c);
                    }
                }
                else {
                    if (badChars.indexOf(c) < 0) {
                        badChars.push(c);
                        ++mistakes;
                        flash();
                    }
                }
                update();
            }
        }
        else {
            if (c === ' ') {
                newGame();
            }
        }
    }


    function newGame() {
        selectedChars = [];
        badChars = [];
        mistakes = 0;
        endOfGame = false;
        hinted = false;
        $('#message').removeClass('won').empty();
        $('[id^=mistake-]').addClass('invisible');
        $('#bad-characters').text('bislang keine ;-)');
        var wordLen = Math.floor(Math.random() * (Verbs.length - 4)) + 4;
        word = Verbs[wordLen][Math.floor(Math.random() * Verbs[wordLen].length)];
        wordChars = word.split('');
        update();
    }


    function doInit() {
        console.log("%c c't %c Hangman v1.0 BETA patch level 2", 'background-color: #1358A3; color: white; font-weight: bold; font-style: italic; font-size: 150%;', 'background-color: white; color: #1358A3; font-weight: bold; font-size: 150%;');
        console.log("%cCopyright © 2016 Oliver Lau <ola@ct.de>, Heise Medien GmbH & Co. KG.\nAlle Rechte vorbehalten.", 'color: #1358A3; font-weight: bold;');
        $(window).on({
            keypress: onKeyPressed
        });
        $.ajax({
            url: 'data/de-verben.txt',
            method: 'GET',
            type: 'text/plain',
            success: function (data) {
                $.each(data.split("\n"), function (i, word) {
                    if (typeof Verbs[word.length] === 'undefined') {
                        Verbs[word.length] = [];
                    }
                    Verbs[word.length].push(word);
                });
                newGame();
            }
        })
    }

    return {
        init: doInit
    };

})($, window);

$(document).ready(Hangman.init);
