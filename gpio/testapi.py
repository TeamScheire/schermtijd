#!/usr/bin/env python

import sched, time, datetime, requests, subprocess

statusDoosDeksel = 0 # 0 = open, 1 = gesloten
statusPrinting = 0
activeButtons = [1]
points = 0
currentHour = -1
currentScoreWeight = 0
lastScoreMillis = 0
scoreStartMillis = 0
scoreDelay = 1
stateEyes = 'sad'
stopEyes = False

apiurl = 'http://localhost:3000/api/'

def setup():
	global scoreStartMillis, currentHour
	currentHour = getScoreHour()
	scoreStartMillis = millis()
	#resetPoints()

	print('loaded ...')

def millis():
	return int(round(time.time() * 1000))

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
	if ((millis() - scoreStartMillis) < 10000):
		scoreDelay = scoreDelay / 3
	if ((millis() - scoreStartMillis) < 5000):
		scoreDelay = 1000

	print('current score delay: ' + str(scoreDelay))

	if (lastScoreMillis + scoreDelay < millis()):
		lastScoreMillis = millis()
		points = points + len(activeButtons)
		print(points)
	    #writePoints()

def loop():
	while True:
		getScoreHour()
		incrementPoints()
		time.sleep(.5)

def destroy():
    print('destroyed')

if __name__ == '__main__':
	setup()
	try:
		loop()

	except (KeyboardInterrupt):
		destroy()