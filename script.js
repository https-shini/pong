// Variáveis ​​globais
var DIRECTION = {
  IDLE: 0,
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4
};

var rounds = [5, 5, 3, 3, 2];
var colors = ['#1abc9c', '#2ecc71', '#3498db', '#8c52ff', '#9b59b6'];

// O objeto bola (o cubo que quica para frente e para trás)
var Ball = {
  new: function (incrementedSpeed) {
      return {
          width: 18,
          height: 18,
          x: (this.canvas.width / 2) - 9,
          y: (this.canvas.height / 2) - 9,
          moveX: DIRECTION.IDLE,
          moveY: DIRECTION.IDLE,
          speed: incrementedSpeed || 7 
      };
  }
};

// O objeto IA (as duas linhas que se movem para cima e para baixo)
var Ai = {
  new: function (side) {
      return {
          width: 18,
          height: 180,
          x: side === 'left' ? 150 : this.canvas.width - 150,
          y: (this.canvas.height / 2) - 35,
          score: 0,
          move: DIRECTION.IDLE,
          speed: 8
      };
  }
};

var Game = {
  initialize: function () {
      this.canvas = document.querySelector('canvas');
      this.context = this.canvas.getContext('2d');

      this.canvas.width = 1400;
      this.canvas.height = 1000;

      this.canvas.style.width = (this.canvas.width / 2) + 'px';
      this.canvas.style.height = (this.canvas.height / 2) + 'px';

      this.player = Ai.new.call(this, 'left');
      this.ai = Ai.new.call(this, 'right');
      this.ball = Ball.new.call(this);

      this.ai.speed = 5;
      this.running = this.over = false;
      this.turn = this.ai;
      this.timer = this.round = 0;
      this.color = '#8c52ff';

      Pong.menu();
      Pong.listen();
  },

  endGameMenu: function (text) {
      // Altere o tamanho e a cor da fonte da tela
      Pong.context.font = '45px Courier New';
      Pong.context.fillStyle = this.color;

      // Desenhe o retângulo atrás do texto 'Pressione qualquer tecla para começar'
      Pong.context.fillRect(
          Pong.canvas.width / 2 - 350,
          Pong.canvas.height / 2 - 48,
          700,
          100
      );

      // Alterar a cor da tela;
      Pong.context.fillStyle = '#ffffff';

      // Desenhe o texto do menu final do jogo ('Game Over' e 'Winner')
      Pong.context.fillText(text,
          Pong.canvas.width / 2,
          Pong.canvas.height / 2 + 15
      );

      setTimeout(function () {
          Pong = Object.assign({}, Game);
          Pong.initialize();
      }, 3000);
  },

  menu: function () {
      // Desenhe todos os objetos Pong em seu estado atual
      Pong.draw();

      // Change the canvas font size and color
      this.context.font = '50px Courier New';
      this.context.fillStyle = this.color;

      // Desenhe o retângulo atrás do texto 'Pressione qualquer tecla para começar'.
      this.context.fillRect(
          this.canvas.width / 2 - 350,
          this.canvas.height / 2 - 48,
          700,
          100
      );

      // Alterar a cor da tela;
      this.context.fillStyle = '#ffffff';

      // Desenhe o texto 'pressione qualquer tecla para começar'
      this.context.fillText('Press any key to begin',
          this.canvas.width / 2,
          this.canvas.height / 2 + 15
      );
  },

  // Atualize todos os objetos (mover o jogador, AI, bola, aumentar a pontuação, etc.)
  update: function () {
      if (!this.over) {
          // Se a bola colidir com os limites limitados - corrija as coordenadas x e y.
          if (this.ball.x <= 0) Pong._resetTurn.call(this, this.ai, this.player);
          if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.player, this.ai);
          if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
          if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;

          // Mover jogador se o valor player.move foi atualizado por um evento de teclado
          if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
          else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;

          // No novo saque (início de cada turno) move a bola para o lado correto
          // e randomize a direção para adicionar algum desafio.
          if (Pong._turnDelayIsOver.call(this) && this.turn) {
              this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
              this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
              this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
              this.turn = null;
          }

          // Se o jogador colidir com os limites limitados, atualize as coordenadas x e y.
          if (this.player.y <= 0) this.player.y = 0;
          else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);

          // Move a bola na direção pretendida com base nos valores moveY e moveX
          if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
          else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
          if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
          else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;

          // Lida com o movimento da 'IA' PARA CIMA e PARA BAIXO
          if (this.ai.y > this.ball.y - (this.ai.height / 2)) {
              if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y -= this.ai.speed / 1.5;
              else this.ai.y -= this.ai.speed / 4;
          }
          if (this.ai.y < this.ball.y - (this.ai.height / 2)) {
              if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y += this.ai.speed / 1.5;
              else this.ai.y += this.ai.speed / 4;
          }

          // Lida com colisão de parede da 'IA'
          if (this.ai.y >= this.canvas.height - this.ai.height) this.ai.y = this.canvas.height - this.ai.height;
          else if (this.ai.y <= 0) this.ai.y = 0;

          // Lida com colisões Player-Ball
          if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
              if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
                  this.ball.x = (this.player.x + this.ball.width);
                  this.ball.moveX = DIRECTION.RIGHT;

              }
          }

          // Lida com a colisão de bola da 'IA'
          if (this.ball.x - this.ball.width <= this.ai.x && this.ball.x >= this.ai.x - this.ai.width) {
              if (this.ball.y <= this.ai.y + this.ai.height && this.ball.y + this.ball.height >= this.ai.y) {
                  this.ball.x = (this.ai.x - this.ball.width);
                  this.ball.moveX = DIRECTION.LEFT;

              }
          }
      }

      // Manipula o final da transição da rodada e
      // Verifica se o jogador ganhou a rodada.
      if (this.player.score === rounds[this.round]) {
          // Verifique se há mais rodadas/níveis restantes e exiba a tela de vitória se
          // não há.
          if (!rounds[this.round + 1]) {
              this.over = true;
              setTimeout(function () { Pong.endGameMenu('Winner!'); }, 1000);
          } else {
              // Se houver outra rodada, redefina todos os valores e incremente o número da rodada.
              this.color = this._generateRoundColor();
              this.player.score = this.ai.score = 0;
              this.player.speed += 0.5;
              this.ai.speed += 1;
              this.ball.speed += 1;
              this.round += 1;

          }
      }
      // Verifica se o ai/AI venceu a rodada.
      else if (this.ai.score === rounds[this.round]) {
          this.over = true;
          setTimeout(function () { Pong.endGameMenu('Game Over!'); }, 1000);
      }
  },

  // Desenha os objetos para o elemento canvas
  draw: function () {
      // Clear the Canvas
      this.context.clearRect(
          0,
          0,
          this.canvas.width,
          this.canvas.height
      );

      // Define o estilo de preenchimento para preto
      this.context.fillStyle = this.color;

      // Draw the background
      this.context.fillRect(
          0,
          0,
          this.canvas.width,
          this.canvas.height
      );

      // Defina o estilo de preenchimento para branco (Para as raquetes e a bola)
      this.context.fillStyle = '#ffffff';

      // Desenha o jogador
      this.context.fillRect(
          this.player.x,
          this.player.y,
          this.player.width,
          this.player.height
      );

      // Desenha a 'IA'
      this.context.fillRect(
          this.ai.x,
          this.ai.y,
          this.ai.width,
          this.ai.height 
      );

      // Desenha a Bola
      if (Pong._turnDelayIsOver.call(this)) {
          this.context.fillRect(
              this.ball.x,
              this.ball.y,
              this.ball.width,
              this.ball.height
          );
      }

      // Desenha a rede (Linha no meio)
      this.context.beginPath();
      this.context.setLineDash([7, 15]);
      this.context.moveTo((this.canvas.width / 2), this.canvas.height - 140);
      this.context.lineTo((this.canvas.width / 2), 140);
      this.context.lineWidth = 10;
      this.context.strokeStyle = '#ffffff';
      this.context.stroke();

      // Defina a fonte padrão da tela e alinhe-a ao centro
      this.context.font = '100px Courier New';
      this.context.textAlign = 'center';

      // Desenhe a pontuação dos jogadores (esquerda)
      this.context.fillText(
          this.player.score.toString(),
          (this.canvas.width / 2) - 300,
          200
      );

      // Desenhe a pontuação das pás (à direita)
      this.context.fillText(
          this.ai.score.toString(),
          (this.canvas.width / 2) + 300,
          200
      );

      // Altere o tamanho da fonte para o texto da pontuação central
      this.context.font = '30px Courier New';

      // Desenhe a pontuação vencedora (centro)
      this.context.fillText(
          'Round ' + (Pong.round + 1),
          (this.canvas.width / 2),
          35
      );

      // Altere o tamanho da fonte para o valor da pontuação central
      this.context.font = '40px Courier';

      // Desenha o número da rodada atual
      this.context.fillText(
          rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1],
          (this.canvas.width / 2),
          100
      );
  },

  loop: function () {
      Pong.update();
      Pong.draw();

      // Se o jogo ainda não acabou, desenhe o próximo quadro.
      if (!Pong.over) requestAnimationFrame(Pong.loop);
  },

  listen: function () {
      document.addEventListener('keydown', function (key) {
          // Manuseie a função 'Pressione qualquer tecla para começar' e inicie o jogo.
          if (Pong.running === false) {
              Pong.running = true;
              window.requestAnimationFrame(Pong.loop);
          }

          // Lida com a seta para cima e os eventos da tecla 'W'
          if (key.keyCode === 38 || key.keyCode === 87) Pong.player.move = DIRECTION.UP;

          // Handle down arrow and s key events
          if (key.keyCode === 40 || key.keyCode === 83) Pong.player.move = DIRECTION.DOWN;
      });

      // Impede que o jogador se mova quando não há teclas sendo pressionadas.
      document.addEventListener('keyup', function (key) { Pong.player.move = DIRECTION.IDLE; });
  },

  // Redefina a localização da bola, o jogador vira e define um atraso antes do início da próxima rodada.
  _resetTurn: function(victor, loser) {
      this.ball = Ball.new.call(this, this.ball.speed);
      this.turn = loser;
      this.timer = (new Date()).getTime();

      victor.score++;
  },

  // Espera que um atraso tenha passado após cada turno.
  _turnDelayIsOver: function() {
      return ((new Date()).getTime() - this.timer >= 1000);
  },

  // Selecione uma cor aleatória como fundo de cada nível/rodada.
  _generateRoundColor: function () {
      var newColor = colors[Math.floor(Math.random() * colors.length)];
      if (newColor === this.color) return Pong._generateRoundColor();
      return newColor;
  }
};

var Pong = Object.assign({}, Game);
Pong.initialize();
