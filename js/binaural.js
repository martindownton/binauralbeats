(function() {
  var binaural, config;

  config = {
    freq_fundamental: 440,
    msg_compatible: "Your Browser is Compatiable with the Webaudio API",
    msg_incompatible: "Your Browser is Not Compatiable with the Webaudio API"
  };

  binaural = {
    obj_audio: null,
    obj_message: null,
    init: function() {
      var exc;
      try {
        binaural.AudioContext = window.AudioContext || window.webkitAudioContext || null;
        if (!binaural.AudioContext) {
          throw new Error("AudioContext not supported!");
        } else {
          binaural.update_compatibility_message(config.msg_compatible, 'compatible');
          return binaural.swtup_audio();
        }
      } catch (_error) {
        exc = _error;
        return binaural.nosupport(exc);
      }
    },
    nosupport: function(exc) {
      console.error('No Support: ' + exc);
      return binaural.update_compatibility_message(config.msg_incompatible, 'incompatible');
    },
    update_compatibility_message: function(str_message, str_class) {
      binaural.obj_message = document.getElementById('compatibility');
      console.log(binaural.obj_message);
      binaural.obj_message.innerHTML = str_message;
      binaural.obj_message.className = str_class;
      return $(binaural.obj_message).fadeTo(1500, 0.1, function() {
        return $(binaural.obj_message).slideUp('liniar');
      });
    },
    swtup_audio: function() {
      return binaural.obj_audio = new binaural.AudioContext();
    }
  };

  $(function() {
    return binaural.init();
  });

}).call(this);
