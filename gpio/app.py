#!/usr/bin/env python

import RPi.GPIO as GPIO
import sched, time
from Adafruit_LED_Backpack import SevenSegment
from Adafruit_LED_Backpack import Matrix8x8

matrix = Matrix8x8.Matrix8x8()
matrix.begin()
display = SevenSegment.SevenSegment(address=0x71, busnum=1)
display.begin()

ledPin = 18    # pin11 --- led
buttonPin = 4    # pin12 --- button

buttonStatus = 0
points = 0

def setup():
	GPIO.setmode(GPIO.BCM)
	GPIO.setup(ledPin, GPIO.OUT)
	GPIO.setup(buttonPin, GPIO.IN)
	writeSmiley()
	resetPoints()
	print 'loaded'

def writeSmiley():
	# happy face
	hf = ['00111100', '01000010', '10100101' ,'10000001', '10100101', '10011001', '01000010', '00111100']
	# sad face
	sf = ['00111100', '01000010', '10100101', '10000001', '10011001', '10100101', '01000010', '00111100']
	global buttonStatus
	if (buttonStatus == 1):
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
	points = points + 1
	writePoints()

def check():
	global buttonStatus
	if (buttonStatus):
		incrementPoints()
	else:
		resetPoints()

def swLed(pin):
	global buttonStatus
	buttonStatus = GPIO.input(buttonPin)
	#print 'gedrukt op pin: ', pin, ' - status: ', buttonStatus
	GPIO.output(ledPin, buttonStatus)
	writeSmiley()

def loop():
	GPIO.add_event_detect(buttonPin, GPIO.BOTH, callback = swLed)
	while True:
		check()
		time.sleep(1)

def destroy():
	GPIO.output(ledPin, GPIO.LOW)
	display.clear()
	display.write_display()
	matrix.clear()
	matrix.write_display()
	GPIO.cleanup()

if __name__ == '__main__':
	setup()
	try:
		loop()
	except KeyboardInterrupt:  # When 'Ctrl+C' is pressed, the child program destroy() will be  executed.
		destroy()
