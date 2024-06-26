const express = require('express');
const morgan = require('morgan')
const exphbs = require('express-handlebars');
const path = require('path');







const app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layoutes'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));//configuracion de las carpetas o vistas
app.set('view engine', '.hbs');




app.set('port', process.env.PORT || 7000);

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(require('./routes/index'));

app.use((req, res, next) => {
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(app.get('port'), () => {
    console.log('server on port', app.get('port'));
});
