config =
	freq_fundamental:	440
	msg_compatible:		"Your Browser is Compatiable with the Webaudio API"
	msg_incompatible:	"Your Browser is Not Compatiable with the Webaudio API"

BN =
	obj_audio:		null
	obj_message:	null
	int_volume:		null

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
				BN.updateCompatibilityMessage(config.msg_compatible, 'compatible')
				BN.initEvents()
				BN.setupAudio()

		catch exc
			BN.nosupport(exc)

	initEvents: () ->
		BN.$volume = $('#volume')
		BN.int_volume_max = BN.$volume.height();
		BN.$volume.find('.indicator')
		.css(
			height: 0
			top: BN.int_volume_max
		)
		.animate(
			height: BN.int_volume_max
			top: 0
		, 400)
		BN.$volume.click( (e) ->
			BN.volumeSet($(this), e.pageY)
		)

	volumeSet: ($volume, int_offset_y) ->
			int_offset 				= int_offset_y - $volume.offset().top
			int_height_less_offset 	= BN.int_volume_max - int_offset
			int_volume				= parseInt(int_height_less_offset / BN.int_volume_max * 100)
			if (int_volume > 95)
				int_volume = 100
			int_volume = int_volume - (int_volume % 5)
			BN.int_volume = int_volume

			int_volume_height = BN.int_volume_max * int_volume / 100
			int_volume_offset = BN.int_volume_max - int_volume_height
			BN.volumeRender(int_volume_offset, int_volume_height)
		
	volumeRender: (int_volume_offset, int_volume_height) ->
		console.log(BN.$volume)
		BN.$volume.find('.indicator').animate(
			height:	int_volume_height
			top:	int_volume_offset
		, 200)

	nosupport: (exc) ->
		console.error('No Support: ' + exc)
		BN.updateCompatibilityMessage(config.msg_incompatible, 'incompatible')

	updateCompatibilityMessage: (str_message, str_class) ->
		BN.obj_message = document.getElementById('compatibility')
		BN.obj_message.innerHTML = str_message
		BN.obj_message.className = str_class
		$(BN.obj_message).fadeTo(1500, 0.1, () ->
			$(BN.obj_message).slideUp('liniar')
		)

	setupAudio: () ->
		BN.obj_audio = new BN.AudioContext()
		BN.obj_volume = BN.obj_audio.createGain()
		BN.obj_volume.connect(BN.obj_audio.destination)

		sin = BN.obj_audio.createOscillator()
		sin.type = 0

		sound = {}
		sound.source = sin
		sound.volume = BN.obj_audio.createGain();
		sound.source.connect(sound.volume);
		sound.volume.connect(BN.obj_volume);

		sound.source.noteOn(0)
		sound.source.noteOff(1)

		###
		sound.source.loop = true
		###
		console.log('reached!')



$ () ->
	BN.init()