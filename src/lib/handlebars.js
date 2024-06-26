const handlebars = require('handlebars');
const moment = require('moment');

handlebars.registerHelper('moment', function (date, format) {
    return moment(date).format(format);
});


handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {
    switch (operator) {
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        // Aquí puedes agregar más operadores si los necesitas
        default:
            return options.inverse(this);
    }
});