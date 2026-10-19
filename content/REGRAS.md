Instruções para a sessão agendada da aciona (@aciona.portoes). Siga à risca.

CONTA
- Instagram via conector Windsor (conector `instagram`, conta `17841474648735800`).
- Carregue a ferramenta com ToolSearch: `select:mcp__Windsor_ai__execute_action`.
- Ações: create_carousel_post (2 a 10 URLs JPEG públicas), create_image_post, create_story. Story não aceita legenda nem sticker.

PREPARAÇÃO (toda execução)
0. A saída de proximo.mjs tem `formato`: "imagem" ou "video". Vídeo precisa de ffmpeg (`which ffmpeg`; se faltar, `apt-get install -y ffmpeg`). Se não for possível, pule para outro item da fila com `node tools/proximo.mjs <fila> <id>` escolhendo um que não tenha `cenas`.
1. Se a pasta do repo não existir, `add_repo` (owner gabriellaroca, repo aciona-posts, access push) e clone. Se já existir, `git pull --rebase origin main`.
2. `cd tools && npm ci` (só uma vez por sessão).
3. INOVAR ANTES DE PUBLICAR: crie 1 item inédito para a fila desta execução e acrescente ao fim dela em `content/fila.json` (veja NOVIDADE). Ele fica para os próximos dias; só é publicado agora se a fila estiver vazia.
4. `node tools/proximo.mjs <fila>` onde fila é `carrosseis`, `posts`, `stories_manha` ou `stories_tarde`. O script escolhe o item com o tema há mais tempo sem aparecer em qualquer fila; os stories "NO FEED HOJE" (`ref`) só saem no dia em que o post citado foi publicado. A saída é JSON com id, tema, legenda, arquivos e urls. Se vier `{"vazia":true}`, vá para FILA VAZIA.
5. Se o render escrever "texto fora da margem" no erro, não publique esse item: registre falha, pule-o e tente o próximo (`node tools/proximo.mjs <fila> <id>` aceita id explícito).

CONFERÊNCIA ANTES DE PUBLICAR
- Abra com Read pelo menos o primeiro arquivo (e um do meio, se for carrossel). Confira: texto legível, nada cortado, logo aciona e barra laranja presentes. Se algo estiver errado, não publique e registre falha.
- Em vídeo, confira também o poster com Read e rode `ffprobe` no mp4 (duração entre 3 e 90 s). Stories em vídeo precisam ter no máximo 60 s.
- Confirme que cada URL de imagem responde (curl -I, status 200) depois do push. A `video_url` (jsDelivr) pode não ser alcançável pela sessão; não bloqueie por isso, use `video_url_alt` para conferir o 200. O raw do GitHub pode levar alguns segundos: tente de novo até 5 vezes com pausa de 10 s.

PUBLICAÇÃO
1. `git add <pasta do item>`, commit e push para main (`git fetch origin main` e rebase antes se o push for rejeitado). Sem push as URLs não existem.
2. Publique com execute_action (connector instagram, account 17841474648735800):
   - carrosseis: create_carousel_post com as urls em ordem e a legenda do JSON.
   - posts: create_image_post com a url e a legenda.
   - stories_manha e stories_tarde: create_story com a url (sem legenda). Se `formato` for "video", use `video_url` em vez de `image_url`. Se falhar, tente uma vez `video_url_alt`. Se falhar de novo, publique `poster_url` como story de imagem.
   - posts com `tipo` "reels": create_video_post com `video_url`, `cover_url` igual a `poster_url`, a legenda do JSON e share_to_feed true. Se falhar, tente uma vez com `video_url_alt`; se falhar de novo, registre falha (não há alternativa em imagem).
3. Só considere publicado se a resposta trouxer um media id. Se der erro, não repita mais de uma vez; se persistir, registre falha.
4. Acrescente em `content/publicados.json` o objeto `{"id","tipo","tema","data":"AAAA-MM-DD","media_id"}` (data no horário de Brasília), faça commit e push. Nunca publique um id que já esteja nesse arquivo.
5. Falhas: acrescente em `content/falhas.json` (crie como lista se não existir) `{"id","data","motivo"}` e faça commit e push. Um item com falha não é repetido automaticamente.
6. Responda no fim com uma linha: o que foi publicado (id e media id) ou por que não foi.

NOVIDADE (regra número 1 do dono: sempre inovar, sempre conteúdo novo)
- Nunca repita uma ideia já publicada nem uma que já esteja na fila. Antes de criar, leia os títulos de `content/publicados.json` e `content/fila.json`. Mesma dica com outras palavras, em outro formato ou em outro layout também é repetição. Um aprofundamento só vale se trouxer informação nova e disser que é continuação.
- Todo item novo precisa de um `tema` curto (ex.: controle, trilho, energia, cameras, historia, seguranca_rua). Prefira temas que estão há mais tempo sem aparecer. Não é regra rígida de dias: o que manda é variar e trazer algo que o público ainda não viu aqui.
- Fontes de novidade: curiosidades e história verificáveis, "você sabia?", tecnologia nova do setor, hábitos de segurança, erros comuns, comparações, bastidores com fotos reais que o dono enviar, perguntas ao público, quizzes, mitos, glossário, situações do dia a dia.
- Fato, número, data ou nome só entra se tiver fonte confiável conferida com WebSearch ou WebFetch na hora. Use o campo `fonte` do layout `fact` quando citar. Sem fonte, não publique o fato.

IMPACTO E GATILHOS (éticos)
- Gancho em até 8 palavras no primeiro slide ou cartão, e na primeira linha da legenda. Gere uma lacuna de curiosidade que o post responde por inteiro.
- Gatilhos permitidos: curiosidade, pergunta direta ("e o seu portão?"), desafio ou quiz, identificação com situações reais, aversão à perda com risco real e proporcional, novidade, número concreto com fonte, história, reciprocidade (dica valiosa de graça), autoridade técnica.
- Proibido: urgência ou escassez falsa, medo exagerado, dado ou depoimento inventado, prova social que não existe, clickbait que não entrega o que promete.
- Chamada final variada: alterne entre "salve" (layout `save`), "mande para alguém", "comente", "responda por mensagem" e WhatsApp. Não use sempre a mesma.

UX E UI
- Uma ideia por tela. Até cerca de 20 palavras por slide ou cartão; o título carrega a mensagem e o corpo explica.
- Hierarquia clara: tag curta, título forte, corpo curto. Laranja só no trecho que deve ser lido primeiro.
- Carrossel: capa com gancho e "ARRASTE"; miolo com um passo por slide; fechamento com chamada. De 5 a 8 slides.
- Alterne fundos (navy, névoa, branco, laranja) entre slides e entre dias para o feed não ficar monótono.
- Vídeo: a primeira frase falada já é o gancho; nada de introdução.

CRIATIVIDADE (regra permanente do dono)
- Seja criativo e explore formas novas de comunicar, sempre com a marca (cores, Outfit, barra laranja, sem efeitos de sombra).
- Layouts disponíveis em tools/layout.js: cover, step, bullets, checklist, compare, cta, statement, quote, myth, services, hours, notice, bignum (número gigante), quiz e reveal (pergunta A/B/C e resposta), glossary (palavra do dia), flow (passo a passo ligado), chat (conversa em balões), anatomy (desenho do portão de correr com legenda), fact (curiosidade com número ou ano gigante e fonte), timeline (linha do tempo), dodont (faça e evite), save (slide final "salve este post"), photo (foto com faixa navy; aceita `ph` para a altura da foto).
- Formatos: carrossel, imagem única, story em imagem, story em vídeo narrado, Reel narrado. Alterne formatos: não publique dois itens seguidos com o mesmo layout na mesma fila.
- Quando criar itens novos, prefira o formato e o layout menos usados recentemente e, de vez em quando, invente um layout novo em tools/layout.js (mesmo estilo das funções existentes) e use-o.
- Vídeo: item com `cenas` (lista de {spec, fala}). Cada cena vira uma tela animada com a fala narrada; o fim "Fale com a aciona" é acrescentado sozinho. Fala em português do Brasil, frases curtas, números por extenso, sem inventar nada. Stories em vídeo ficam entre 8 e 25 s; Reels entre 20 e 45 s.
- Narração: depois de acrescentar itens com `fala`, gere os áudios que faltam: `pip install --break-system-packages kokoro-onnx soundfile numpy`, baixe `kokoro-v1.0.onnx` e `voices-v1.0.bin` de https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/ numa pasta de trabalho fora do repo e rode `KOKORO_DIR=<pasta> python3 tools/narrar.py`. Faça commit dos mp3 novos em content/audio.

FILA VAZIA
- Crie novos itens seguindo o banco de temas abaixo e as regras de conteúdo, acrescentando-os ao fim da lista certa em `content/fila.json` (mesmo formato dos existentes: carrosseis com `slides`, os demais com `spec`; todo `spec` precisa de `format`, `4x5` ou `story`). Posts únicos levam `footer:true`. Renderize, confira e publique normalmente.
- Crie de 3 a 5 itens inéditos para a fila (seguindo NOVIDADE, IMPACTO E UX), publique o primeiro e deixe os outros na fila.

REGRAS DE CONTEÚDO
- Marca: nome sempre em minúsculas, "aciona". Fonte Outfit. Cores: navy #0B1F3A, laranja #EE3E1E, branco, névoa #F1F3F7, aço #7C879B, preto #111111. Laranja só como destaque. Sem sombra nem efeito. Use só os layouts de `tools/layout.js`.
- Dados reais: instagram @aciona.portoes, WhatsApp (16) 99634-1354, site acionaportoes.com.br. Não invente telefone, endereço, preço, prazo, garantia, cidade, depoimento, número de clientes, selo ou certificação.
- Dica útil e segura: nada que peça abrir o motor, mexer em fiação, energia, mola ou parte interna. Para qualquer reparo, a orientação é chamar um técnico.
- Sem promessa de resultado, sem comparação com concorrentes, sem urgência falsa, sem política, sem humor com acidente.
- Não prometa processo de orçamento, visita grátis ou desconto: não foram confirmados.
- Stories: cartões informativos ou vídeos narrados, sem enquete (não há como criar sticker). Os de "NO FEED HOJE" levam `ref` com o id do post e só chamam para ele.
- Legenda em português do Brasil, direta, sem emoji em excesso (no máximo 1), 5 hashtags, WhatsApp no fim.
- Não segue, não curte, não comenta, não responde mensagens: o conector não faz isso.
- Não apague nem edite publicações já feitas.
