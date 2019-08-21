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
			.printLine('De printer werkt!')
			.horizontalLine(16)
			.printLine(':)')
			.printLine('')
			.printLine('')
			.print(function () {
				console.log('done');
				process.exit();
			});
	});
});