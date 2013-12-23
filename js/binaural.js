(function() {
  var binaural;

  binaural = {
    fundamental: 440,
    obj_audio: null,
    init: function() {
      var exc;
      try {
        binaural.AudioContext = window.AudioContext || window.webkitAudioContext || null;
        if (!binaural.AudioContext) {
          throw new Error("AudioContext not supported!");
        } else {
          return binaural.create();
        }
      } catch (_error) {
        exc = _error;
        return binaural.nosupport(exc);
      }
    },
    nosupport: function(exc) {
      return alert('No Support: ' + exc);
    },
    create: function() {
      return binaural.obj_audio = new binaural.AudioContext();
    }
  };

  $(function() {
    return binaural.init();
  });

}).call(this);
