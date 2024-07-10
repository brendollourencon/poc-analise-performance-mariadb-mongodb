const testesMongoDB = require('./mongodb')
const testesMariaDB = require('./mariadb')

const popularBancoDeDados = async () => {
    await testesMongoDB.popularBanco(100000);
    await testesMariaDB.popularBanco(100000);
}

const consultaTodosDocumentos = async () => {
    await testesMongoDB.consultarTodosDocumentos();
    await testesMariaDB.consultarTodosDocumentos();
}

const consultaTodosDocumentosPorUsuario = async () => {
    const usuarioMongoDB = await testesMongoDB.consultaPrimeiroUsuario()
    const usuarioMariaDB = await testesMariaDB.consultaPrimeiroUsuario()

    await testesMongoDB.consultaDocumentosPeloUsuario(usuarioMongoDB._id.toString());
    await testesMariaDB.consultaDocumentosPeloUsuario(usuarioMariaDB.id)
}

const iniciarTestes = async () => {
    console.log('# Populando registros #')
    await popularBancoDeDados()
    console.log()

    console.log('# Consultando todos os dados #')
    await consultaTodosDocumentos()
    console.log()

    console.log('# Consultando todos os dados por id do usuário #')
    await consultaTodosDocumentosPorUsuario()
    console.log()

    process.exit()
}

iniciarTestes()
