var Hangman = (function ($, window) {
    'use strict';

    var Exclamations = ['Yay', 'Prima', 'Super', 'Klasse', 'Gratulation', 'Wouw', 'Toll', 'Dufte', 'Ausgezeichnet', 'Gewonnen'];
    var MaxMistakes = 7;

    var allWords = [];
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
        if (c === ' ' || e.charCode === 13) {
            newGame();
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


    function newGame() {
        selectedChars = [];
        badChars = [];
        mistakes = 0;
        endOfGame = false;
        cheated = false;
        microFlash();
        $('#message').empty();
        $('#message-container').removeClass().addClass('invisible');
        $('[id^=mistake-]').addClass('invisible');
        word = allWords[Math.floor(Math.random() * allWords.length)];
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
        allWords = data.split(/\r\n|\n|\r/).map(function (word) {
            return word.replace('ß', 'ss');
        });
        $('#n-words').text(allWords.length);
        newGame();
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
        console.log('%c c\'t %c Hangman v1.0.8', 'background-color: #1358A3; color: white; font-weight: bold; font-style: italic; font-size: 150%;', 'background-color: white; color: #1358A3; font-weight: bold; font-size: 150%;');
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
            newGame();
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
