// https://github.com/xseignard/thermalPrinter

var SerialPort = require('serialport'),
    serialPort = new SerialPort('/dev/ttyS0', {
        baudRate: 9600
    }),
    Printer = require('thermalprinter');

serialPort.on('open', function () {
    var printer = new Printer(serialPort);
    printer.on('ready', function () {
        printer
            .horizontalLine(16)
            .printLine('Hier een activiteit van de doos:')
            .horizontalLine(16)
            .printLine('VERSTOPPERTJE')
            .printLine('Binnen of buiten te spelen')
            .horizontalLine(16)
            .printLine("Iemand is de zoeker, die telt af tot 20.\nOndertussen krijgt de rest de tijd om zich te verstoppen.\nDaarna gaat de zoeker iedereen proberen te zoeken en tikt die op de centrale bedot af.")
            .printLine('')
            .printLine('')
            .print(function () {
                console.log('done');
                process.exit();
            });
    });
});