require('dotenv').config()

const {Sequelize, DataTypes} = require('sequelize');
const faker = require('faker-br');

const sequelize = new Sequelize(
    process.env.DATABASE_MARIADB_NAME,
    process.env.DATABASE_MARIADB_USER,
    process.env.DATABASE_MARIADB_PASS,
    {
        host: process.env.DATABASE_MARIADB_HOST,
        port: process.env.DATABASE_MARIADB_PORT,
        dialect: 'mariadb',
        logging: false,
    }
);

const models = () => {
    let Usuario = sequelize.define(
        'Usuario',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            nome: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            timestamps: false,
            tableName: 'usuarios',
        }
    );

    let Documento = sequelize.define(
        'Documento',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            usuario: {
                type: DataTypes.INTEGER,
                references: {
                    model: Usuario,
                    key: 'id',
                }
            },
            cpf: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            timestamps: false,
            tableName: 'documentos',
            indexes: [{
                fields: ['usuario']
            }]
        }
    );

    Usuario.hasMany(Documento, {
        foreignKey: {
            name: 'usuario'
        }
    })

    return {
        Usuario,
        Documento
    }
}
const popularBanco = async (quantidadeRegistros, novosUsuarios) => {

    const Usuario = models().Usuario;
    const Documento = models().Documento;
    const documentos = []
    let usuario1, usuario2, usuario3;

    console.time('## Registros populados no MariaDB ##')
    if (novosUsuarios) {
        [
            usuario1,
            usuario2,
            usuario3
        ] = await Promise.all([
            (await Usuario.create({
                email: faker.internet.email().toLowerCase(),
                nome: `${faker.name.firstName().toLowerCase()} ${faker.name.lastName().toLowerCase()}`
            })).save(),
            (await Usuario.create({
                email: faker.internet.email().toLowerCase(),
                nome: `${faker.name.firstName().toLowerCase()} ${faker.name.lastName().toLowerCase()}`
            })).save(),
            (await Usuario.create({
                email: faker.internet.email().toLowerCase(),
                nome: `${faker.name.firstName().toLowerCase()} ${faker.name.lastName().toLowerCase()}`
            })).save()
        ])
    } else {
        [
            usuario1,
            usuario2,
            usuario3
        ] = await Promise.all([
            Usuario.findOne({
                where: {
                    id: 1
                }
            }),
            Usuario.findOne({
                where: {
                    id: 2
                }
            }),
            Usuario.findOne({
                where: {
                    id: 3
                }
            }),
        ])
    }

    for (let i = 0; i < quantidadeRegistros; i++) {
        documentos.push({
            usuario: usuario1.id,
            cpf: faker.br.cpf()
        });
        documentos.push({
            usuario: usuario2.id,
            cpf: faker.br.cpf()
        });
        documentos.push({
            usuario: usuario3.id,
            cpf: faker.br.cpf()
        });
    }

    await Documento.sequelize.transaction(async (t) => {
        await Documento.bulkCreate(documentos, {transaction: t});
    });

    console.timeEnd('## Registros populados no MariaDB ##')
}

const consultarTodosDocumentos = async () => {
    const Documento = models().Documento;
    console.time('## Tempo de consulta de todos os registros no MariaDB ##')
    const documentos = await Documento.findAll()
    console.timeEnd('## Tempo de consulta de todos os registros no MariaDB ##')
    console.log(`### Quantidade de registros consultados: ${documentos.length} ###`)
    console.log()
}

const consultaDocumentosPeloUsuario = async (usuarioId) => {
    const Usuario = models().Usuario;
    const Documento = models().Documento;

    console.time(`## Tempo de consulta de todos os documentos do usuário com o ID: ${usuarioId} MariaDB ##`)
    const usuariosDocumentos = await Usuario.findOne({
        include: [{
            model: Documento,
            limit: 200000
        }],
        where: {
            id: usuarioId
        }
    })

    console.timeEnd(`## Tempo de consulta de todos os documentos do usuário com o ID: ${usuarioId} MariaDB ##`)
    console.log(`### Quantidade de documentos consultados: ${usuariosDocumentos['Documentos'].length} ###`);
    console.log()
}

const consultaPrimeiroUsuario = async () => {
    const Usuario = models().Usuario;
    return Usuario.findOne()
}

module.exports = {
    popularBanco,
    consultarTodosDocumentos,
    consultaDocumentosPeloUsuario,
    consultaPrimeiroUsuario
}