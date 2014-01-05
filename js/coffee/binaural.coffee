config =
	freq_fundamental:	440
	freq_init_variance:	2

	anim_time:			400

	msg_compatible:		"Your Browser is Compatiable with the Webaudio API"
	msg_incompatible:	"Your Browser is Not Compatiable with the Webaudio API"

	str_freq_append:	"<sup>hz</sup>"

BN =
	$title:				null
	obj_audio:			null	# Dep?
	obj_message:		null
	int_volume:			null
	flt_volume_init:	0.5

	AC:					{}		# Wrapper for audio context objects
	left:				{}		# LEFT Wrapper for audio context objects
	right:				{}		# RIGHT Wrapper for audio context objects

	startstop:
		$el: null
		state: false
		state_class: 'enabled'
	preset:
		$container: null

	init: () ->
		try
			BN.AudioContext = (
				window.AudioContext ||
				window.webkitAudioContext ||
				null
			);
			
			if !BN.AudioContext
				throw new Error("AudioContext not supported!")
			else
				BN.updateCompatibilityMessage(config.msg_compatible, 'compatible', true)
				#BN.demoAudio(0, 0)
				#BN.demoAudio(220, 0.2)
				BN.initInterface()
				BN.initEvents()

		catch exc
			BN.nosupport(exc)

	nosupport: (exc) ->
		console.error('No Support: ' + exc)
		BN.updateCompatibilityMessage(config.msg_incompatible, 'incompatible')

	updateCompatibilityMessage: (str_message, str_class, bol_hide) ->
		BN.obj_message = document.getElementById('compatibility')
		BN.obj_message.innerHTML = str_message
		BN.obj_message.className = str_class
		if (bol_hide)
			$(BN.obj_message).fadeTo(1500, 0.1, () ->
				$(BN.obj_message).slideUp('liniar')
			)

	### Interface ###
	
	initInterface: () ->
		BN.$title = $('.title')
		jQuery('<a/>', {
			href: '#title',
			title: 'Hide Description',
			text: 'X'
		}).appendTo(BN.$title);

	initEvents: () ->
		#CTL Close
		BN.$title.find('a').click( (e) ->
			e.preventDefault()
			BN.$title
				.wrapInner('<span class="title--fixer" />')
			BN.$titleFixer = $('.title--fixer')
			BN.$titleFixer
				.css({
					height:	BN.$titleFixer.height()
					width:	BN.$titleFixer.width()
				})
			BN.$title
				.addClass('truncated')
				.animate(
					height: 37
					width: 249
				, config.anim_time)
		)

		#CTL Volume
		BN.$volume = $('#volume')
		BN.int_volume_max = BN.$volume.height();
		BN.$volume.find('.indicator')
		.css(
			height: 0
			top: BN.int_volume_max
		)
		.animate(
			height: BN.int_volume_max * BN.flt_volume_init
			top: BN.int_volume_max * (1 - BN.flt_volume_init)
		, config.anim_time)
		BN.$volume.click( (e) ->
			e.preventDefault()
			BN.volumeEvent($(this), e.pageY)
		)

		#CTL StartStop
		BN.startstop.$el = $('#ctl_startstop')
		BN.startstop.$el.click( (e) ->
			e.preventDefault()
			BN.startstopCTL()
		)

		#CTL Frequency
		BN.preset.$container = $('#examples')
		BN.preset.$container.find('li a').click( (e) ->
			e.preventDefault()
			BN.presetCTL(this)
		)

		#Highlight
		$('#highlight_play').hover(() ->
			$('#ctl_startstop').addClass('highlight')
		, () ->
			$('#ctl_startstop').removeClass('highlight')
		)
		.click((e) ->
			e.preventDefault()
		)

		$('#highlight_examples').hover(() ->
			$('#examples').addClass('highlight')
		, () ->
			$('#examples').removeClass('highlight')
		)
		.click((e) ->
			e.preventDefault()
		)


	volumeEvent: ($volume, int_offset_y) ->
		int_offset 				= int_offset_y - $volume.offset().top
		int_height_less_offset 	= BN.int_volume_max - int_offset
		int_volume				= parseInt(int_height_less_offset / BN.int_volume_max * 100)
		if (int_volume > 95)
			int_volume = 100
		int_volume = 5 * Math.round(int_volume / 5)
		BN.int_volume = int_volume

		int_volume_height = BN.int_volume_max * int_volume / 100
		int_volume_offset = BN.int_volume_max - int_volume_height
		BN.volumeRender(int_volume_offset, int_volume_height)
		BN.actVolumeSet()
		
	volumeRender: (int_volume_offset, int_volume_height) ->
		BN.$volume.find('.indicator').animate(
			height:	int_volume_height
			top:	int_volume_offset
		, config.anim_time)

	startstopCTL: () ->
		if (BN.startstop.$el.toggleClass('enabled').hasClass('enabled'))
			BN.actStartStop(true)
		else
			BN.actStartStop()

	presetCTL: ($freq) ->
		console.log($freq.dataset['freq'])
		BN.actFrequencySet($freq.dataset['freq'])

	### Audio Context ###

	demoAudio: (int_freq, int_delay) ->
		BN.obj_audio = new BN.AudioContext()
		BN.obj_volume = BN.obj_audio.createGain()
		BN.obj_volume.connect(BN.obj_audio.destination)

		sin = BN.obj_audio.createOscillator()
		sin.frequency.value = config.freq_fundamental + int_freq
		sin.type = 0

		sound = {}
		sound.source = sin
		sound.volume = BN.obj_audio.createGain();
		sound.source.connect(sound.volume);
		sound.volume.connect(BN.obj_volume);

		#play
		sound.source.noteOn(0 + int_delay)
		sound.source.noteOff(0.2 + int_delay)

		console.log('Demo!')

	setupAudio: () ->
		if (BN.left.AC == undefined)
			BN.left.AC = new BN.AudioContext()
			BN.right.AC = new BN.AudioContext()

		BN.createSound(BN.left)
		BN.createSound(BN.right, true)

		BN.left.volume.gain.value = BN.flt_volume_init
		BN.right.volume.gain.value = BN.flt_volume_init

		BN.left.pan.setPosition(-1, 0, 0)
		BN.right.pan.setPosition(1, 0, 0)

		BN.right.AC.source.frequency.value = 442

	createSound: (audio, bol_right) ->
		audio.volume = audio.AC.createGain()

		sin = BN.createWave(audio.AC)
		audio.AC.source = sin

		audio.pan = audio.AC.createPanner()

		audio.pan.connect(audio.volume)
		audio.AC.source.connect(audio.pan)
		audio.volume.connect(audio.AC.destination)

	createWave: (audio) ->
		sin = audio.createOscillator()
		sin.type = 0
		sin.frequency.value = config.freq_fundamental

		return sin

	### Actions ###

	actStartStop: (bol_start) ->
		if (bol_start)
			BN.setupAudio()
			BN.left.AC.source.noteOn(0)
			BN.right.AC.source.noteOn(0)
		else
			BN.left.AC.source.noteOff(0)
			BN.left.AC.source.disconnect()

			BN.right.AC.source.noteOff(0)
			BN.right.AC.source.disconnect()

	actVolumeSet: () ->
		BN.left.volume.gain.value = BN.int_volume / 100
		BN.right.volume.gain.value = BN.int_volume / 100

	actFrequencySet: (int_frequency) ->
		BN.right.AC.source.frequency.value = int_frequency
		$('#freq_right').html(int_frequency + config.str_freq_append)

$ () ->
	BN.init()