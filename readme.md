## Download en installeer de raspbian versie naar keuze.

Via [https://www.raspberrypi.org/downloads/raspbian/](https://www.raspberrypi.org/downloads/raspbian)

## Configureren van SD-card

Op je eigen laptop. 
De commando's zijn voor mac/linux.

Alles in de root folder van de SD-kaart

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

For Raspbian:
Enter the ssid and passphrase for the wifi

```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
network={
    ssid="xxxxxxxxxx"
    psk="xxxxxxxxxx"
    key_mgmt=WPA-PSK
}
```

## Config on raspi

Nadat je raspberry pi is opgestart, ga je ermee verbinden

```
ssh pi@raspberry.local
```

Het standaard wachtwoord is *raspberry*

### raspi-config

```
sudo raspi-config
```

Expand Filesystem
Change hostname
Set Timezone

reboot

### Update filesystem

```
sudo apt-get update && sudo apt-get -y upgrade
```

## Thermal printer

Het is deze [https://www.adafruit.com/product/2751](https://www.adafruit.com/product/2751)
Met een volledige handleiding en meer bronnen, [https://learn.adafruit.com/mini-thermal-receipt-printer](hier)

### Draadjes aansluiten

- RX van de printer naar TX van de raspi
- TX van de printer naar RX van de raspi
- GND van de printer naar GND van de raspi

De printer stroom geven (minimaal 1.5A 5v - 9v) via het ander poortje

![](connection_schematics.png)

![](raspberry_pi_gpio-diagram.png)

### activeren over TTL

Na de draadjes aangesloten te hebben, een eerste test:

```
stty -F /dev/serial0 9600
echo -e "This is a test.\\n\\n\\n" > /dev/serial0
```

Installing CUPS (for image processing)

```
sudo apt-get update && sudo apt-get -y install git cups wiringpi build-essential libcups2-dev libcupsimage2-dev
```

Installing printer drivers

```
git clone https://github.com/adafruit/zj-58
cd zj-58 && make && sudo ./install
```

Adding printer to cups

```
sudo lpadmin -p ZJ-58 -E -v serial:/dev/ttyAMA0?baud=9600 -m zjiang/ZJ-58.ppd
sudo lpoptions -d ZJ-58
```


## Referenties

- [https://learn.adafruit.com/networked-thermal-printer-using-cups-and-raspberry-pi/connect-and-configure-printer](https://learn.adafruit.com/networked-thermal-printer-using-cups-and-raspberry-pi/connect-and-configure-printer)
- [https://learn.adafruit.com/mini-thermal-receipt-printer?view=all](https://learn.adafruit.com/mini-thermal-receipt-printer?view=all)