
//cria um servidor HTTP, na porta 3000
var app = require('http').createServer(resposta);

//módulo FileSystem, para navegar nos diretórios do projeto e abrir um arquivo
var fs = require('fs');

//módulo do Socket.IO
var io = require('socket.io')(app);

//armazena apelidos dos users
var usuarios = [];

app.listen(3000);

console.log("Aplicação está em execução...");

// Função principal de resposta as requisições do servidor
function resposta (req, res) {
	var arquivo = "";
	if(req.url == "/"){
		arquivo = __dirname + '/index.html';
	}else{
		arquivo = __dirname + req.url;
	}
	fs.readFile(arquivo,
		function (err, data) {
			if (err) {
				res.writeHead(404);
				return res.end('Página ou arquivo não encontrados');
			}

			res.writeHead(200);
			res.end(data);
		}
	);
}

//resposta à conexão do cliente ao servidor
//o módulo vai emitir para todos os sockets conectados com o servidor, o eventos
io.on("connection", function(socket){

	socket.apelido;

	//cria apelido para o chat
	//pegar USUÁRIO DA SESSÃO OU DO ADMIN
	socket.on("entrar", function(apelido, callback){
		console.log('apelido '+ apelido);
		if(!(apelido in usuarios)){
			
			socket.apelido = apelido;
			usuarios[apelido] = socket;

			io.sockets.emit("atualizar usuarios", Object.keys(usuarios));

			///emitir ícone verde bolinha online
			io.sockets.emit("atualizar mensagens", "[ " + pegarDataAtual() + " ] " + apelido + " acabou de entrar na sala");
	 
			callback(true);
		}else{
			callback(false);
		}
   });

	// Atualizar Mensagens e passará a mensagem mais nova com a data
    socket.on("enviar mensagem", function(mensagem_enviada, callback){

		//criar caixinha de texto e posicionar
        mensagem_enviada = "[ " + pegarDataAtual() + " ]: " + socket.apelido + " : " + mensagem_enviada;
 
        io.sockets.emit("atualizar mensagens", mensagem_enviada);

        //método que limpa o campo
        callback();
	});
	
	//FUNÇÃO DE DISCONNECT, MUDAR, AO INVÉS DE COLOCAR UMA MENSAGEM, COLOCAR ÍCONE DA BOLINHA VERDE ONLINE
	//remove o socket armazenado e o apelido da lista de usuários
	socket.on("disconnect", function(){
		delete usuarios[socket.apelido];

		//atualiza a lista de usuários dos clientes
		io.sockets.emit("atualizar usuarios", Object.keys(usuarios));

		//mensagem avisando que o usuário saiu da sala
		io.sockets.emit("atualizar mensagens", "[ " + pegarDataAtual() + " ] " + socket.apelido + " saiu da sala");
	});
});


// Função para apresentar uma String com a data e hora em formato DD/MM/AAAA HH:MM:SS
function pegarDataAtual(){
	var dataAtual = new Date();
	var dia = (dataAtual.getDate()<10 ? '0' : '') + dataAtual.getDate();
	var mes = ((dataAtual.getMonth() + 1)<10 ? '0' : '') + (dataAtual.getMonth() + 1);
	var ano = dataAtual.getFullYear();
	var hora = (dataAtual.getHours()<10 ? '0' : '') + dataAtual.getHours();
	var minuto = (dataAtual.getMinutes()<10 ? '0' : '') + dataAtual.getMinutes();
	var segundo = (dataAtual.getSeconds()<10 ? '0' : '') + dataAtual.getSeconds();

	var dataFormatada = dia + "/" + mes + "/" + ano + " " + hora + ":" + minuto + ":" + segundo;
	return dataFormatada;
}

// aplicação vai funcionar se comunicando com o servidor node através
// da biblioteca client-side do Socket.IO com o jQuery
// fazendo a interação com a página.