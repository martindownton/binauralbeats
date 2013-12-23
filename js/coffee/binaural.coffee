binaural =
	fundamental:	440
	obj_audio:	null

	init: () ->
		try
			binaural.AudioContext = (
				window.AudioContext ||
				window.webkitAudioContext ||
				null
			);
			
			if !binaural.AudioContext
				throw new Error("AudioContext not supported!")
			else
				binaural.create()

		catch exc
			binaural.nosupport(exc)
	
	nosupport: (exc) ->
		alert('No Support: ' + exc)

	create: () ->
		binaural.obj_audio = new binaural.AudioContext()

$ () ->
	binaural.init()
	alert('supported')