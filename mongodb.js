require('dotenv').config()

const faker = require('faker-br');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const url = `mongodb://${process.env.DATABASE_MONGODB_USER}:${process.env.DATABASE_MONGODB_PASS}@${process.env.DATABASE_MONGODB_HOST}:${process.env.DATABASE_MONGODB_PORT}/${process.env.DATABASE_MONGODB_NAME}?authSource=admin`;

const Usuario = mongoose.model('Usuario', new Schema({
    nome: {type: String, required: true},
    email: {type: String, required: true, max: 255},
}));

const Documento = mongoose.model('Documento', new Schema({
    usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true},
    cpf: {type: String, required: true, max: 255},
}));



const popularBanco = async (quantidadeRegistros, novosUsuarios) => {
    console.time('## Registros populados no MongoDB ##');

    try {
        await mongoose.connect(url);

        let usuarios;
        let documentos = [];
        const tamanhoBloco = 1000;

        if (novosUsuarios) {
            usuarios = await Usuario.create([
                {
                    email: faker.internet.email().toLowerCase(),
                    nome: `${faker.name.firstName().toLowerCase()} ${faker.name.lastName().toLowerCase()}`
                },
                {
                    email: faker.internet.email().toLowerCase(),
                    nome: `${faker.name.firstName().toLowerCase()} ${faker.name.lastName().toLowerCase()}`
                },
                {
                    email: faker.internet.email().toLowerCase(),
                    nome: `${faker.name.firstName().toLowerCase()} ${faker.name.lastName().toLowerCase()}`
                }
            ]);
        } else {
            usuarios = await Usuario.find({}).limit(3);
        }

        for (let i = 0; i < quantidadeRegistros; i++) {
            usuarios.forEach(usuario => {
                documentos.push({ usuario: usuario._id, cpf: faker.br.cpf() });
            });

            if (documentos.length >= tamanhoBloco * usuarios.length || i === quantidadeRegistros - 1) {
                await Documento.insertMany(documentos, { ordered: false, bypassDocumentValidation: true });
                documentos = []
            }
        }

        console.timeEnd('## Registros populados no MongoDB ##');
    } catch (erro) {
        console.error(` ## Erro ao popular banco MongoDB: ${erro} ##`);
    } finally {
        await mongoose.disconnect();
    }
};

const consultarTodosDocumentos = async () => {
    await mongoose.connect(url);

    console.time('## Tempo de consulta de todos os registros no MongoDB ##')
    const documentos = await Documento.find();
    console.timeEnd('## Tempo de consulta de todos os registros no MongoDB ##')
    console.log(`### Quantidade de registros consultados: ${documentos.length} ###`)
    console.log()
}

const consultaDocumentosPeloUsuario = async (usuarioId) => {
    await mongoose.connect(url)

    console.time(`## Tempo de consulta de todos os documentos do usuário com o ID: ${usuarioId} MongoDB ##`)
    const usuariosDocumentos = await Usuario.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(usuarioId)
            }
        },
        {
            $lookup: {
                from: 'documentos',
                localField: '_id',
                foreignField: 'usuario',
                as: 'documentos'
            }
        },
        {
            $project: {
                _id: 1,
                documentos: {$slice: ['$documentos', 200000]} // Limita a quantidade de documentos retornados
            }
        }
    ]);
    console.timeEnd(`## Tempo de consulta de todos os documentos do usuário com o ID: ${usuarioId} MongoDB ##`)
    console.log(`### Quantidade de documentos consultados: ${usuariosDocumentos[0].documentos.length} ###`);
    console.log()
}

const consultaPrimeiroUsuario = async () => {
    await mongoose.connect(url)
    return Usuario.findOne();
}

module.exports = {
    popularBanco,
    consultarTodosDocumentos,
    consultaDocumentosPeloUsuario,
    consultaPrimeiroUsuario
}