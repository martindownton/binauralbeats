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
    AC: {},
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
        height: BN.int_volume_max * 0.8,
        top: BN.int_volume_max * 0.2
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
      console.log(BN.$volume);
      return BN.$volume.find('.indicator').animate({
        height: int_volume_height,
        top: int_volume_offset
      }, config.anim_time);
    },
    startstopCTL: function() {
      if (BN.startstop.$el.toggleClass('enabled').hasClass('enabled')) {
        console.log('on');
        return BN.actStartStop(true);
      } else {
        console.log('off');
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
      BN.AC.left = BN.createSound();
      BN.AC.right = BN.createSound(true);
      return BN.AC.right.source.frequency.value = 442;
    },
    actStartStop: function(bol_start) {
      if (bol_start) {
        BN.setupAudio();
        BN.AC.left.source.noteOn(0);
        return BN.AC.right.source.noteOn(0);
      } else {
        BN.AC.left.source.noteOff(0);
        BN.AC.left = null;
        BN.AC.right.source.noteOff(0);
        return BN.AC.right = null;
      }
    },
    createSound: function(bol_right) {
      var audio, pan, sin, volume;
      audio = new BN.AudioContext();
      volume = audio.createGain();
      volume.gain.value = 0.5;
      sin = BN.createWave(audio);
      audio.source = sin;
      pan = audio.createPanner();
      if (!bol_right) {
        pan.setPosition(-1, 0, 0);
      } else {
        pan.setPosition(1, 0, 0);
      }
      audio.source.connect(pan);
      pan.connect(volume);
      volume.connect(audio.destination);
      return audio;
    },
    createWave: function(audio) {
      var sin;
      sin = audio.createOscillator();
      sin.type = 0;
      sin.frequency.value = config.freq_fundamental;
      return sin;
    },
    volumeSet: function() {
      return BN.int_volume;
    }
  };

  $(function() {
    return BN.init();
  });

}).call(this);
