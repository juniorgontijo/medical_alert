# Evidências (prints e vídeos)

Cópia local de tudo que foi anexado nos sites publicados (PT e EN), baixada diretamente de lá — não é gerada automaticamente, então não vai atualizar sozinha se alguém subir uma evidência nova no site depois desta cópia.

## Estrutura

```
evidencias/
├── BUG-001.png ... BUG-013.png   # 1 print por bug, para os 11 bugs que têm print
├── pt/BUG-XXX/print-N.png        # tudo que foi anexado no site em português, por bug
├── pt/BUG-XXX/video-N.mp4
├── en/BUG-XXX/print-N.png        # tudo que foi anexado no site em inglês, por bug
└── en/BUG-XXX/video-N.mp4
```

- **`evidencias/BUG-XXX.png`** (raiz): é a imagem que o [BUGS.md](../BUGS.md)/[BUGS_EN.md](<../Apresentação MedAlert English/BUGS_EN.md>) já embutem automaticamente (`![BUG-XXX](evidencias/BUG-XXX.png)`) — aparece direto ao abrir esses arquivos no GitHub ou no preview do VS Code. Só existe pros 11 bugs que têm pelo menos 1 print de verdade (BUG-001 a BUG-010, e BUG-013); preferência pro print do site em português quando os dois têm.
- **`pt/` e `en/`**: cópia completa de cada evidência anexada em cada site, sem perder nada (inclusive vídeos e prints extras que não cabem na convenção de "1 arquivo por bug").

## Bugs sem print (só vídeo, ou nada ainda)

- **BUG-011, BUG-012, BUG-014, BUG-015, BUG-016, BUG-017, BUG-019, BUG-020, BUG-021** — só têm vídeo anexado (em `pt/` e/ou `en/`); o BUGS.md/BUGS_EN.md linka o vídeo direto nesses casos, em vez de tentar embutir uma imagem que não existe.
- **BUG-018** — nenhuma evidência anexada ainda em nenhum dos dois sites.

## Como manter atualizado

Isso é uma cópia estática, feita sob pedido. Se anexar prints/vídeos novos nos sites publicados depois desta cópia, essa pasta não reflete automaticamente — é preciso pedir pra baixar de novo.
