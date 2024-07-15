<section>
<h1>POC para análise de performance entre MariaDB e MongoDB</h1>
<p>POC para analisar um banco relacional e um banco não relacional. Nesta análise será utilizado o banco de dados MariaDB e MongoDB.</p>
</section>

<section>
<h2>Requisitos para executar o projeto</h2>
<img src="https://img.shields.io/static/v1?label=Nodejs&message=Nodejs 21.4.0&color=4F9C43&style=for-the-badge&logo=nodedotjs" />
<img src="https://img.shields.io/static/v1?label=Docker&message=Docker 24.0.7&color=1C8CB0&style=for-the-badge&logo=docker" />
</section>

<section>
<h2>Como instalar o projeto</h2>
<p>Siga o passo-a-passo para instalar o projeto e iniciar a análise de performance.</p>
</section>

<section>
<h2>Instalando dependências</h2>
<p>Executa o comando <code>npm install</code> para instalar as dependências do projeto.</p>
</section>

<section>
<h3>Crie as bases de dados MariaDB e MongoDB com docker-compose</h3>
<p>Na pasta raiz do projeto execute o comando: <code>docker-compose up</code>.</p>
<p>
Crie os schemas de cada banco de dados nos seus respectivos SGBD's, neste exemplo o nome do schema é meubanco. 
Para o Mongo é recomendável utilizar MongoDB Compass e para o MariaDB é recomendável utilizar Mysql Workhbench ou DataGrid (Intellij), 
lembre-se de criar os schemas com o formato utf-8.
</p>
<p>Após criar os schemas, basta rodar o comando <code>npm run criar-tabelas-colecoes</code> para criar as tabelas e as coleções dos respectivos banco de dados.</p>
</section>

<section>
<h2>Executando os testes de performance</h2>
<p>
Todos os métodos para testes de performance estão dentro do arquivo index.js na pasta raiz do projeto e podem ser 
executados com o comando <code>npm start</code>, fique a vontade para comentar e des-comentar os métodos para 
testes e análise de desempenho.
</p>
<p>Obs: Caso não queira popular os dados via script, há um dump das duas bases de dados <a href="https://drive.google.com/drive/folders/1JvdQ1tgOGo_8tcC5TFGJIU4VAoYcEcER?usp=sharing">neste link</a>.</p>
</section>