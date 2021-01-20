exports.scorePassword = (pass) => {
  var score = 0;

  if (!pass) {
    return score;
  }

  // award every unique letter until 5 repetitions
  var letters = new Object();
  for (var i=0; i<pass.length; i++) {
    letters[pass[i]] = (letters[pass[i]] || 0) + 1;
    score += 5.0 / letters[pass[i]];
  }

  // bonus points for mixing it up
  var variations = {
    digits: /\d/.test(pass),
    lower: /[a-z]/.test(pass),
    upper: /[A-Z]/.test(pass),
    nonWords: /\W/.test(pass),
  }

  var variationCount = 0;
  for (var check in variations) {
      variationCount += (variations[check] == true) ? 1 : 0;
  }

  score += (variationCount - 1) * 10;

  return parseInt(score);
}


exports.isValidUrl = (string) => {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }

  return true;
}


exports.imageToBase64Async = (file, cb) => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = () => {
      cb(reader.result);
    };

    reader.onerror = cb(null);

    reader.readAsDataURL(file);
  })
}

exports.bytesToSize = (bytes) => {
   var sizes = [' Bytes', 'kb', 'mb', 'gb', 'tb'];
   if (bytes == 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + '' + sizes[i];
}

exports.getUrlParam = (key) => {
  var url_string = window.location.href;
  var url = new URL(url_string);
  var c = url.searchParams.get(key);
  return c ? c : null;
}


exports.isDateTimeSupported = () => {
  var input = document.createElement("input");
  var value = "a";
  input.setAttribute("type", "datetime-local");
  input.setAttribute("value", value);
  return input.value !== value;
};

exports.isValidDate = (d) => {
  return d instanceof Date && !isNaN(d);
}

exports.randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
