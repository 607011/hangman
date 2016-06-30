//-*- coding: utf-8 -*-
// Copyright (c) 2016 Oliver Lau <ola@ct.de>, Heise Medien GmbH & Co. KG
// All rights reserved.

var Hangman = (function ($, window) {
  "use strict";

  var Exclamations = ["Yay", "Prima", "Super", "Klasse", "Gratulation", "Wouw", "Toll", "Dufte", "Ausgezeichnet", "Gewonnen"];
  var MaxMistakes = 7;

  var allWords = [];
  var word = undefined;
  var wordChars = [];
  var selectedChars = [];
  var badChars = [];
  var nMistakes = 0;
  var cheated = false;
  var endOfGame = false;


  function showMessageContainer() {
    $("#message-container").removeClass("invisible");
    $("#message").append("<p><button>Weiter</button></p>");
  }


  function flash() {
    $("body").addClass("flash");
    setTimeout(function () {
      $("body").removeClass("flash");
    }, 150);
  }


  function microFlash() {
    $("body").addClass("micro-flash");
    setTimeout(function () {
      $("body").removeClass("micro-flash");
    }, 250);
  }


  function update() {
    var wordEl = $("#word");
    var guessed = wordChars.map(function (c) {
      return selectedChars.indexOf(c) < 0
          ? "_"
          : c;
    }).join("");
    wordEl.text(guessed);
    $("#mistake-" + nMistakes).removeClass("invisible");
    var msgEl = $("#message");
    if (nMistakes === MaxMistakes) {
      endOfGame = true;
      msgEl.html("<p>Du hast leider verloren!</p>" +
          "<p>Das gesuchte Wort war &ldquo;" + word + "&rdquo;.</p>");
      showMessageContainer();
    }
    else if (guessed.indexOf("_") < 0) {
      endOfGame = true;
      msgEl.addClass("won").html(cheated
          ? ("<p>Geschafft!</p>" +
             "<p>&ldquo;" + word + "&rdquo; ist das richtige Wort!</p>" +
             "<p>Das nächste Mal bekommst du es ohne Hilfe hin, oder?</p>")
          : ("<p>" + (Exclamations[Math.floor(Math.random() * Exclamations.length)]) + "!</p>" +
             "<p>&ldquo;" + word + "&rdquo; ist das richtige Wort!</p>"));
      showMessageContainer();
    }
  }


  function keyButton(c) {
    var erg = $("#virtual-keyboard button:contains('" + c + "')");
    console.log(erg);
    return erg;
  }


  function selectChar(c) {
    if (c.match(/[a-zäöü]/i)) {
      if (wordChars.indexOf(c) >= 0) {
        if (selectedChars.indexOf(c) < 0) {
          selectedChars.push(c);
          keyButton(c).addClass("good");
        }
      }
      else {
        if (badChars.indexOf(c) < 0) {
          badChars.push(c);
          ++nMistakes;
          keyButton(c).addClass("bad");
          flash();
        }
      }
      update();
    }
  }


  function onKeyButtonClicked() {
    $.each($(this).text().split(""), function (i, v) {
      setTimeout(function () {
        selectChar(v);
      }, i * 50);
    });
  }

  function onLevelButton() {
    console.log($(this).text());
    location.hash="#Level-"+$(this).text();
    showLevel();
    newGame();
  }

  function pressVirtualKey(c) {
    keyButton(c).click();
  }


  function onKeyPressed(e) {
    var c = String.fromCharCode(e.charCode).toLowerCase();
    if (c === " " || e.charCode === 13) {
      newGame();
    }
    else if (!endOfGame) {
      if (c === "?") {
        cheated = true;
        c = wordChars.find(function (wc) {
          return selectedChars.indexOf(wc) < 0;
        });
      }
      pressVirtualKey(c);
    }
  }


  function newGame() {
    selectedChars = [];
    badChars = [];
    nMistakes = 0;
    endOfGame = false;
    cheated = false;
    do{
      word = allWords[Math.floor(Math.random() * allWords.length)]
    }while (word.level!=location.hash.replace("#Level-",""));
    word = word.word;
    wordChars = word.toLowerCase().split("");
    $("#word").removeClass();
    if (word[0].toUpperCase() === word[0]) {
      $("#word").addClass("noun");
      $("#bad-characters").addClass("noun");
    }
    $("#message").empty();
    $("#message-container").removeClass().addClass("invisible");
    $("[id^=mistake-]").addClass("invisible");
    $("#bad-characters").removeClass();
    $("#virtual-keyboard button").removeClass("good bad");
    microFlash();
    update();
  }

  function showLevel(){
    for(var i=1;i<6;i++){
      if(i<=location.hash.replace("#Level-","")){
        $("#level #"+i).addClass("active");
      }
      else{
        $("#level #"+i).removeClass("active");
      }
    }
  }

  function wordsLoaded(data) {
    allWords = data.split(/\r\n|\n|\r/).map(function (word) {
      word = word.replace("ß", "ss");
      return {word: word, level: wordLevel(word)};
    });
    $("#n-words").text(allWords.length);
    newGame();
  }

  function wordLevel(word) {
    var value = {"a": 5,"b": 11,"c": 9,"d": 6,"e": 1,"f": 11,"g": 9,"h": 7,"i": 4,"j": 13,"k": 11,"l": 9,"m": 10,"n": 3,"o": 10,"p": 13,"q": 15,"r": 4,"s": 4,"t": 5,"u": 6,"v": 13,"w": 11,"x": 15,"y": 15,"z": 11,"ä": 5,"ö": 5,"ü": 5};
    var wordValue = 0;
    var chars = new Array();
    word = word.toLowerCase();
    word = word.split("");
    for(var i=0;i<word.length;i++){
      wordValue = wordValue + value[word[i]];
      var pos = 0;
      if(jQuery.inArray(word[i],chars)==-1){
        chars.push(word[i]);
      }
    }
    if(chars.length<4){
      wordValue = wordValue + 5;
    }
    else if(chars.length<7){
      wordValue = wordValue + 50;
    }
    else if(chars.length<10){
      wordValue = wordValue + 100;
    }
    else{
      wordValue = wordValue + 150;
    }
    if(wordValue<50){
      return 1;
    }
    else if(wordValue<100){
      return 2;
    }
    else if(wordValue<190){
      return 3;
    }
    else if(wordValue<280){
      return 4;
    }
    else{
      return 5;
    }
  }

  function newKeypressEvent(charCode) {
    var e = $.Event("keypress");
    e.keyCode = e.which = e.charCode = charCode;
    return e;
  }


  function simulateKeyPress(c) {
    $(window).trigger(newKeypressEvent(c.charCodeAt()));
  }


  function doInit() {
    console.log("%c c't %c Hangman v1.0.10", "background-color: #1358A3; color: white; font-weight: bold; font-style: italic; font-size: 150%;", "background-color: white; color: #1358A3; font-weight: bold; font-size: 150%;");
    console.log("%cCopyright © 2016 Oliver Lau <ola@ct.de>, Heise Medien GmbH & Co. KG. Alle Rechte vorbehalten.", "color: #1358A3; font-weight: bold;");
    if(!location.hash.match(/Level\-[1-5]/)){
      console.log(location.hash);
      location.hash = "#Level-1";
    }
    showLevel();
    $(window).on({
      keypress: onKeyPressed
    });
    $("#virtual-keyboard button").click(onKeyButtonClicked);
    $("button#ernstl").click(onKeyButtonClicked);
    $("#new-button").click(function () {
      simulateKeyPress(" ");
    });
    $("#hint-button").click(function () {
      simulateKeyPress("?");
    });
    $("#message-container").click(newGame);
    $("#level button").click(onLevelButton);
    $.ajax({
      url: "data/de-alle.txt",
      method: "GET",
      type: "text/plain",
      success: wordsLoaded
    });
  }

  return {
    init: doInit
  };

})($, window);

$(document).ready(Hangman.init);
