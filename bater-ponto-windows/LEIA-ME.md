# Bater Ponto (Windows)

Mostra uma janela grande escrita **BATER PONTO**:

| Quando | O que acontece |
| --- | --- |
| Ao ligar o notebook / entrar no Windows | Aparece o aviso |
| Ao voltar da suspensão ou desbloquear a tela | Aparece o aviso |
| Ao apertar **Windows + L** | Aparece o aviso **antes**; a tela só bloqueia depois de clicar em "Já bati o ponto - Bloquear" |
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
- **Windows + L:** para mostrar o aviso antes, o monitor desativa o bloqueio
  automático do Windows enquanto está rodando e só bloqueia pela janela do aviso.
  Enquanto isso, a opção *Bloquear* do Ctrl + Alt + Del some e o bloqueio por
  inatividade (proteção de tela) pode não acontecer. Antes de suspender, o
  bloqueio é religado, então o Windows continua pedindo a senha ao voltar.
- **Fechar a tampa** ou **Iniciar → Suspender:** o aviso só aparece quando o
  notebook voltar. Para ver o aviso antes, use o atalho *Suspender (Bater Ponto)*.
