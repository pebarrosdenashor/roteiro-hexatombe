# Roteiro do Hexatombe (extensão para Owlbear Rodeo)

Linha do tempo do mestre para Bom Jesus do Açude: quem está em cada local, dia a dia (de dia e de noite), os eventos fixos, as alianças e o plano de cada equipe.
Só o mestre usa: se um jogador abrir, aparece "Privado para o mestre".

## Como instalar

1. No GitHub, crie um repositório **público** chamado `roteiro-hexatombe` na conta `pebarrosdenashor`.
2. Envie os arquivos **soltos, na raiz** (fora de qualquer pasta):
   `manifest.json`, `index.html`, `app.js`, `dados.js`, `style.css`, `icon.svg`, `.nojekyll`, `LEIA-ME.md`, `README.md`.
3. Em **Settings → Pages**: *Deploy from a branch* → `main` → `/ (root)` → Save.
4. Depois de 1 ou 2 minutos, abra `https://pebarrosdenashor.github.io/roteiro-hexatombe/manifest.json` e confira se aparece `"name": "Roteiro do Hexatombe"`.
5. No Owlbear: **Extensions → Add Extension**, cole esse link e ative na sala.

## O que tem

**Linha do tempo** — escolha o dia (1 a 6) e o turno (dia ou noite). Aparece o resumo do turno, os eventos fixos daquele momento e os 15 locais com as equipes que estão em cada um. Os locais vazios ficam tracejados. Filtre por ocupados ou vazios.
Clique num local para ver a semana inteira dele, o encontro principal e o que ele pode render.
O botão de grade mostra todos os locais × todos os dias de uma vez; clique numa célula para abrir aquele local naquele turno.
"Marcar como dia atual" deixa um ponto no dia em que a mesa está.

**Eventos** — os eventos fixos por dia, com falas. Marque o quadradinho quando o evento acontecer. Embaixo há um espaço para notas da sessão.

**Alianças** — as três propostas (Floresta, Zahab, Romaria). Escolha qual os jogadores aceitaram e o Bloco rival correspondente fica destacado.

**Equipes** — cada equipe com membros, o plano de cada dia e onde ela está (de dia e de noite), puxado da linha do tempo. Clique num local para ir até ele.

O botão de expandir abre o roteiro em tela grande, bom para a grade.

## Editar

Clique em **Editar**. Tudo vira campo: o resumo de cada turno, quem está em cada local (clique nas etiquetas das equipes para ligar ou desligar), os textos, os eventos, as alianças e as equipes (nome, cor, membros e plano). Também dá para criar e excluir locais, eventos e equipes.
As mudanças salvam sozinhas no navegador do mestre.

No menu (⋮):
- **Exportar conteúdo**: copia todo o roteiro como texto. Guarde uma cópia, principalmente antes de limpar o navegador ou trocar de computador.
- **Importar conteúdo**: cola um texto exportado e substitui o roteiro.
- **Restaurar o roteiro original**: apaga as edições e volta ao conteúdo de `dados.js`.

> O roteiro fica salvo neste navegador. Em outro computador, use Exportar e Importar para levar as edições.
