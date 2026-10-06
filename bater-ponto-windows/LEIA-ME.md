# Bater Ponto (Windows)

Mostra uma janela grande escrita **BATER PONTO**:

| Quando | O que acontece |
| --- | --- |
| Ao ligar o notebook / entrar no Windows | Aparece o aviso |
| Ao voltar da suspensão ou desbloquear a tela | Aparece o aviso |
| Ao clicar em **Desligar** ou **Reiniciar** no menu Iniciar | O Windows para na tela "aplicativos impedindo o desligamento" com a mensagem *BATER PONTO*. Depois de bater o ponto, clique em **Desligar mesmo assim** |
| Atalhos **Suspender / Desligar / Bloquear tela (Bater Ponto)** | Mostram o aviso e só executam a ação depois que você clica em "Já bati o ponto" |

## Instalar

1. Copie a pasta `bater-ponto-windows` para o notebook.
2. Dê dois cliques em `instalar.bat` (não precisa de administrador).
3. O aviso aparece na hora. Os atalhos ficam na Área de Trabalho e no menu Iniciar,
   na pasta **Bater Ponto** — dá para fixá-los na barra de tarefas ou no Iniciar
   (botão direito → *Fixar*).

Para remover, dê dois cliques em `desinstalar.bat`.

## Limitação: suspensão pelo menu Iniciar, tampa ou botão de energia

O Windows não permite que nenhum programa interrompa a **suspensão** para mostrar
uma mensagem — ela acontece imediatamente. Por isso:

- se suspender pelo menu Iniciar, fechando a tampa ou pelo botão de energia, o
  aviso aparece **quando o notebook voltar**;
- para ver o aviso **antes** de suspender ou bloquear, use os atalhos
  *Suspender (Bater Ponto)* e *Bloquear tela (Bater Ponto)*.
