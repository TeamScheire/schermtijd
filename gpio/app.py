#!/usr/bin/env python

import sched, time, datetime, requests, subprocess
from threading import Thread
import RPi.GPIO as GPIO
from Adafruit_LED_Backpack import SevenSegment
from Adafruit_LED_Backpack import Matrix8x8
import Adafruit_GPIO.SPI as SPI
import Adafruit_SSD1306

from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont

displayMode = True # debugmode for no displays
oledMode = False # enable/disable the oled screen

# Raspberry Pi pin configuration:
RST = None     # on the PiOLED this pin isnt used
# Note the following are only used with SPI:
DC = 23
SPI_PORT = 0
SPI_DEVICE = 0

try:
	print('testing I2C')

	if (oledMode):
		# 128x32 display with hardware I2C:
		disp = Adafruit_SSD1306.SSD1306_128_32(rst=RST)
		disp.begin()
		disp.clear()
		disp.display()
		# Create blank image for drawing.
		# Make sure to create image with mode '1' for 1-bit color.
		width = disp.width
		height = disp.height
		image = Image.new('1', (width, height))

		# Get drawing object to draw on image.
		draw = ImageDraw.Draw(image)

		# Draw a black filled box to clear the image.
		draw.rectangle((0,0,width,height), outline=0, fill=0)

		# Draw some shapes.
		# First define some constants to allow easy resizing of shapes.
		padding = -2
		top = padding
		bottom = height-padding
		# Move left to right keeping track of the current x position for drawing shapes.
		x = 0

		font = ImageFont.truetype('./Retron2000.ttf', 12)
		fontDebug = ImageFont.load_default()
		print('Adafruit_SSD1306 display loaded')

	# 8X8 led matrix
	matrixRight = Matrix8x8.Matrix8x8()
	matrixRight.begin()
	print('matrixRight loaded')
	matrixLeft = Matrix8x8.Matrix8x8(address=0x72)
	matrixLeft.begin()
	print('matrixLeft loaded')
	# 7-segment display
	display = SevenSegment.SevenSegment(address=0x71, busnum=1)
	display.begin()
	print('SevenSegment loaded')

except Exception as e:
	print('error loading I2C')
	print(e)
	displayMode = False

gsmSlots = [
	# buttonpin, ledpin, toestelnumber
	[4, 18, 1],
	[17, 23, 2],
	[27, 24, 3],
	[22, 25, 4],
	[6, 12, 5],
	[13, 16, 6]
]

doosButton = [19, 20] # gpio poort waarop de knop van het deksel van de doos aangesloten is, status led
activiteitButton = [26, 21] # gpio poort waarop de knop om een activiteit af te drukken op aangesloten is, status led

statusDoosDeksel = 0 # 0 = open, 1 = gesloten
statusPrinting = 0
activeButtons = []
points = 0
currentHour = -1
currentScoreWeight = 0
lastScoreMillis = 0
scoreStartMillis = 0
scoreDelay = 1
stateEyes = 'sad'
stopEyes = False

apiurl = 'http://localhost:3000/api/'
debugMode = 0
eyesThread = False

def setup():
	global eyesThread, scoreStartMillis, currentHour
	GPIO.setmode(GPIO.BCM)

	for slot in gsmSlots:
		GPIO.setup(slot[0], GPIO.IN)
		GPIO.setup(slot[1], GPIO.OUT)

	GPIO.add_event_detect(gsmSlots[0][0], GPIO.BOTH, callback = lambda x: handleButton(gsmSlots[0][0], gsmSlots[0][1], gsmSlots[0][2]))
	GPIO.add_event_detect(gsmSlots[1][0], GPIO.BOTH, callback = lambda x: handleButton(gsmSlots[1][0], gsmSlots[1][1], gsmSlots[1][2]))
	GPIO.add_event_detect(gsmSlots[2][0], GPIO.BOTH, callback = lambda x: handleButton(gsmSlots[2][0], gsmSlots[2][1], gsmSlots[2][2]))
	GPIO.add_event_detect(gsmSlots[3][0], GPIO.BOTH, callback = lambda x: handleButton(gsmSlots[3][0], gsmSlots[3][1], gsmSlots[3][2]))
	GPIO.add_event_detect(gsmSlots[4][0], GPIO.BOTH, callback = lambda x: handleButton(gsmSlots[4][0], gsmSlots[4][1], gsmSlots[4][2]))
	GPIO.add_event_detect(gsmSlots[5][0], GPIO.BOTH, callback = lambda x: handleButton(gsmSlots[5][0], gsmSlots[5][1], gsmSlots[5][2]))

	GPIO.setup(doosButton[0], GPIO.IN)
	GPIO.setup(doosButton[1], GPIO.OUT)
	GPIO.add_event_detect(doosButton[0], GPIO.BOTH, callback = lambda x: handledoosButton(doosButton[0], doosButton[1]))

	GPIO.setup(activiteitButton[0], GPIO.IN)
	GPIO.setup(activiteitButton[1], GPIO.OUT)
	GPIO.add_event_detect(activiteitButton[0], GPIO.BOTH, callback = lambda x: handleActiviteitButton(activiteitButton[0], activiteitButton[1]))
	
	eyesThread = Thread(target=animateEyes, args=(stateEyes,))
	eyesThread.start()

	time.sleep(2) # give de api some time to boot
	currentHour = getScoreHour()
	resetPoints()

	print('loaded ...')

def millis():
	return int(round(time.time() * 1000))

def getScoreHour():
	global currentHour, currentScoreWeight
	now = datetime.datetime.now()
	if (currentHour != now.hour):
		url = apiurl + 'tijdslot/{}'.format(now.hour)
		print('api call: ' + url)
		try:
			response = requests.get(url)
			currentHour = now.hour
		except:
			print('api not ready')

		print(response)
		print(response.data.gewicht)
	return currentHour

def animateEyes(dummyvar):
	global stateEyes, stopEyes
	if (displayMode):
		eyesTemplates = {
			'heart': {
				'delay': 250,
				'loop': 2,
				'nextTemplate': 'beatingHeart',
				'stopPrevious': True,
				'sequences': [
					[
						['00000000', '00000000', '00000000', '00011000', '00011000', '00000000', '00000000', '00000000'],
						['00000000', '00000000', '00000000', '00011000', '00011000', '00000000', '00000000', '00000000']
					],
					[
						['00000000', '00000000', '00011000', '00111100', '00111100', '00011000', '00000000', '00000000'],
						['00000000', '00000000', '00011000', '00111100', '00111100', '00011000', '00000000', '00000000']						
					],
					[
						['00000000', '01100110', '11111111', '11111111', '01111110', '00111100', '00011000', '00000000'],
						['00000000', '01100110', '11111111', '11111111', '01111110', '00111100', '00011000', '00000000']
					]
				]
			},
 			'beatingHeart': {
				'delay': 300,
				'loop': 2,
                'nextTemplate': 'happy',
				'stopPrevious': False,
				'sequences': [
					[
						['00000000', '00000000', '00011000', '00111100', '00111100', '00011000', '00000000', '00000000'],
						['00000000', '00000000', '00011000', '00111100', '00111100', '00011000', '00000000', '00000000']						
					],
					[
						['00000000', '01100110', '11111111', '11111111', '01111110', '00111100', '00011000', '00000000'],
						['00000000', '01100110', '11111111', '11111111', '01111110', '00111100', '00011000', '00000000']
					]
				]
			},
 			'happy': {
				'delay': 1500,
				'loop': 0,
                'nextTemplate': 'happy',
				'stopPrevious': False,
				'sequences': [
					[
						['00111000', '01111100', '11111110', '11000110', '11000110', '11111110', '01111100', '00000000'],
						['00011100', '00111110', '01111111', '01100011', '01100011', '01111111', '00111110', '00000000']
					],
					[
						['00000000', '00111000', '01111100', '11111110', '11000110', '11000110', '11111110', '01111100'],
						['00000000', '00011100', '00111110', '01111111', '01100011', '01100011', '01111111', '00111110']
					]
				]
			},     
 			'sad': {
				'delay': 6000,
				'loop': 0,
                'nextTemplate': 'sad',
				'stopPrevious': True,
				'sequences': [
					[
						['00000000', '00000000', '11111110', '11111110', '11000110', '01111100', '00000000', '00000000'],
						['00000000', '00000000', '01111111', '01111111', '01100011', '00111110', '00000000', '00000000']
					],
						[
						['00000000', '00000000', '00000000', '11111110', '11111110', '11000110', '01111100', '00000000'],
						['00000000', '00000000', '00000000', '01111111', '01111111', '01100011', '00111110', '00000000']
					]
				]
			},     
		}

		currentStateEyes = ''
        eyesSequence = 0
        lastMillis = 0
        delay = 0
        currentLoop = 0

        while True:
			if stopEyes:
				print('stopped')
				matrixLeft.clear()
				matrixLeft.write_display()
				matrixRight.clear()
				matrixRight.write_display()
				break

			if (currentStateEyes):
				try:
					if ((lastMillis + delay) < millis()):
						lastMillis = millis()
						eyes = eyesTemplates[currentStateEyes]['sequences'][eyesSequence]

						matrixLeft.clear()
						matrixRight.clear()
						for x in range(8):
							for y in range(8):
								matrixLeft.set_pixel(x, y, int(eyes[0][x][y]))
								matrixRight.set_pixel(x, y, int(eyes[1][x][y]))
						matrixLeft.write_display()
						matrixRight.write_display()

						sequenceCount = len(eyesTemplates[stateEyes]['sequences'])
						eyesSequence = eyesSequence + 1
						#print('sequencecount: ' + str(sequenceCount))
						#print('next sequence: ' + str(eyesSequence))
						#print('current loop: ' + str(currentLoop))
						#print('# loops: ' + str(eyesTemplates[stateEyes]['loop']))
						if (eyesSequence >= sequenceCount):
							currentLoop = currentLoop + 1
							eyesSequence = 0
							if ((eyesTemplates[stateEyes]['loop'] > 0) and (currentLoop >= eyesTemplates[stateEyes]['loop'])):
								#print('next template')
								stateEyes = eyesTemplates[stateEyes]['nextTemplate']
							#else:
								#print('next loop')
				except:
					print('ledmatrix print error')

			if (stateEyes != currentStateEyes):
				print('new state: ' + stateEyes)
				delay = eyesTemplates[stateEyes]['delay']
				currentStateEyes = stateEyes
				eyesSequence = 0
				currentLoop = 0
				if (eyesTemplates[stateEyes]['stopPrevious']):
					lastMillis = 0


def writeEyes():
	global stateEyes
	if (len(activeButtons) > 0):
		stateEyes = 'heart'
	else:
		stateEyes = 'sad'

def writePoints():
	global points, statusDoosDeksel

	if (displayMode):
		try:
			display.clear()
			if (statusDoosDeksel != 1):
				display.print_number_str('----')
			else:
				display.print_float(points, decimal_digits = 0)
			display.set_colon(False)
			display.write_display()
		except:
			print('display print error')

def resetPoints():
	global points
	points = 0
	writePoints()

def getScoreHour():
	global currentHour, currentScoreWeight
	now = datetime.datetime.now()
	if (currentHour != now.hour):
		currentHour = now.hour
		url = apiurl + 'tijdslot/{}'.format(currentHour)
		print('api call: ' + url)
		response = requests.get(url)
		responsedata = response.json()
		currentScoreWeight = responsedata['data']['gewicht']
	return currentHour

def incrementPoints():
	global points, activeButtons, currentScoreWeight, lastScoreMillis, scoreStartMillis

	scoreDelay = (20 - (2 * currentScoreWeight)) * 1000

	if ((millis() - scoreStartMillis) < 30000):
		scoreDelay = scoreDelay / 2
	if ((millis() - scoreStartMillis) < 20000):
		scoreDelay = scoreDelay / 3
	if ((millis() - scoreStartMillis) < 10000):
		if ((scoreDelay / 4) > 1000):
			scoreDelay = (scoreDelay / 4)
		else:
			scoreDelay = 1000
	if ((millis() - scoreStartMillis) < 5000):
		scoreDelay = 1000

	print('current millis: ' + str(millis()))
	print('current scoreStartMillis: ' + str(scoreStartMillis))
	print('current score delay: ' + str(scoreDelay))

	if (lastScoreMillis + scoreDelay < millis()):
		lastScoreMillis = millis()
		points = points + len(activeButtons)
		print(points)
		writePoints()

def calculatePoints():
	global activeButtons, statusDoosDeksel
	if ((statusDoosDeksel == 1) and (len(activeButtons) > 0)):
		getScoreHour()
		incrementPoints()
	else:
		resetPoints()

def handleButton(buttonPin, ledPin, toestelNumber):
	global activeButtons, debugMode
	time.sleep(.1)
	buttonStatus = GPIO.input(buttonPin)
	print('gedrukt op pin: ' + str(buttonPin) + ' - status: ' + str(buttonStatus))
	GPIO.output(ledPin, buttonStatus)
	if (statusDoosDeksel == 1):
		#debugmode toggle: als er een knop van de gsms wijzigt als de doos dicht is.
		debugMode = 1 - debugMode

	if (buttonStatus):
		if toestelNumber not in activeButtons:
			activeButtons.append(toestelNumber)
	else:
		if toestelNumber in activeButtons:
			activeButtons.remove(toestelNumber)
	writeEyes()

def writeScore(slotNumber):
	global points
	data = {
		'score': points,
		'bericht': 'punten verdiend via de doos!'
	}
	url = apiurl + 'toestel/{}/score'.format(slotNumber)
	print('api call: ' + url)
	response = requests.post(url, data=data)
	print(response.json())

def handledoosButton(buttonPin, ledPin):
	global statusDoosDeksel, points, scoreStartMillis
	time.sleep(.1)
	buttonStatus = GPIO.input(buttonPin)
	GPIO.output(ledPin, buttonStatus)
	print('deksel van de doos is veranderd: ' + str(buttonPin) + ' - status: ' + str(buttonStatus))

	# als van open naar dicht
	if ((statusDoosDeksel == 0) and (buttonStatus == 1)):
		print('Doos is toe gegaan')
		print(activeButtons)
		scoreStartMillis = millis()

	# als van dicht naar open
	if ((statusDoosDeksel == 1) and (buttonStatus == 0)):
		print('Doos is open gegaan')
		print(activeButtons)
		statusDoosDeksel = buttonStatus

		if (points > 0):
			data = {
				'score': points,
				'bericht': 'punten verdiend via de doos!'
			}

			for slotNumber in activeButtons:
				print(slotNumber)
				writeScore(slotNumber)

	statusDoosDeksel = buttonStatus

def printActiviteit(activeButtons, ledPin):
	global statusPrinting
	print('printing ...')
	cmd = "/usr/bin/nodejs /home/pi/src/print.js {}".format(len(activeButtons))
	result = subprocess.check_output(cmd, shell = True )
	print('done printing')
	statusPrinting = 0
	GPIO.output(ledPin, statusPrinting)

def handleActiviteitButton(buttonPin, ledPin):
	global statusPrinting, activeButtons, statusDoosDeksel
	time.sleep(.1)
	buttonStatus = GPIO.input(buttonPin)
	print('Activiteitknop is ingedrukt: ' + str(buttonPin) + ' - status: ' + str(buttonStatus))
	if ((statusPrinting == 0) and (buttonStatus == 1) and (len(activeButtons) >= 1) and (statusDoosDeksel == 1)):
		print('action to print')
		statusPrinting = 1
		GPIO.output(ledPin, statusPrinting)
		printThread = Thread(target=printActiviteit, args=(activeButtons, ledPin,))
		printThread.start()

def drawOled():
	if (displayMode):
		global draw, disp, width, height, top, bottom, debugMode
		# Draw a black filled box to clear the image.
		draw.rectangle((0,0,width,height), outline=0, fill=0)

		if (debugMode == 1):
			# Shell scripts for system monitoring source: https://unix.stackexchange.com/questions/119126/command-to-display-memory-usage-disk-usage-and-cpu-load
			cmd = "hostname -I | cut -d\' \' -f1"
			IP = subprocess.check_output(cmd, shell = True )
			cmd = "top -bn1 | grep load | awk '{printf \"CPU Load: %.2f\", $(NF-2)}'"
			CPU = subprocess.check_output(cmd, shell = True )
			cmd = "free -m | awk 'NR==2{printf \"Mem: %s/%sMB %.2f%%\", $3,$2,$3*100/$2 }'"
			MemUsage = subprocess.check_output(cmd, shell = True )
			cmd = "df -h | awk '$NF==\"/\"{printf \"Disk: %d/%dGB %s\", $3,$2,$5}'"
			Disk = subprocess.check_output(cmd, shell = True )

			# Write four lines of text.
			draw.text((x, top),       "IP: " + str(IP),  font=fontDebug, fill=255)
			draw.text((x, top+8),     str(CPU), font=fontDebug, fill=255)
			draw.text((x, top+16),    str(MemUsage),  font=fontDebug, fill=255)
			draw.text((x, top+25),    str(Disk),  font=fontDebug, fill=255)

		else:
			presentLine = '  '
			for slot in gsmSlots:
				if slot[2] in activeButtons:
					presentLine += ' x |'
				else:
					presentLine += ' o |'
			presentLine = presentLine[:-1]
			draw.text((x, top), "   1 | 2 | 3 | 4 | 5 | 6",  font=font, fill=255)
			draw.text((x, top+17), presentLine,  font=font, fill=255)

		# Display image.
		disp.image(image)
		disp.display()

def loop():
	while True:
		calculatePoints()
		if (oledMode):
			drawOled()
		time.sleep(.5)

def destroy():
	global stopEyes
	try:
		stopEyes = True
		for slot in gsmSlots:
			GPIO.setup(slot[1], GPIO.LOW)
		GPIO.setup(doosButton[1], GPIO.LOW)
		GPIO.setup(activiteitButton[1], GPIO.LOW)
	
		if (displayMode):
			display.clear()
			display.write_display()
		if (oledMode):
			draw.rectangle((0,0,width,height), outline=0, fill=0)
			disp.image(image)
			disp.display()
		GPIO.cleanup()
	except:
		print('I2C error')

if __name__ == '__main__':
	setup()
	try:
		loop()

	except (KeyboardInterrupt):
		destroy()