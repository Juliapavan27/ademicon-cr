# Bater Ponto (Windows)

Mostra uma janela grande escrita **BATER PONTO**:

| Quando | O que acontece |
| --- | --- |
| Ao ligar o notebook / entrar no Windows | Aparece o aviso |
| Ao voltar da suspensão ou desbloquear a tela | Aparece o aviso |
| Assim que a tela bloqueia (**Windows + L**, tampa, suspensão ou inatividade) | A **imagem da tela de bloqueio** mostra a marca *Maria Dolores* com o lembrete discreto "registre o seu ponto" |
| Ao apertar o **botão de energia** | O botão passa a **desligar** o notebook, e o Windows para na tela com a mensagem *BATER PONTO* (veja a linha abaixo) |
| Ao clicar em **Desligar** ou **Reiniciar** no menu Iniciar | O Windows para na tela "aplicativos impedindo o desligamento" com a mensagem *BATER PONTO*. Depois de bater o ponto, clique em **Desligar mesmo assim** |
| Atalhos **Suspender / Desligar / Bloquear tela (Bater Ponto)** | Mostram o aviso e só executam a ação depois que você clica em "Já bati o ponto" |

## Instalar

1. Copie a pasta `bater-ponto-windows` para o notebook.
2. Dê dois cliques em `instalar.bat` (não precisa de administrador).
3. O aviso aparece na hora. Os atalhos ficam na Área de Trabalho e no menu Iniciar,
   na pasta **Bater Ponto** — dá para fixá-los na barra de tarefas ou no Iniciar
   (botão direito → *Fixar*).

Para remover, dê dois cliques em `desinstalar.bat`.

## Observações

- **Botão de energia:** o instalador muda a ação do botão para *Desligar*, porque o
  Windows não deixa nenhum programa interromper a *suspensão* para mostrar um
  aviso. O `desinstalar.bat` devolve a configuração original.
- **Tela de bloqueio:** o instalador troca a imagem da tela de bloqueio por uma
  tela com a marca da empresa (fica salva em `%LOCALAPPDATA%\BaterPonto`). Para
  personalizar, antes de rodar o `instalar.bat`:
  - coloque o logo da empresa como `logo.png` nesta pasta (de preferência com fundo
    transparente), ou
  - coloque uma imagem pronta como `tela-de-bloqueio.jpg`, que é usada sem alterações, ou
  - mude o nome, o texto e as cores no início da parte "Personalize aqui" do `instalar.ps1`.

  Ao desinstalar, escolha outra imagem na janela de configurações que abre.
- **Fechar a tampa** ou **Iniciar → Suspender:** a janela do aviso só aparece quando o
  notebook voltar (mas o lembrete da tela de bloqueio aparece na hora). Para ver o aviso antes, use o atalho *Suspender (Bater Ponto)*.
