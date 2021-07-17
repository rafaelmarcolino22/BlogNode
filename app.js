const express = require("express");
const app = express();
const handlebars  = require('express-handlebars');
const bodyParser = require('body-parser')
const admin = require("./routers/admin");
const path = require("path");
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const { get } = require("./routers/admin");
require("./models/Postagem")
const Postagem = mongoose.model('postagem')
require("./models/Categorias")
const Categorias = mongoose.model('categorias')


app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
 
mongoose.connect('mongodb://localhost:27017/blogt', {useNewUrlParser: true}).then(() => {
    console.log("conecctado db")
}).catch((err) => {
    console.log("erro" + err)
}) 

app.use(flash());

app.use(session({
  secret: 'blog',
  resave: true,
  saveUninitialized: true,
}))

app.use((req, res, next) => {
  res.locals.erro_msg = req.flash("erro_msg")
  res.locals.success_msg = req.flash("success_msg")
  next()

})

app.use(express.static(path.join(__dirname, 'public')));


app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use("/admin", admin)

app.get("/", (req, res) => {
  Postagem.find().populate("categorias").sort({data: 'desc'}).lean().then((postagems) => {
    res.render('inicio.handlebars', {postagems: postagems})

  }).catch((err) => {
    console.log('erro ao carregar ', err)
    res.redirect('/404')
  })
})

app.get('/404', (req, res) => {
  res.send('Erro na pagina')
})

app.listen(8081, () => {
    console.log("Conectado com sucesso ");
});

app.get('/postagens/:slug', (req, res) => {
  Postagem.findOne({slug: req.params.slug}).lean().then((postagems) => {
    if(postagems){

      res.render('postagens/index', {postagems: postagems})
    }else{
      req.flash('erro_msg', "erro ao cadastrar o slug")
      res.redirect("/")
    }

  }).catch((err)=>{
    req.flash('erro_msg', "erro ao cadastrar o slug")
    res.redirect("/")
  })
})


app.get('/categoria', (req, res) => {
  Categorias.find().lean().then((categorias) => {

    res.render('categorias/index', {categorias: categorias})

  })
})


app.get("/categorias/:slug", (req, res) => {

  Categorias.findOne({slug: req.params.slug}).lean().then((categorias) => {
    if(categorias){
      Postagem.find({categorias: categorias._id}).lean().then((postagems) => {
        res.render("categorias/postagens", {postagems: postagems})
      }).catch((err) => {
        console.log("erro_msg", "erro ao cadastrar")
        res.redirect("/")
      })
    }else{
      req.flash("erro_msg", "erro ao carregar")
      res.redirect("/")
    }
  }).catch((err) => {
    req.flash("erro_msg", "erro ao carregar")
    res.redirect("/")
  })

})

