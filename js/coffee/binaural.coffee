config =
	freq_fundamental:	440
	freq_init_variance:	2

	anim_time:			400

	msg_compatible:		"Your Browser is Compatiable with the Webaudio API"
	msg_incompatible:	"Your Browser is Not Compatiable with the Webaudio API"

BN =
	$title:			null
	obj_audio:		null	# Dep?
	obj_message:	null
	int_volume:		null

	AC:				{}		# Wrapper for audio context objects

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
				BN.setupAudio()

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
			###
				.animate(
					paddingRight: 0
				, config.anim_time)
			###
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
			height: BN.int_volume_max * 0.8
			top: BN.int_volume_max * 0.2
		, config.anim_time)
		BN.$volume.click( (e) ->
			BN.volumeEvent($(this), e.pageY)
		)

		#CTL StartStop
		BN.startstop.$el = $('#ctl_startstop')
		BN.startstop.$el.click( (e) ->
			BN.startstopCTL()
		)

		#CTL Frequency
		BN.preset.$container = $('#examples')
		BN.preset.$container.find('li a').click( (e) ->
			BN.presetCTL()
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
			BN.volumeSet()
		
	volumeRender: (int_volume_offset, int_volume_height) ->
		console.log(BN.$volume)
		BN.$volume.find('.indicator').animate(
			height:	int_volume_height
			top:	int_volume_offset
		, config.anim_time)

	startstopCTL: () ->
		if (BN.startstop.$el.toggleClass('enabled').hasClass('enabled'))
			console.log('on')
		else
			console.log('off')

	presetCTL: () ->
		console.log('presetClick')

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
		BN.AC.left = BN.createSound()
		BN.AC.right = BN.createSound(true)

		#BN.AC.left.volume.gain.value = 0.1
		BN.AC.left.source.noteOn(0)
		BN.AC.left.source.noteOff(5)

		#BN.AC.right.volume.gain.value = 0.1
		BN.AC.right.source.frequency.value = 442
		BN.AC.right.source.noteOn(0)
		BN.AC.right.source.noteOff(5)

	createSound: (bol_right) ->
		audio = new BN.AudioContext()
		
		volume = audio.createGain()
		volume.gain.value = 0.5

		sin = BN.createWave(audio)
		audio.source = sin

		pan = audio.createPanner()
		if (!bol_right)
			pan.setPosition(-1, 0, 0)
		else
			pan.setPosition(1, 0, 0)

		audio.source.connect(pan)
		pan.connect(volume)
		volume.connect(audio.destination)

		return audio

	createWave: (audio) ->
		sin = audio.createOscillator()
		sin.type = 0
		sin.frequency.value = config.freq_fundamental

		return sin

	volumeSet: () ->
		BN.int_volume # Set the BN.AC volume to this value

$ () ->
	BN.init()