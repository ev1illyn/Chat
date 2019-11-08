
//cria um servidor HTTP, na porta 3000
var app = require('http').createServer(resposta);

//módulo FileSystem, para navegar nos diretórios do projeto e abrir um arquivo
var fs = require('fs');

//módulo do Socket.IO
var io = require('socket.io')(app);

app.listen(3000);

console.log("Aplicação está em execução...");

// Função principal de resposta as requisições do servidor
function resposta (req, res) {
	var arquivo = "";
	if(req.url == "/"){
		console.log('yes');
		arquivo = __dirname + '/index.html';
		console.log(arquivo);
	}else{
		console.log('no');
		console.log(arquivo);
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
//o módulo vai emitir para todos os sockets conectados com o servidor, o evento Atualizar Mensagens
// e passará a mensagem mais nova com a data
io.on("connection", function(socket){
    socket.on("enviar mensagem", function(mensagem_enviada, callback){
        mensagem_enviada = "[ " + pegarDataAtual() + " ]: " + mensagem_enviada;
 
        io.sockets.emit("atualizar mensagens", mensagem_enviada);

        //método que limpa o campo
        callback();
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