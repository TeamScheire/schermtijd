var SerialPort = require('serialport'),
    serialPort = new SerialPort('/dev/ttyS0', {
        baudRate: 9600
    }),
    Printer = require('thermalprinter');

var path = __dirname + '/teamscheire.png';

serialPort.on('open', function () {
    var printer = new Printer(serialPort);
    printer.on('ready', function () {
        printer
            .printImage(path)
            .printLine('De printer werkt!')
            .horizontalLine(16)
            .printLine(':)')
            .printLine(' ')
            .printLine(' ')
            .printLine(' ')
            .printLine(' ')
            .print(function () {
                console.log('done');
                process.exit();
            });
    });
});