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
    console.time('## Registros populados no MariaDB ##');

    try {
        const { Usuario, Documento } = models()
        let usuarios;
        let documentos = [];
        const tamanhoBloco = 1000;

        if (novosUsuarios) {
            usuarios = await Usuario.bulkCreate([
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
            usuarios = await Usuario.findAll({ limit: 3 });
        }

        for (let i = 0; i < quantidadeRegistros; i++) {
            usuarios.forEach(usuario => {
                documentos.push({ usuario: usuario.id, cpf: faker.br.cpf() });
            });

            if (documentos.length >= tamanhoBloco * usuarios.length || i === quantidadeRegistros - 1) {
                await sequelize.transaction(async (transaction) => {
                    await Documento.bulkCreate(documentos, { transaction });
                });
                documentos = [];
            }
        }

        console.timeEnd('## Registros populados no MariaDB ##');
    } catch (erro) {
        console.error(`## Erro ao popular banco MariaDB: ${ erro} ##`,);
    }
};

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