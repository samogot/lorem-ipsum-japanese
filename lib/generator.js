var generator = function () {
  var options = (arguments.length) ? arguments[0] : {}
    , count = options.count || 1
    , units = options.units || 'sentences'
    , sentenceLowerBound = options.sentenceLowerBound || 5
    , sentenceUpperBound = options.sentenceUpperBound || 15
    , paragraphLowerBound = options.paragraphLowerBound || 3
    , paragraphUpperBound = options.paragraphUpperBound || 7
    , format = options.format || 'plain'
    , dictionary = options.dictionary || require('./dictionary')
    , random = options.random || Math.random
    , suffix = options.suffix || require('os').EOL;

  units = simplePluralize(units.toLowerCase());

  var randomInteger = function (min, max) {
    return Math.floor(random() * (max - min + 1) + min);
  };

  var pickOne = function (array) {
    return array[randomInteger(0, array.length - 1)];
  };

  var randomWord = function (dictionary) {
    var wordType = pickOne(dictionary.mixWeighting);
    var word = '';
    var types = ['', 'kanji', 'hiragana', 'katakana'];
    var length = pickOne(dictionary[types[wordType] + 'LengthWeighting']);
    for (var i = 0; i < length; ++i) {
      word += pickOne(dictionary[types[wordType]]);
    }
    return word;
  };

  var randomSentence = function (dictionary, lowerBound, upperBound) {
    var sentence = ''
      , bounds = {min: 0, max: randomInteger(lowerBound, upperBound)};

    while (bounds.min < bounds.max) {
      sentence = sentence + randomWord(dictionary);
      bounds.min = bounds.min + 1;
    }

    return sentence;
  };

  var randomParagraph = function (dictionary, lowerBound, upperBound, sentenceLowerBound, sentenceUpperBound) {
    var paragraph = ''
      , bounds = {min: 0, max: randomInteger(lowerBound, upperBound)};

    while (bounds.min < bounds.max) {
      paragraph = paragraph + '。' + randomSentence(dictionary, sentenceLowerBound, sentenceUpperBound);
      bounds.min = bounds.min + 1;
    }

    if (paragraph.length) {
      paragraph = paragraph.slice(1);
      paragraph = paragraph + '。';
    }

    return paragraph;
  };

  var iter = 0
    , bounds = {min: 0, max: count}
    , string = ''
    , prefix = ''
    , openingTag
    , closingTag;

  if (format == 'html') {
    openingTag = '<p>';
    closingTag = '</p>';
  }

  while (bounds.min < bounds.max) {
    switch (units.toLowerCase()) {
      case 'words':
        string = string + randomWord(dictionary);
        break;
      case 'sentences':
        string = string + '。' + randomSentence(dictionary, sentenceLowerBound, sentenceUpperBound);
        break;
      case 'paragraphs':
        var nextString = randomParagraph(dictionary, paragraphLowerBound, paragraphUpperBound, sentenceLowerBound, sentenceUpperBound);

        if (format == 'html') {
          nextString = openingTag + nextString + closingTag;
          if (bounds.min < bounds.max - 1) {
            nextString = nextString + suffix; // Each paragraph on a new line
          }
        }
        else if (bounds.min < bounds.max - 1) {
          nextString = nextString + suffix + suffix; // Double-up the EOL character to make distinct paragraphs, like carriage return
        }

        string = string + nextString;

        break;
    }

    bounds.min = bounds.min + 1;
  }

  if (string.length) {

    if (string.indexOf('。') == 0) {
      string = string.slice(1);
    }

    if (units == 'sentences') {
      string = string + '。';
    }
  }

  return string;
};

function simplePluralize(string) {
  if (string.indexOf('s', string.length - 1) === -1) {
    return string + 's';
  }
  return string;
}

module.exports = generator;
