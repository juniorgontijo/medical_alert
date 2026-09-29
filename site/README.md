# MedAlert — Site interativo de triagem de bugs

Código-fonte dos dois sites publicados (o mesmo conteúdo de [BUGS.md](../BUGS.md)/[BUGS_EN.md](<../Apresentação MedAlert English/BUGS_EN.md>), em formato de ficha de triagem navegável, com busca, filtro por severidade/tipo/categoria, e upload de evidência).

- **Português:** [triagem-medalert.html](triagem-medalert.html) — publicado em https://claude.ai/artifact/2mYWCDe2fXeRkMBWaBjDFg
- **Inglês:** [medalert-triage-en.html](medalert-triage-en.html) — publicado em https://claude.ai/artifact/M947KJzfsQZ6fRUeo6KMHQ

Também tem o **[presenter-guide.html](presenter-guide.html)** — guia de apresentação (run of show cronometrado, 15–20 min, cola de perguntas técnicas), pra abrir num segundo monitor durante a apresentação final. Publicado em https://claude.ai/artifact/E1Ji7mYqyguiAVZf516eeK. Conteúdo espelha [PRESENTATION_GUIDE_EN.md](<../Apresentação MedAlert English/PRESENTATION_GUIDE_EN.md>).

## Como abrir

- **Links acima (recomendado):** versão publicada, com upload de print/vídeo funcionando (usa capabilities de `assets`/`db` do Claude, que só existem nesse ambiente).
- **Abrindo o `.html` direto no navegador (ex.: duplo clique no arquivo):** a página funciona normalmente — filtro, busca, todos os 21 bugs — só o botão de upload de evidência não aparece, porque essas duas funções (`window.claude.use('assets')`/`.use('db')`) não existem fora do ambiente do Claude.

Os dois arquivos são independentes (cada idioma tem sua própria área de evidência anexada); enviar um print no site em português não faz ele aparecer automaticamente no site em inglês.
