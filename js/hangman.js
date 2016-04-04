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


    function flash() {
        $('body').addClass('flash');
        setTimeout(function () {
            $('body').removeClass('flash');
        }, 150);
    }


    function update() {
        var wordEl = $('#word');
        wordEl.empty();
        var won = true;
        $.each(wordChars, function (i, c) {
            var chEl = $('<span></span>');
            if (selectedChars.indexOf(c) >= 0) {
                chEl.text(c);
            }
            else {
                chEl.text('_');
                won = false;
            }
            wordEl.append(chEl);
        });
        if (badChars.length > 0) {
            $('#bad-characters').html(badChars.join(' '));
        }
        $('#mistake-' + mistakes).removeClass('invisible');
        if (mistakes === MaxMistakes) {
            $('#message').text('Du hast verloren! Das gesuchte Wort war "' + word + '".');
        }
        else {
            if (won) {
                $('#message').text('Yay! - Du hast gewonnen!');
            }
        }
    }


    function onKeyPressed(e) {
        var c = String.fromCharCode(e.charCode).toLowerCase();
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


    function newGame() {
        selectedChars = [];
        badChars = [];
        mistakes = 0;
        $('[id^=mistake-]').addClass('invisible');
        $('#bad-characters').text('bislang keine ;-)');
        var wordLen = Math.floor(Math.random() * (Verbs.length - 4)) + 4;
        word = Verbs[wordLen][Math.floor(Math.random() * Verbs[wordLen].length)];
        wordChars = word.split('');
        console.log(wordLen, wordChars);
        update();
    }


    function doInit() {
        console.log("%c c't %c Hangman v0.9 patch level 0", 'background-color: #1358A3; color: white; font-weight: bold; font-style: italic; font-size: 150%;', 'background-color: white; color: #1358A3; font-weight: bold; font-size: 150%;');
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
