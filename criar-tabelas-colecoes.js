require('dotenv').config()

const {Sequelize, DataTypes} = require('sequelize');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const url = `mongodb://${process.env.DATABASE_MONGODB_USER}:${process.env.DATABASE_MONGODB_PASS}@${process.env.DATABASE_MONGODB_HOST}:${process.env.DATABASE_MONGODB_PORT}/${process.env.DATABASE_MONGODB_NAME}?authSource=admin`;

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

const criarEsquemasBancoDeDados = async () => {
    console.log('# Criando Coleções e Tabelas nas bases de dados #')

    await mongoose.connect(url)

    mongoose.model('Usuario', new Schema({
        nome: {type: String, required: true},
        email: {type: String, required: true, max: 255},
    }));

    mongoose.model('Documento', new Schema({
        usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true},
        cpf: {type: String, required: true, max: 255},
    }));


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

    await Usuario.sync(true);
    await Documento.sync(true);

    console.log('## Coleções e Tabelas criadas com sucesso ##');
    process.exit();
}

criarEsquemasBancoDeDados()