#!/usr/bin/env python

import sched, time, requests
import RPi.GPIO as GPIO
from Adafruit_LED_Backpack import SevenSegment
from Adafruit_LED_Backpack import Matrix8x8

matrixLeft = Matrix8x8.Matrix8x8()
matrixLeft.begin()
matrixRight = Matrix8x8.Matrix8x8(address=0x72)
matrixRight.begin()
display = SevenSegment.SevenSegment(address=0x71, busnum=1)
display.begin()

gsmSlots = [
	# buttonpin, ledpin, toestelnumber
	[4, 18, 1],
	[17, 23, 2],
	#[27, 24, 3],
	#[22, 15, 4],
	#[6, 12, 5],
	#[13, 16, 6]
]

doosButton = [19, 20] # gpio poort waarop de knop van het deksel van de doos aangesloten is, status led
activiteitButton = [26, 21] # gpio poort waarop de knop om een activiteit af te drukken op aangesloten is, status led

statusDoosDeksel = 0 # 0 = open, 1 = gesloten
statusPrinting = 0
activeButtons = []
points = 0

apiurl = 'http://localhost:3000/api/'

def setup():
	GPIO.setmode(GPIO.BCM)

	for slot in gsmSlots:
		GPIO.setup(slot[0], GPIO.IN)
		GPIO.setup(slot[1], GPIO.OUT)

	GPIO.add_event_detect(gsmSlots[0][0], GPIO.BOTH, callback = lambda x: handleButton(gsmSlots[0][0], gsmSlots[0][1], gsmSlots[0][2]))
	GPIO.add_event_detect(gsmSlots[1][0], GPIO.BOTH, callback = lambda x: handleButton(gsmSlots[1][0], gsmSlots[1][1], gsmSlots[1][2]))
	#GPIO.add_event_detect(gsmSlots[2][0], GPIO.BOTH, callback = lambda x: handleButton(gsmSlots[2][0], gsmSlots[2][1], gsmSlots[2][2]))
	#GPIO.add_event_detect(gsmSlots[3][0], GPIO.BOTH, callback = lambda x: handleButton(gsmSlots[3][0], gsmSlots[3][1], gsmSlots[3][2]))
	#GPIO.add_event_detect(gsmSlots[4][0], GPIO.BOTH, callback = lambda x: handleButton(gsmSlots[4][0], gsmSlots[4][1], gsmSlots[4][2]))
	#GPIO.add_event_detect(gsmSlots[5][0], GPIO.BOTH, callback = lambda x: handleButton(gsmSlots[5][0], gsmSlots[5][1], gsmSlots[5][2]))

	GPIO.setup(doosButton[0], GPIO.IN)
	GPIO.setup(doosButton[1], GPIO.OUT)
	GPIO.add_event_detect(doosButton[0], GPIO.BOTH, callback = lambda x: handledoosButton(doosButton[0], doosButton[1]))

	GPIO.setup(activiteitButton[0], GPIO.IN)
	GPIO.setup(activiteitButton[1], GPIO.OUT)
	GPIO.add_event_detect(activiteitButton[0], GPIO.BOTH, callback = lambda x: handleActicviteitButton(activiteitButton[0], activiteitButton[1]))
	
	writeEyes()
	resetPoints()
	print 'loaded ...'

def writeEyes():
	# TODO animate eyes
	# Source: https://www.robotshop.com/community/forum/t/robot-facial-expressions-with-led-matrix/13470
	# happy face
	hf = [
		['00111000', '01111100', '11111110' ,'110001100', '110001100', '11111110', '01111100', '00000000'],
		['00011100', '00111110', '01111111' ,'011000110', '011000110', '01111111', '00111110', '00000000']
	]
	# sad face
	sf = [
		['00000000', '00000000', '11111110', '11111110', '11000110', '01111100', '00000000', '00000000'],
		['00000000', '00000000', '01111111', '01111111', '01100011', '00111110', '00000000', '00000000']
	]
	global activeButtons
	if (len(activeButtons) > 0):
		eyes = hf
	else:
		eyes = sf

	try:
		matrixLeft.clear()
		matrixRight.clear()
		for x in range(8):
			for y in range(8):
				matrixLeft.set_pixel(x, y, int(eyes[0][x][y]))
				matrixRight.set_pixel(x, y, int(eyes[1][x][y]))
		matrixLeft.write_display()
		matrixRight.write_display()
	except:
		print('ledmatrix print error')

def writePoints():
	global points, statusDoosDeksel

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

def incrementPoints():
	global points, activeButtons
	# TODO algoritme voor punten finetunen
	points = points + len(activeButtons)
	writePoints()

def calculatePoints():
	global activeButtons, statusDoosDeksel
	if ((statusDoosDeksel == 1) and (len(activeButtons) > 0)):
		incrementPoints()
	else:
		resetPoints()

def handleButton(buttonPin, ledPin, toestelNumber):
	global activeButtons
	buttonStatus = GPIO.input(buttonPin)
	print 'gedrukt op pin: ', buttonPin, ' - status: ', buttonStatus
	GPIO.output(ledPin, buttonStatus)
	if (buttonStatus):
		if toestelNumber not in activeButtons:
			activeButtons.append(toestelNumber)
	else:
		if toestelNumber in activeButtons:
			activeButtons.remove(toestelNumber)
	writeEyes()

def handledoosButton(buttonPin, ledPin):
	global statusDoosDeksel, points
	time.sleep(.1)
	buttonStatus = GPIO.input(buttonPin)
	GPIO.output(ledPin, buttonStatus)
	print 'deksel van de doos is veranderd: ', buttonPin, ' - status: ', buttonStatus
	# als van dicht naar open
	if ((statusDoosDeksel == 1) and (buttonStatus == 0)):
		print('Doos is open gegaan')
		print(activeButtons)

		if (points > 0):
			data = {
				'score': points,
				'bericht': 'punten verdiend via de doos!'
			}

			for number in activeButtons:
				url = apiurl + 'toestel/{}/score'.format(number)
				response = requests.post(url, data=data)
				print response.json()
	
 	statusDoosDeksel = buttonStatus

def handleActicviteitButton(buttonPin, ledPin):
	global statusPrinting, activeButtons, statusDoosDeksel
	time.sleep(.1)
	buttonStatus = GPIO.input(buttonPin)
	print 'Activiteitknop is ingedrukt: ', buttonPin, ' - status: ', buttonStatus
	if ((statusPrinting == 0) and (buttonStatus == 1) and (len(activeButtons) >= 1) and (statusDoosDeksel == 1)):
		statusPrinting = 1
		GPIO.output(ledPin, statusPrinting)
		print 'Ik print een activteit'
		url = apiurl + 'activiteit/random/{}'.format(activeButtons)
		# TODO printen in async, met op het einde statusPrinting = 0 en led terug uit

def loop():
	while True:
		calculatePoints()
		time.sleep(1)

def destroy():
	try:
		for slot in gsmSlots:
			GPIO.setup(slot[1], GPIO.LOW)
		GPIO.setup(doosButton[1], GPIO.LOW)
		GPIO.setup(activiteitButton[1], GPIO.LOW)
	
		display.clear()
		display.write_display()
		matrixLeft.clear()
		matrixLeft.write_display()
		matrixRight.clear()
		matrixRight.write_display()
		GPIO.cleanup()
	except:
		print 'I2C error'

if __name__ == '__main__':
	setup()
	try:
		loop()
	except KeyboardInterrupt:
		destroy()
