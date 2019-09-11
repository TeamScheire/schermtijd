#!/usr/bin/env python

import sched, time, requests, subprocess
from threading import Thread
import RPi.GPIO as GPIO
from Adafruit_LED_Backpack import SevenSegment
from Adafruit_LED_Backpack import Matrix8x8
import Adafruit_GPIO.SPI as SPI

stopEyes = False
stateEyes = 'heart'
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

except Exception as e:
	print('error loading I2C')
	print(e)
	displayMode = False


def animateEyes(dummyvar):
	global stateEyes, stopEyes
	if (displayMode):
		eyesTemplates = {
			'heart': {
				'delay': .3,
				'loop': 2,
				'nextTemplate': 'beatingHeart',
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
				'delay': .3,
				'loop': 3,
                'nextTemplate': 'beatingHeart',
				'sequences': [
					[
						['00000000', '00000000', '00011000', '00111100', '00111100', '00011000', '00000000', '00000000'],
						['00000000', '00000000', '00011000', '00111100', '00111100', '00011000', '00000000', '00000000']						
					],
					[
						['00000000', '01100110', '11111111', '11111111', '01111110', '00111100', '00011000', '00000000'],
						['00000000', '01100110', '11111111', '11111111', '01111110', '00111100', '00011000', '00000000']
					],
					[
						['00000000', '01100110', '11111111', '11111111', '01111110', '00111100', '00011000', '00000000'],
						['00000000', '01100110', '11111111', '11111111', '01111110', '00111100', '00011000', '00000000']
					]
				]
			},           
		}

		currentStateEyes = ''
        eyesSequence = 0
        
        while True:
			if (stateEyes != currentStateEyes):
				print('new state' + stateEyes)
				delay = eyesTemplates[stateEyes]['delay']
				currentStateEyes = stateEyes
				currentLoop = 0

			try:
				currentLoop = currentLoop + 1
				eyes = eyesTemplates[currentStateEyes]['sequences'][eyesSequence]
				#print(eyes)
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

			if stopEyes:
				print('stopped')
				matrixLeft.clear()
				matrixLeft.write_display()
				matrixRight.clear()
				matrixRight.write_display()
				break

			# next sequence
			sequenceCount = len(eyesTemplates[stateEyes]['sequences'])
			eyesSequence = eyesSequence + 1
			if (eyesSequence >= sequenceCount):
			    if ((currentLoop < eyesTemplates[stateEyes]['loop']) or (eyesTemplates[stateEyes]['loop'] == False)):
			        eyesSequence = 0
			    else:
			        stateEyes = eyesTemplates[stateEyes]['nextTemplate']

			time.sleep(delay)

def loop():
	while True:
		animateEyes(1)

def destroy():
	global stopEyes
	try:
		stopEyes = True
	except:
		print('I2C error')

if __name__ == '__main__':
	try:
		loop()

	except (KeyboardInterrupt):
		destroy()