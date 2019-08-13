#!/usr/bin/env python

import RPi.GPIO as GPIO
import sched, time
from Adafruit_LED_Backpack import SevenSegment
from Adafruit_LED_Backpack import Matrix8x8

matrix = Matrix8x8.Matrix8x8()
matrix.begin()
display = SevenSegment.SevenSegment(address=0x71, busnum=1)
display.begin()

gsmSlots = [
	[4, 18] # buttonpin, ledpin
	# TODO meerdere gsmslots aansluiten en testen
]

activeButtons = []
points = 0

def setup():
	GPIO.setmode(GPIO.BCM)
	for slot in gsmSlots:
		GPIO.setup(slot[0], GPIO.IN)
		GPIO.setup(slot[1], GPIO.OUT)
		GPIO.add_event_detect(slot[0], GPIO.BOTH, callback = lambda x: handleButton(slot[0], slot[1]))

	# TODO gote knop voor printen van activiteit
 
	writeSmiley()
	resetPoints()
	print 'loaded'

def writeSmiley():
	# happy face
	hf = ['00111100', '01000010', '10100101' ,'10000001', '10100101', '10011001', '01000010', '00111100']
	# sad face
	sf = ['00111100', '01000010', '10100101', '10000001', '10011001', '10100101', '01000010', '00111100']
	global activeButtons
	if (len(activeButtons) > 0):
		smiley = hf
	else:
		smiley = sf

	matrix.clear()
	for x in range(8):
		for y in range(8):
			matrix.set_pixel(x, y, int(smiley[x][y]))
	matrix.write_display()

def writePoints():
	global points
	display.clear()
	display.print_float(points, decimal_digits = 0, justify_right = True)
	display.set_colon(False)
	display.write_display()

def resetPoints():
	global points
	points = 0
	writePoints()

def incrementPoints():
	global points
	# TODO algoritme voor punten finetunen
	points = points + len(activeButtons)
	writePoints()

def calculatePoints():
	global activeButtons
	if (len(activeButtons) > 0):
		incrementPoints()
	else:
		resetPoints()

def handleButton(buttonPin, ledPin):
	global activeButtons
	buttonStatus = GPIO.input(buttonPin)
	print 'gedrukt op pin: ', buttonPin, ' - status: ', buttonStatus
	GPIO.output(ledPin, buttonStatus)
	if (buttonStatus):
		if buttonPin not in activeButtons:
			activeButtons.append(buttonPin)
	else:
		if buttonPin in activeButtons:
			activeButtons.remove(buttonPin)
	writeSmiley()

def loop():
	while True:
		# TODO knop toevoegen voor het deksel en pas punten tellen als dit toe is
		# TODO Als deksel open gaat: verdiende punten wegschrijven naar api voor de gsmslots die bezet zijn
		calculatePoints()
		time.sleep(1)

def destroy():
	for slot in gsmSlots:
		GPIO.setup(slot[1], GPIO.LOW)
	display.clear()
	display.write_display()
	matrix.clear()
	matrix.write_display()
	GPIO.cleanup()

if __name__ == '__main__':
	setup()
	try:
		loop()
	except KeyboardInterrupt:  # When 'Ctrl+C' is pressed, destroy() will be executed.
		destroy()
