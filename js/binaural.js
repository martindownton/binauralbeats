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
    int_volume: null,
    init: function() {
      var exc;
      try {
        binaural.AudioContext = window.AudioContext || window.webkitAudioContext || null;
        if (!binaural.AudioContext) {
          throw new Error("AudioContext not supported!");
        } else {
          binaural.updateCompatibilityMessage(config.msg_compatible, 'compatible');
          binaural.initEvents();
          return binaural.setupAudio();
        }
      } catch (_error) {
        exc = _error;
        return binaural.nosupport(exc);
      }
    },
    initEvents: function() {
      binaural.obj_volume = $('#volume');
      binaural.int_volume_max = binaural.obj_volume.height();
      binaural.obj_volume.find('.indicator').css({
        height: 0,
        top: binaural.int_volume_max
      }).animate({
        height: binaural.int_volume_max,
        top: 0
      }, 400);
      return binaural.obj_volume.click(function(e) {
        var int_height_less_offset, int_offset;
        int_offset = e.pageY - $(this).offset().top;
        int_height_less_offset = binaural.int_volume_max - int_offset;
        binaural.int_volume = parseInt(int_height_less_offset / binaural.int_volume_max * 100);
        return binaural.obj_volume.find('.indicator').css({
          height: int_height_less_offset,
          top: int_offset
        });
      });
    },
    nosupport: function(exc) {
      console.error('No Support: ' + exc);
      return binaural.updateCompatibilityMessage(config.msg_incompatible, 'incompatible');
    },
    updateCompatibilityMessage: function(str_message, str_class) {
      binaural.obj_message = document.getElementById('compatibility');
      console.log(binaural.obj_message);
      binaural.obj_message.innerHTML = str_message;
      binaural.obj_message.className = str_class;
      return $(binaural.obj_message).fadeTo(1500, 0.1, function() {
        return $(binaural.obj_message).slideUp('liniar');
      });
    },
    setupAudio: function() {
      return binaural.obj_audio = new binaural.AudioContext();
    }
  };

  $(function() {
    return binaural.init();
  });

}).call(this);
