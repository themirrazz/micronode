input.onButtonPressed(Button.A, function () {
	const lex = jsutils.jslexar(
        `
        function myFunction() {
            console.log("Hello, world!");
        }
        `
    );
    serial.writeLine(JSON.stringify(lex.tokens));
});
