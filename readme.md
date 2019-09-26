Bekijk het lijstje van alle materiaal: [bill of materials](docs/bill-of-materials.csv)


## Download en installeer raspbian

Via [https://www.raspberrypi.org/downloads/raspbian/](https://www.raspberrypi.org/downloads/raspbian)

De lite versie is voldoende.

Instructies om raspbian op een sd-kaart te zetten staan ook op die pagina.

## Configureren van de sd-kaart

Nadat je raspbian op een SD-kaart hebt, moet je deze nog configureren zodat je via ssh over de wifi aan de raspberry pi kan.

Deze stappen voer je dus uit op je eigen computer, met de sd-kaart ingestoken. 

De commando's zijn voor terminal op mac/linux.


### navigaar naar de folder van de SD-kaart

```
cd /Volumes/boot
```

### SSH aanzetten

In de rootpartitie van de sd-card:

```
touch ssh
```

### Wifi instellen

```
vim wpa_supplicant.conf
```

Vul volgende gegevens in (vervang de xxxx'n door je eigen SSID en wachtwoord) en sla op

```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
network={
    ssid="xxxxx"
    psk="xxxxx"
    key_mgmt=WPA-PSK
}
```

## Configuratie op de raspberry pi


Nadat je raspberry pi is opgestart, ga je ermee verbinden

```
ssh pi@raspberrypi.local
```

Het standaard wachtwoord is *raspberry*

### Update van het systeem

```
sudo apt-get update && sudo apt-get -y upgrade
```

### Raspi-config

```
sudo raspi-config
```

Kies: 

- Expand Filesystem
- Change hostname: fastfriendsbox
- Set Timezone

reboot

## nodejs + SQLite

Het scorebord en de activiteiten zitten in een SQLite database met een api errond, geschreven in node.js

```
sudo -s
curl -sL https://deb.nodesource.com/setup_11.x | bash -
exit
sudo apt-get install -y nodejs sqlite3
```

meer info op [https://dev.to/bogdaaamn/run-your-nodejs-application-on-a-headless-raspberry-pi-4jnn](https://dev.to/bogdaaamn/run-your-nodejs-application-on-a-headless-raspberry-pi-4jnn)

### ImageMagic voor de verwerking van de avatars

```
sudo apt-get install imagemagick
```

## Activeren/installeren van de api en frontend

In de folder van de nodejs server alle requirements installeren:

```
cd src
npm install
```

De api starten

```
nodejs server.js
```

## automatisch starten en uitvoeren in de achtergrond van de server

```
cd /lib/systemd/system/
sudo nano doosserver.service
```

Vul deze gegevens in:

```
[Unit]
Description=Doos gpio
After=multi-user.target
 
[Service]
Type=simple
ExecStart=/usr/bin/nodejs /home/pi/src/server.js
Restart=on-abort
 
[Install]
WantedBy=multi-user.target
```

En dan dit uitvoeren:

```
sudo chmod 644 /lib/systemd/system/doosserver.service
chmod +x /home/pi/src/server.js
sudo systemctl daemon-reload
sudo systemctl enable doosserver.service
sudo systemctl start doosserver.service
```

De nodejs server draait nu als een service.


## nginx

Het scorebord draait op een webserver op je raspberry pi, hiervoor moet nginx draaien zodat je het vlot via eender welke browser kan bekijken (zolang die op hetzelfde wifi netwerk verbonden is als je raspberry pi).

```
sudo apt-get install -y nginx
```

configureren van je site:

```
sudo rm /etc/nginx/sites-available/default
sudo nano /etc/nginx/sites-available/default

server {
        listen 80;
        listen [::]:80;

        server_name fastfriendsbox.local;

        root /var/www/;
        index index.html;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
}
```

(Her)start de webservice hierna:

```
sudo systemctl restart nginx

```

Nu kan je van eender welk toestel dat op hetzelfde netwerk zit als je raspberry pi surfen naar  [http://fastfriendsbox.local](http://fastfriendsbox.local) om het scorebord te zien.


## Thermal printer

Het is deze [https://www.adafruit.com/product/2751](https://www.adafruit.com/product/2751)

Een volledige handleiding en meer bronnen, [https://learn.adafruit.com/mini-thermal-receipt-printer](hier)

### Draadjes aansluiten

- RX van de printer naar TX van de raspi
- TX van de printer naar RX van de raspi
- GND van de printer naar GND van de raspi

De printer stroom geven (minimaal 1.5A 5v - 9v) via het andere adaptor. De printer trekt veel ampère en dit delen met de raspberry pi is geen goed plan ...

![](docs/connection_schematics.png)

![](docs/raspberry_pi_gpio-diagram.png)

### activeren over TTL

Eerst configureren zodat we de seriale bus kunnen gebruiken

```
sudo raspi-config
```

Interfacing options > disable the serial console > enable the serial port hardware.

Na reboot, een eerste test:

```
stty -F /dev/ttyS0 9600
echo -e "\\n\\nHallo printertje.\\n\\n\\n" > /dev/ttyS0
```

### repo voor node.js

Om de printer te gebruiken in Node.js, wordt deze library gebruikt: [https://github.com/xseignard/thermalPrinter](https://github.com/xseignard/thermalPrinter).

Via `npm install` heb je deze requirement normaal gezien al geïnstalleerd.


## LED displays

I2C is een protocol waarbij je tot 8 elementen in een bus kan koppelen aan één seriele bus.
Je moet dit protocol eerst activeren op de raspberry pi via raspi-config:

```
sudo raspi-config
```

Daar kies je Interfacing options > I2C > enable (yes)

Voor Python moeten wat paketten/drivers geïnstalleerd worden:

```
sudo apt-get install -y python-smbus i2c-tools build-essential python-dev git python-pil python-pip
git clone https://github.com/adafruit/Adafruit_Python_LED_Backpack.git # voor de 7-segment en de 8x8 matrix
cd Adafruit_Python_LED_Backpack
sudo python setup.py install
cd ..
```

Optioneel (in de uiteindelijke doos zit deze er niet meer in)

```
git clone https://github.com/adafruit/Adafruit_Python_SSD1306.git # voor de oled
cd Adafruit_Python_SSD1306/
sudo python setup.py install

```

Hierna kan je de displays aansluiten en via het volgende commando de adressen checken:

```
sudo i2cdetect -y 1
```

Je krijgt iets in deze aard:

```
pi@schermtijd01:~ $ i2cdetect -y 1
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:          -- -- -- -- -- -- -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
40: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: 70 71 72 -- -- -- -- --
```

Adres 70, 71 en 72 zijn ingebruik

Nog python packet requests installeren om api calls te kunnen doen:

```
pip install requests
```

Starten van python app:

```
python gpio/app.py
```

Stappen staan hier:
[https://learn.adafruit.com/adafruits-raspberry-pi-lesson-4-gpio-setup/configuring-i2c](https://learn.adafruit.com/adafruits-raspberry-pi-lesson-4-gpio-setup/configuring-i2c)

Aansluitingen:
[https://learn.adafruit.com/led-backpack-displays-on-raspberry-pi-and-beaglebone-black/wiring](https://learn.adafruit.com/led-backpack-displays-on-raspberry-pi-and-beaglebone-black/wiring)

python library:
[https://github.com/adafruit/Adafruit_Python_LED_Backpack](https://github.com/adafruit/Adafruit_Python_LED_Backpack)

### Python script as service

```
cd /lib/systemd/system/
sudo nano doos.service
```

Vul deze gegevens in:

```
[Unit]
Description=Doos gpio
After=multi-user.target
 
[Service]
Type=simple
ExecStart=/usr/bin/python /home/pi/gpio/app.py
Restart=on-abort
 
[Install]
WantedBy=multi-user.target
```

En dan dit uitvoeren:

```
sudo chmod 644 /lib/systemd/system/doos.service
chmod +x /home/pi/gpio/app.py
sudo systemctl daemon-reload
sudo systemctl enable doos.service
sudo systemctl start doos.service
```

## PCB voor de doos

![schema](pcb/gpiobord-schema.png)
![pcb](pcb/gpiobord-pcb.png)

## Extra: raspi als hotspot als geen wifi gevonden wordt
Bron [http://www.raspberryconnect.com/projects/65-raspberrypi-hotspot-accesspoints/158-raspberry-pi-auto-wifi-hotspot-switch-direct-connection](http://www.raspberryconnect.com/projects/65-raspberrypi-hotspot-accesspoints/158-raspberry-pi-auto-wifi-hotspot-switch-direct-connection)


### Installeer de paketten:

```
sudo apt-get install -y hostapd dnsmasq
```

Disable de services bij default:

```
sudo systemctl unmask hostapd
sudo systemctl disable hostapd
sudo systemctl disable dnsmasq
```

### Maak de config file aan:

```
sudo nano /etc/hostapd/hostapd.conf
```

Voeg volgende info in:

```
#2.4GHz setup wifi 80211 b,g,n
interface=wlan0
driver=nl80211
ssid=fastfriendsbox
hw_mode=g
channel=8
wmm_enabled=0
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_passphrase=teamscheire
wpa_key_mgmt=WPA-PSK
wpa_pairwise=CCMP TKIP
rsn_pairwise=CCMP
country_code=BE
ieee80211n=1
ieee80211d=1
```

Daarna

```
sudo nano /etc/default/hostapd
```

Verander ```#DAEMON_CONF=""``` in ```DAEMON_CONF="/etc/hostapd/hostapd.conf"```


### Configureer de dns server op de raspberry pi:

```
sudo nano /etc/dnsmasq.conf
```

Vul volgende gegevens in:

```
#AutoHotspot Config
#stop DNSmasq from using resolv.conf
no-resolv
#Interface to use
interface=wlan0
bind-interfaces
dhcp-range=10.0.0.50,10.0.0.150,12h
```
### Configureer de DHCP

```
sudo nano /etc/dhcpcd.conf
```

Voeg onderaan volgende lijn toe:

```
nohook wpa_supplicant
```

### Creëer het hotspot script

```
sudo nano /usr/bin/autohotspot
```

Vul volgende code in:

```
#!/bin/bash
#version 0.95-4-N/HS

#You may share this script on the condition a reference to RaspberryConnect.com 
#must be included in copies or derivatives of this script. 

#A script to switch between a wifi network and a non internet routed Hotspot
#Works at startup or with a seperate timer or manually without a reboot
#Other setup required find out more at
#http://www.raspberryconnect.com

wifidev="wlan0" #device name to use. Default is wlan0.
#use the command: iw dev ,to see wifi interface name 

IFSdef=$IFS
cnt=0
#These four lines capture the wifi networks the RPi is setup to use
wpassid=$(awk '/ssid="/{ print $0 }' /etc/wpa_supplicant/wpa_supplicant.conf | awk -F'ssid=' '{ print $2 }' ORS=',' | sed 's/\"/''/g' | sed 's/,$//')
IFS=","
ssids=($wpassid)
IFS=$IFSdef #reset back to defaults


#Note:If you only want to check for certain SSIDs
#Remove the # in in front of ssids=('mySSID1'.... below and put a # infront of all four lines above
# separated by a space, eg ('mySSID1' 'mySSID2')
#ssids=('mySSID1' 'mySSID2' 'mySSID3')

#Enter the Routers Mac Addresses for hidden SSIDs, seperated by spaces ie 
#( '11:22:33:44:55:66' 'aa:bb:cc:dd:ee:ff' ) 
mac=()

ssidsmac=("${ssids[@]}" "${mac[@]}") #combines ssid and MAC for checking

createAdHocNetwork()
{
    echo "Creating Hotspot"
    ip link set dev "$wifidev" down
    ip a add 10.0.0.5/24 brd + dev "$wifidev"
    ip link set dev "$wifidev" up
    dhcpcd -k "$wifidev" >/dev/null 2>&1
    systemctl start dnsmasq
    systemctl start hostapd
}

KillHotspot()
{
    echo "Shutting Down Hotspot"
    ip link set dev "$wifidev" down
    systemctl stop hostapd
    systemctl stop dnsmasq
    ip addr flush dev "$wifidev"
    ip link set dev "$wifidev" up
    dhcpcd  -n "$wifidev" >/dev/null 2>&1
}

ChkWifiUp()
{
	echo "Checking WiFi connection ok"
        sleep 20 #give time for connection to be completed to router
	if ! wpa_cli -i "$wifidev" status | grep 'ip_address' >/dev/null 2>&1
        then #Failed to connect to wifi (check your wifi settings, password etc)
	       echo 'Wifi failed to connect, falling back to Hotspot.'
               wpa_cli terminate "$wifidev" >/dev/null 2>&1
	       createAdHocNetwork
	fi
}


FindSSID()
{
#Check to see what SSID's and MAC addresses are in range
ssidChk=('NoSSid')
i=0; j=0
until [ $i -eq 1 ] #wait for wifi if busy, usb wifi is slower.
do
        ssidreply=$((iw dev "$wifidev" scan ap-force | egrep "^BSS|SSID:") 2>&1) >/dev/null 2>&1 
        echo "SSid's in range: " $ssidreply
        echo "Device Available Check try " $j
        if (($j >= 10)); then #if busy 10 times goto hotspot
                 echo "Device busy or unavailable 10 times, going to Hotspot"
                 ssidreply=""
                 i=1
	elif echo "$ssidreply" | grep "No such device (-19)" >/dev/null 2>&1; then
                echo "No Device Reported, try " $j
		NoDevice
        elif echo "$ssidreply" | grep "Network is down (-100)" >/dev/null 2>&1 ; then
                echo "Network Not available, trying again" $j
                j=$((j + 1))
                sleep 2
	elif echo "$ssidreplay" | grep "Read-only file system (-30)" >/dev/null 2>&1 ; then
		echo "Temporary Read only file system, trying again"
		j=$((j + 1))
		sleep 2
	elif ! echo "$ssidreply" | grep "resource busy (-16)"  >/dev/null 2>&1 ; then
               echo "Device Available, checking SSid Results"
		i=1
	else #see if device not busy in 2 seconds
                echo "Device unavailable checking again, try " $j
		j=$((j + 1))
		sleep 2
	fi
done

for ssid in "${ssidsmac[@]}"
do
     if (echo "$ssidreply" | grep "$ssid") >/dev/null 2>&1
     then
	      #Valid SSid found, passing to script
              echo "Valid SSID Detected, assesing Wifi status"
              ssidChk=$ssid
              return 0
      else
	      #No Network found, NoSSid issued"
              echo "No SSid found, assessing WiFi status"
              ssidChk='NoSSid'
     fi
done
}

NoDevice()
{
	#if no wifi device,ie usb wifi removed, activate wifi so when it is
	#reconnected wifi to a router will be available
	echo "No wifi device connected"
	wpa_supplicant -B -i "$wifidev" -c /etc/wpa_supplicant/wpa_supplicant.conf >/dev/null 2>&1
	exit 1
}

FindSSID

#Create Hotspot or connect to valid wifi networks
if [ "$ssidChk" != "NoSSid" ] 
then
       if systemctl status hostapd | grep "(running)" >/dev/null 2>&1
       then #hotspot running and ssid in range
              KillHotspot
              echo "Hotspot Deactivated, Bringing Wifi Up"
              wpa_supplicant -B -i "$wifidev" -c /etc/wpa_supplicant/wpa_supplicant.conf >/dev/null 2>&1
              ChkWifiUp
       elif { wpa_cli -i "$wifidev" status | grep 'ip_address'; } >/dev/null 2>&1
       then #Already connected
              echo "Wifi already connected to a network"
       else #ssid exists and no hotspot running connect to wifi network
              echo "Connecting to the WiFi Network"
              wpa_supplicant -B -i "$wifidev" -c /etc/wpa_supplicant/wpa_supplicant.conf >/dev/null 2>&1
              ChkWifiUp
       fi
else #ssid or MAC address not in range
       if systemctl status hostapd | grep "(running)" >/dev/null 2>&1
       then
              echo "Hostspot already active"
       elif { wpa_cli status | grep "$wifidev"; } >/dev/null 2>&1
       then
              echo "Cleaning wifi files and Activating Hotspot"
              wpa_cli terminate >/dev/null 2>&1
              ip addr flush "$wifidev"
              ip link set dev "$wifidev" down
              rm -r /var/run/wpa_supplicant >/dev/null 2>&1
              createAdHocNetwork
       else #"No SSID, activating Hotspot"
              createAdHocNetwork
       fi
fi
```

Maak het script uitvoerbaar:

```
sudo chmod +x /usr/bin/autohotspot
``


### Creëer een service file voor het hotspot script

```
sudo nano /etc/systemd/system/autohotspot.service
```

Vul volgende code in:

```
[Unit]
Description=Automatically generates an internet Hotspot when a valid ssid is not in range
After=multi-user.target
[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/bin/autohotspot
[Install]
WantedBy=multi-user.target
```

En activeer de service:

```
sudo systemctl enable autohotspot.service
```


## Meerdere Wifi netwerken instellen

Bewerk deze config file:

```
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf 
```

Vul aan met de SSID en wachtwoorden

```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
    ssid="thuis"
    psk="thuiswachtwoord"
    key_mgmt=WPA-PSK
    id_str="schuis"
}

network={
    ssid="school"
    psk="school-wachtwoord"
    key_mgmt=WPA-PSK
    id_str="school"
}
```