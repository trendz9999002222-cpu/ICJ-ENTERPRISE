const { validatePhoneNumberLength } = require('libphonenumber-js/max');

console.log(validatePhoneNumberLength('7023716864', 'IN'));
console.log(validatePhoneNumberLength('70237168645', 'IN'));
console.log(validatePhoneNumberLength('1234567890', 'IN'));
