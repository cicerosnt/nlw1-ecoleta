import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';

const app = express();

//Rora: endereço acesso por cmpleto em uma requisição
//Recurso: Entidade que estamoa acessando pelo rota
//GET: Busca uma ou amais informação do back-end
//POST: cria uma nova infrmação no back-end
//PUT: Atualizar uma informaçao existente no back-end
//DELETE: remove uma informação no back-end

//Request Params: parametros que vem na rota indentifica um recurso
//Query Params: parametros vai na rota, mas que são opsonais, filtro 
//Request Body: Parametros para criação/atualização de informação
//knex('users').where('name', 'cabra').select('*')

app.use(cors());
// app.use(cors({
//   origin: 'www.http://localhost:3333'
// }));

app.use(express.json());
app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..','uploads')));

app.listen(3333);