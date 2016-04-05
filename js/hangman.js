var Hangman = (function ($, window) {
    'use strict';

    var AllowedChars = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
        'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'ä', 'ö', 'ü', 'ß'
    ];
    var wordsByDifficulty = [];
    var difficulty = 10;
    var minDifficulty;
    var maxDifficulty;
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
                    ? 'Geschafft! Das nächste Mal kriegst du es ohne Hilfe hin, oder?'
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
                newGame(difficulty);
            }
        }
    }


    function newGame(newDifficulty) {
        difficulty = newDifficulty;
        document.location.hash = '#difficulty=' + difficulty;
        selectedChars = [];
        badChars = [];
        mistakes = 0;
        endOfGame = false;
        hinted = false;
        $('#message').removeClass('won').empty();
        $('[id^=mistake-]').addClass('invisible');
        $('#bad-characters').text('bislang keine ;-)');
        var dIdx = difficulty - 1 + minDifficulty;
        word = wordsByDifficulty[dIdx][Math.floor(Math.random() * wordsByDifficulty[dIdx].length)];
        wordChars = word.split('');
        update();
    }


    function doInit() {
        console.log("%c c't %c Hangman v1.0 BETA patch level 3", 'background-color: #1358A3; color: white; font-weight: bold; font-style: italic; font-size: 150%;', 'background-color: white; color: #1358A3; font-weight: bold; font-size: 150%;');
        console.log("%cCopyright © 2016 Oliver Lau <ola@ct.de>, Heise Medien GmbH & Co. KG.\nAlle Rechte vorbehalten.", 'color: #1358A3; font-weight: bold;');
        $(window).on({
            keypress: onKeyPressed
        });
        $.ajax({
            url: 'data/de-verben.txt',
            method: 'GET',
            type: 'text/plain',
            success: function (data) {
                var words = data.split("\n");
                var histo = {};
                var nChars = 0;
                $.each(words, function (i, word) {
                    $.each(word.split(''), function (i, c) {
                        if (typeof histo[c] === 'undefined') {
                            histo[c] = 0;
                        }
                        ++histo[c];
                        ++nChars;
                    });
                });
                for (var i in histo) {
                    histo[i] = 1 - histo[i] / nChars;
                }
                wordsByDifficulty = [];
                minDifficulty = Number.MAX_VALUE;
                maxDifficulty = Number.MIN_VALUE;
                $.each(words, function (i, word) {
                    var charset = [];
                    var allChars = word.split('');
                    $.each(allChars, function (i, c) {
                        if (charset.indexOf(c) < 0) {
                            charset.push(c);
                        }
                    });
                    var d = 0;
                    $.each(charset, function (i, c) {
                        d += Math.exp(histo[c]);
                    });
                    d = Math.floor(d * charset.length / allChars.length / 3);
                    wordsByDifficulty[d] = wordsByDifficulty[d] || [];
                    wordsByDifficulty[d].push(word);
                    minDifficulty = Math.min(d, minDifficulty);
                    maxDifficulty = Math.max(d, maxDifficulty);
                });
                var selectEl = $('#difficulties');
                for (var i in wordsByDifficulty) {
                    selectEl.append($('<option></option>').attr('value', i).text(i - minDifficulty + 1));
                }
                selectEl.change(function (e) {
                    newGame(parseInt($(this).val()) - minDifficulty + 1);
		    $(this).blur();
                });
                selectEl.val(difficulty).change();
            }
        })
    }

    return {
        init: doInit
    };

})($, window);

$(document).ready(Hangman.init);
