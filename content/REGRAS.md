Instruções para a sessão agendada da aciona (@aciona.portoes). Siga à risca.

CONTA
- Instagram via conector Windsor (conector `instagram`, conta `17841474648735800`).
- Carregue a ferramenta com ToolSearch: `select:mcp__Windsor_ai__execute_action`.
- Ações: create_carousel_post (2 a 10 URLs JPEG públicas), create_image_post, create_story. Story não aceita legenda nem sticker.

PREPARAÇÃO (toda execução)
0. A saída de proximo.mjs tem `formato`: "imagem" ou "video". Vídeo precisa de ffmpeg (`which ffmpeg`; se faltar, `apt-get install -y ffmpeg`). Se não for possível, pule para outro item da fila com `node tools/proximo.mjs <fila> <id>` escolhendo um que não tenha `cenas`.
1. Se a pasta do repo não existir, `add_repo` (owner gabriellaroca, repo aciona-posts, access push) e clone. Se já existir, `git pull --rebase origin main`.
2. `cd tools && npm ci` (só uma vez por sessão).
3. `node tools/proximo.mjs <fila>` onde fila é `carrosseis`, `posts`, `stories_manha` ou `stories_tarde`. A saída é JSON com id, legenda, arquivos e urls. Se vier `{"vazia":true}`, vá para FILA VAZIA.
4. Se o render escrever "texto fora da margem" no erro, não publique esse item: registre falha, pule-o e tente o próximo (`node tools/proximo.mjs <fila> <id>` aceita id explícito).

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
4. Acrescente em `content/publicados.json` o objeto `{"id","tipo","data":"AAAA-MM-DD","media_id"}`, faça commit e push. Nunca publique um id que já esteja nesse arquivo.
5. Falhas: acrescente em `content/falhas.json` (crie como lista se não existir) `{"id","data","motivo"}` e faça commit e push. Um item com falha não é repetido automaticamente.
6. Responda no fim com uma linha: o que foi publicado (id e media id) ou por que não foi.

CRIATIVIDADE (regra permanente do dono)
- Seja criativo e explore formas novas de comunicar, sempre com a marca (cores, Outfit, barra laranja, sem efeitos de sombra).
- Layouts disponíveis em tools/layout.js: cover, step, bullets, checklist, compare, cta, statement, quote, myth, services, hours, notice, bignum (número gigante), quiz e reveal (pergunta A/B/C e resposta), glossary (palavra do dia), flow (passo a passo ligado), chat (conversa em balões), anatomy (desenho do portão de correr com legenda).
- Formatos: carrossel, imagem única, story em imagem, story em vídeo narrado, Reel narrado. Alterne formatos: não publique dois itens seguidos com o mesmo layout na mesma fila.
- Quando criar itens novos, inclua pelo menos um formato ou layout que ainda não tenha sido usado nos últimos 7 dias e, se possível, invente um layout novo em tools/layout.js (mesmo estilo das funções existentes) e use-o.
- Vídeo: item com `cenas` (lista de {spec, fala}). Cada cena vira uma tela animada com a fala narrada; o fim "Fale com a aciona" é acrescentado sozinho. Fala em português do Brasil, frases curtas, números por extenso, sem inventar nada. Stories em vídeo ficam entre 8 e 25 s; Reels entre 20 e 45 s.
- Narração: depois de acrescentar itens com `fala`, gere os áudios que faltam: `pip install --break-system-packages kokoro-onnx soundfile numpy`, baixe `kokoro-v1.0.onnx` e `voices-v1.0.bin` de https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/ numa pasta de trabalho fora do repo e rode `KOKORO_DIR=<pasta> python3 tools/narrar.py`. Faça commit dos mp3 novos em content/audio.

FILA VAZIA
- Crie novos itens seguindo o banco de temas abaixo e as regras de conteúdo, acrescentando-os ao fim da lista certa em `content/fila.json` (mesmo formato dos existentes: carrosseis com `slides`, os demais com `spec`; todo `spec` precisa de `format`, `4x5` ou `story`). Posts únicos levam `footer:true`. Renderize, confira e publique normalmente.
- Banco de temas: manutenção preventiva, escolha de motor, interfone e videoporteiro, câmeras, vida em condomínio, segurança com crianças e animais, perguntas ao público, mitos e verdades, serviços da aciona.

REGRAS DE CONTEÚDO
- Marca: nome sempre em minúsculas, "aciona". Fonte Outfit. Cores: navy #0B1F3A, laranja #EE3E1E, branco, névoa #F1F3F7, aço #7C879B, preto #111111. Laranja só como destaque. Sem sombra nem efeito. Use só os layouts de `tools/layout.js`.
- Dados reais: instagram @aciona.portoes, WhatsApp (16) 99634-1354, site acionaportoes.com.br. Não invente telefone, endereço, preço, prazo, garantia, cidade, depoimento, número de clientes, selo ou certificação.
- Dica útil e segura: nada que peça abrir o motor, mexer em fiação, energia, mola ou parte interna. Para qualquer reparo, a orientação é chamar um técnico.
- Sem promessa de resultado, sem comparação com concorrentes, sem urgência falsa, sem política, sem humor com acidente.
- Não prometa processo de orçamento, visita grátis ou desconto: não foram confirmados.
- Stories: cartões informativos ou vídeos narrados, sem enquete (não há como criar sticker). Os de "NO FEED HOJE" só chamam para o post já publicado.
- Legenda em português do Brasil, direta, sem emoji em excesso (no máximo 1), 5 hashtags, WhatsApp no fim.
- Não segue, não curte, não comenta, não responde mensagens: o conector não faz isso.
- Não apague nem edite publicações já feitas.
