(function() {
  var BN, config;

  config = {
    freq_fundamental: 440,
    freq_init_variance: 2,
    anim_time: 400,
    msg_compatible: "Your Browser is Compatiable with the Webaudio API",
    msg_incompatible: "Your Browser is Not Compatiable with the Webaudio API"
  };

  BN = {
    $title: null,
    obj_audio: null,
    obj_message: null,
    int_volume: null,
    flt_volume_init: 0.5,
    AC: {},
    left: {},
    right: {},
    startstop: {
      $el: null,
      state: false,
      state_class: 'enabled'
    },
    preset: {
      $container: null
    },
    init: function() {
      var exc;
      try {
        BN.AudioContext = window.AudioContext || window.webkitAudioContext || null;
        if (!BN.AudioContext) {
          throw new Error("AudioContext not supported!");
        } else {
          BN.updateCompatibilityMessage(config.msg_compatible, 'compatible', true);
          BN.initInterface();
          return BN.initEvents();
        }
      } catch (_error) {
        exc = _error;
        return BN.nosupport(exc);
      }
    },
    nosupport: function(exc) {
      console.error('No Support: ' + exc);
      return BN.updateCompatibilityMessage(config.msg_incompatible, 'incompatible');
    },
    updateCompatibilityMessage: function(str_message, str_class, bol_hide) {
      BN.obj_message = document.getElementById('compatibility');
      BN.obj_message.innerHTML = str_message;
      BN.obj_message.className = str_class;
      if (bol_hide) {
        return $(BN.obj_message).fadeTo(1500, 0.1, function() {
          return $(BN.obj_message).slideUp('liniar');
        });
      }
    },
    /* Interface*/

    initInterface: function() {
      BN.$title = $('.title');
      return jQuery('<a/>', {
        href: '#title',
        title: 'Hide Description',
        text: 'X'
      }).appendTo(BN.$title);
    },
    initEvents: function() {
      BN.$title.find('a').click(function(e) {
        e.preventDefault();
        BN.$title.wrapInner('<span class="title--fixer" />');
        BN.$titleFixer = $('.title--fixer');
        BN.$titleFixer.css({
          height: BN.$titleFixer.height(),
          width: BN.$titleFixer.width()
        });
        return BN.$title.addClass('truncated').animate({
          height: 37,
          width: 249
        }, config.anim_time);
      });
      BN.$volume = $('#volume');
      BN.int_volume_max = BN.$volume.height();
      BN.$volume.find('.indicator').css({
        height: 0,
        top: BN.int_volume_max
      }).animate({
        height: BN.int_volume_max * BN.flt_volume_init,
        top: BN.int_volume_max * (1 - BN.flt_volume_init)
      }, config.anim_time);
      BN.$volume.click(function(e) {
        return BN.volumeEvent($(this), e.pageY);
      });
      BN.startstop.$el = $('#ctl_startstop');
      BN.startstop.$el.click(function(e) {
        e.preventDefault();
        return BN.startstopCTL();
      });
      BN.preset.$container = $('#examples');
      return BN.preset.$container.find('li a').click(function(e) {
        return BN.presetCTL();
      });
    },
    volumeEvent: function($volume, int_offset_y) {
      var int_height_less_offset, int_offset, int_volume, int_volume_height, int_volume_offset;
      int_offset = int_offset_y - $volume.offset().top;
      int_height_less_offset = BN.int_volume_max - int_offset;
      int_volume = parseInt(int_height_less_offset / BN.int_volume_max * 100);
      if (int_volume > 95) {
        int_volume = 100;
      }
      int_volume = 5 * Math.round(int_volume / 5);
      BN.int_volume = int_volume;
      int_volume_height = BN.int_volume_max * int_volume / 100;
      int_volume_offset = BN.int_volume_max - int_volume_height;
      BN.volumeRender(int_volume_offset, int_volume_height);
      return BN.volumeSet();
    },
    volumeRender: function(int_volume_offset, int_volume_height) {
      return BN.$volume.find('.indicator').animate({
        height: int_volume_height,
        top: int_volume_offset
      }, config.anim_time);
    },
    startstopCTL: function() {
      if (BN.startstop.$el.toggleClass('enabled').hasClass('enabled')) {
        return BN.actStartStop(true);
      } else {
        return BN.actStartStop();
      }
    },
    presetCTL: function() {
      return console.log('presetClick');
    },
    /* Audio Context*/

    demoAudio: function(int_freq, int_delay) {
      var sin, sound;
      BN.obj_audio = new BN.AudioContext();
      BN.obj_volume = BN.obj_audio.createGain();
      BN.obj_volume.connect(BN.obj_audio.destination);
      sin = BN.obj_audio.createOscillator();
      sin.frequency.value = config.freq_fundamental + int_freq;
      sin.type = 0;
      sound = {};
      sound.source = sin;
      sound.volume = BN.obj_audio.createGain();
      sound.source.connect(sound.volume);
      sound.volume.connect(BN.obj_volume);
      sound.source.noteOn(0 + int_delay);
      sound.source.noteOff(0.2 + int_delay);
      return console.log('Demo!');
    },
    setupAudio: function() {
      if (BN.left.AC === void 0) {
        BN.left.AC = new BN.AudioContext();
        BN.right.AC = new BN.AudioContext();
      }
      BN.createSound(BN.left);
      BN.createSound(BN.right, true);
      return BN.right.AC.source.frequency.value = 442;
    },
    actStartStop: function(bol_start) {
      if (bol_start) {
        BN.setupAudio();
        BN.left.AC.source.noteOn(0);
        return BN.right.AC.source.noteOn(0);
      } else {
        BN.left.AC.source.noteOff(0);
        BN.left.AC.source.disconnect();
        BN.right.AC.source.noteOff(0);
        return BN.right.AC.source.disconnect();
      }
    },
    createSound: function(audio, bol_right) {
      var pan, sin;
      audio.volume = audio.AC.createGain();
      audio.volume.gain.value = BN.flt_volume_init;
      sin = BN.createWave(audio.AC);
      audio.AC.source = sin;
      pan = audio.AC.createPanner();
      if (!bol_right) {
        pan.setPosition(-1, 0, 0);
      } else {
        pan.setPosition(-1, 0, 0);
      }
      audio.AC.source.connect(pan);
      pan.connect(audio.volume);
      return audio.volume.connect(audio.AC.destination);
    },
    createWave: function(audio) {
      var sin;
      sin = audio.createOscillator();
      sin.type = 0;
      sin.frequency.value = config.freq_fundamental;
      return sin;
    },
    volumeSet: function() {
      BN.left.volume.gain.value = BN.int_volume / 100;
      return BN.right.volume.gain.value = BN.int_volume / 100;
    }
  };

  $(function() {
    return BN.init();
  });

}).call(this);
