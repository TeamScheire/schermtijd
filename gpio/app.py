#!/usr/bin/env python

import sched, time, datetime, requests, subprocess
from threading import Thread
import RPi.GPIO as GPIO
from Adafruit_LED_Backpack import SevenSegment
from Adafruit_LED_Backpack import Matrix8x8
import Adafruit_GPIO.SPI as SPI

from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont

displayMode = True

try:
	print('testing I2C')

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
scoreThread = False

def setup():
	global eyesThread, scoreThread, scoreStartMillis, currentHour
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
	
	resetPoints()

	print('loaded ...')

def millis():
	return int(round(time.time() * 1000))

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
				print('stopped eye animation')
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

						if (eyesSequence >= sequenceCount):
							currentLoop = currentLoop + 1
							eyesSequence = 0
							if ((eyesTemplates[stateEyes]['loop'] > 0) and (currentLoop >= eyesTemplates[stateEyes]['loop'])):
								stateEyes = eyesTemplates[stateEyes]['nextTemplate']
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
			print('writepoints display print error')

def resetPoints():
	global points
	points = 0
	writePoints()

def getScoreHour():
	global currentHour, currentScoreWeight
	now = datetime.datetime.now()
	if (currentHour != now.hour):
		url = apiurl + 'tijdslot/{}'.format(now.hour)
		print('api call: ' + url)
		try:
			response = requests.get(url)
			responsedata = response.json()
			print(responsedata['data'])
			currentHour = now.hour
			currentScoreWeight = responsedata['data']['gewicht']
		except:
			print('api not ready')
	
	return currentScoreWeight

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

	#print('current millis: ' + str(millis()))
	#print('current scoreStartMillis: ' + str(scoreStartMillis))
	#print('current score delay: ' + str(scoreDelay))

	if (lastScoreMillis + scoreDelay < millis()):
		lastScoreMillis = millis()
		points = points + len(activeButtons)
		#print(points)
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
		writePoints()

	# als van dicht naar open
	if ((statusDoosDeksel == 1) and (buttonStatus == 0)):
		print('Doos is open gegaan')
		print(activeButtons)
		statusDoosDeksel = buttonStatus
		writePoints()

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

def loop():
	while True:
		calculatePoints()
		time.sleep(.5)

def destroy():
	global stopEyes, displayMode, gsmSlots
	try:
		stopEyes = True
		for slot in gsmSlots:
			GPIO.setup(slot[1], GPIO.LOW)
		GPIO.setup(doosButton[1], GPIO.LOW)
		GPIO.setup(activiteitButton[1], GPIO.LOW)
	
		if (displayMode):
			display.clear()
			display.write_display()

		displayMode = False

		GPIO.cleanup()
	except:
		print('I2C error while stopping')

if __name__ == '__main__':
	setup()
	try:
		loop()

	except (KeyboardInterrupt):
		destroy()