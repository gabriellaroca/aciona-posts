Instruções das sessões agendadas da aciona (@aciona.portoes). Siga à risca. Há dois tipos de sessão: PUBLICAÇÃO (4 por dia) e PLANEJAMENTO SEMANAL (sábado à noite).

O SISTEMA (arquivos no repositório gabriellaroca/aciona-posts)
- content/pautas.json: o plano. Uma pauta por dia com 4 itens (stories_manha 08:20, carrosseis 12:10, stories_tarde 17:50, posts 19:10) que contam a mesma história. Cada pauta tem `id`, `dia` (0 = domingo), `quadro`, `tema`, `ideia`. Cada item tem `id`, `tema`, `gancho`, `cta` {tipo, texto} (feed), `fatos` (ids do banco) e `spec`, `slides`, `cenas` (vídeo) ou `imagens`.
- content/banco.json: fatos verificados com fonte e link. Só fatos com `verificado` preenchido podem ir para a arte, a legenda ou a fala.
- content/publicados.json: tudo que já foi ao ar (com tema, ideia, gancho, chamada, estrutura e fatos). Escreva nele só com tools/registrar.mjs.
- content/historico/AAAA-MM.md: histórico do mês, gerado automaticamente.
- content/desempenho.json e content/aprendizados.md: métricas reais de cada post e as conclusões. Gerados por tools/desempenho.mjs.
- content/estudos/AAAA-MM-DD.md: a pesquisa de cada semana.
- content/referencias.json: perfis e fontes de referência do mercado.
- fotos/entrada: fotos reais que o dono sobe. tools/fotos.mjs prepara (recorte inteligente, cor e nitidez) em fotos/prontas e controla quais já foram usadas.
- tools/checar.mjs: o portão de qualidade. Bloqueia repetição de tema, ideia, gancho, roteiro, fato, estrutura de slides e chamada numa janela de 30 dias (publicado e planejado, entre todas as automações), e barra frases gastas, travessão, número sem fonte, legenda fora do padrão e roteiro de vídeo que não soa falado.

ROTEIRO DA SESSÃO DE PUBLICAÇÃO
1. Repo: se a pasta não existir, `add_repo` (owner gabriellaroca, repo aciona-posts, access push) e clone; se existir, `git pull --rebase origin main`. `cd tools && npm ci` uma vez. Vídeo precisa de ffmpeg (`which ffmpeg`; se faltar, `apt-get install -y ffmpeg`).
2. Só na sessão das 08:20: atualize as métricas. Carregue `select:mcp__Windsor_ai__get_data` e peça ao conector `instagram` (conta 17841474648735800), últimos 30 dias, os campos media_id, date, media_type, media_product_type, media_reach, media_views, media_like_count, media_comments_count, media_saved, media_shares, media_follows, media_profile_visits, media_reel_avg_watch_time, media_reel_skip_rate. Salve as linhas num arquivo JSON fora do repo e rode `node tools/desempenho.mjs <arquivo>`. Commit de content/desempenho.json e content/aprendizados.md.
3. `node tools/proximo.mjs <fila>` (fila = stories_manha, carrosseis, stories_tarde ou posts). Ele pega o item da pauta de hoje, roda a checagem e renderiza.
   - Saída `{"bloqueado":true,...}`: o item falhou na checagem. Leia os `erros`, reescreva o item em content/pautas.json resolvendo cada um (outro ângulo, outro gancho, outro fato, outra chamada), sem fugir do quadro e da ideia do dia, e rode de novo. Até 3 tentativas; depois registre falha e pare.
   - Saída `{"vazia":true}`: não há pauta. Crie a pauta de hoje seguindo PLANEJAMENTO (passos 4 a 7, versão curta: só o dia de hoje) e rode de novo.
4. Revisão visual obrigatória: abra com Read todas as imagens (carrossel: todos os slides; vídeo: poster e 4 quadros extraídos com ffmpeg em 0 s, 25%, 50% e 90%). Dê nota de 1 a 5 em cada critério: originalidade, clareza (entende em 2 segundos?), qualidade visual (nada cortado, sobreposto ou apertado), coerência com a marca, potencial de interação, naturalidade do texto. Qualquer nota abaixo de 4: refaça o item (texto ou layout) e renderize de novo. Escreva as notas na resposta final.
5. Publique: `git add` da pasta gerada, commit e push. Carregue `select:mcp__Windsor_ai__execute_action` e use a ação em `acao` (conector instagram, conta 17841474648735800):
   - create_carousel_post: `urls` em ordem e `legenda`.
   - create_image_post: a url e a `legenda`.
   - create_story: `image_url` (imagem) ou `video_url` (vídeo). Se o vídeo falhar, tente `video_url_alt`; se falhar de novo, publique `poster_url` como imagem.
   - create_video_post: `video_url`, `cover_url` = `poster_url`, `legenda` e share_to_feed true. Se falhar, tente `video_url_alt`; se falhar de novo, registre falha.
   Antes, confirme que as URLs de imagem respondem 200 (curl -I, até 5 tentativas com 10 s). A url do jsDelivr pode não responder daqui; não bloqueie por isso.
6. Só com media id na resposta: `node tools/registrar.mjs <id> <media_id>` e commit/push de content/publicados.json, content/pautas.json e content/historico. Falha: acrescente `{"id","data","motivo"}` em content/falhas.json e faça commit.
7. Resposta final: uma linha com o que foi publicado (id, media id, notas da revisão) ou por que não foi.

PLANEJAMENTO SEMANAL (sábado 21:40; planeja os 7 dias seguintes ao último dia planejado)
1. Métricas: faça o passo 2 da publicação. Leia content/aprendizados.md e tire 3 a 5 decisões concretas para a semana (ex.: mais fotos reais, ganchos mais curtos nos Reels, quadro X rende pouco e muda de formato).
2. Pesquisa de mercado e tendências (WebSearch e WebFetch, pelo menos 8 buscas):
   - Tendências atuais de Instagram e Reels (mudanças de algoritmo, formatos em alta, duração, legendas, ganchos) em fontes confiáveis, priorizando anúncios oficiais do Instagram e da Meta.
   - Perfis de referência do segmento (content/referencias.json): confirme os @ oficiais, veja o que publicam e o que mais engaja. Se o conector `instagram_public` do Windsor estiver conectado, puxe os posts recentes desses perfis com curtidas e comentários. Anote formatos, ganchos, estrutura de roteiro, identidade visual e estratégias de engajamento que dá para ADAPTAR. Nunca copie texto, roteiro ou arte.
   - Notícias e sazonalidade da semana que tenham relação com o negócio: chuva e raios, férias, segurança, Anatel, mercado.
   - Escreva content/estudos/AAAA-MM-DD.md: o que aprendeu (com links), o que vai testar nesta semana e por quê.
3. Fatos novos: acrescente ao content/banco.json só o que você abriu e conferiu na fonte (id, area, tema, fato, fonte, url, conf, verificado = data de hoje). Nada de número sem fonte.
4. Fotos: rode `node tools/fotos.mjs`. Fotos livres são prioridade (foto real teve 8x mais alcance). Use em quadros de bastidores e instalação (layout photo, `img` = caminho em fotos/prontas, `ph` 0.64 no feed e 0.62 em story).
5. Monte as 7 pautas em content/pautas.json (id `sNN-dia`, um quadro por dia da semana). Cada pauta: tema inédito no mês, ideia em uma frase, 4 itens ligados entre si e com formatos diferentes. Na semana, pelo menos 2 Reels narrados, 1 story em vídeo, 1 conteúdo com foto real se houver foto livre, e 1 conteúdo pensado para síndicos.
6. Narração dos vídeos: `pip install --break-system-packages kokoro-onnx soundfile numpy`, baixe kokoro-v1.0.onnx e voices-v1.0.bin de https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/ numa pasta fora do repo e rode `KOKORO_DIR=<pasta> python3 tools/narrar.py`. Se existir gravação do dono em content/vozes/<id>_<n>.(m4a, mp3, ogg ou wav), ela é usada no lugar da voz sintética.
7. Rode `node tools/checar.mjs` até tudo dar OK. Renderize cada item com `SEM_CHECAGEM=1 node tools/proximo.mjs <fila> <id>` para revisar (faça a revisão visual do passo 4 da publicação). Apague as pastas renderizadas antes do commit (elas são geradas de novo na hora de publicar). Commit e push de pautas, banco, estudos, áudios novos.
8. Resposta final: resumo da semana planejada (tema e gancho de cada dia), decisões tiradas das métricas e o que veio da pesquisa.

QUADROS FIXOS (o público reconhece as séries)
0 Domingo leve (curiosidades, histórias, engenharia do mundo) · 1 Segunda sem susto (prevenção, manutenção baseada em manual) · 2 Tecnologia no portão (controle, segurança digital, automação) · 3 Por dentro do portão (como funciona, peças, bastidores reais) · 4 Segurança em casa (família, rua, normas, câmeras) · 5 Sextou com quiz (quiz que recapitula a semana, mitos) · 6 Escolha certa (comprar, contratar, proteger, chamar a aciona).
Arco da semana: atrair → educar → confiança → engajar → converter.

PADRÃO DE QUALIDADE
- Não diga o óbvio. Cada post precisa ensinar algo específico que a pessoa não sabia: número de manual, norma, caso real, comparação, cálculo. "Troque a pilha" e "chame um técnico" não são conteúdo.
- Gancho de até 8 palavras no primeiro slide, no primeiro quadro do vídeo e na primeira linha da legenda. Ele abre uma curiosidade que o post responde por inteiro.
- Uma ideia por tela, até cerca de 20 palavras por slide. Título carrega a mensagem; corpo explica. Laranja só no trecho a ler primeiro. Alterne fundos.
- Número, data, medida ou nome de estudo sempre com `fonte` na arte e o fato em `fatos`. Dado dos EUA ou da Europa diz de onde é.
- Legenda: primeira linha forte (até 125 caracteres), 2 a 4 parágrafos curtos, linguagem de conversa, no máximo 1 emoji, 3 a 5 hashtags específicas, WhatsApp (16) 99634-1354 no fim. Sem travessão.
- Chamada variada e útil (mandar foto da etiqueta, mandar para o síndico, comentar, salvar, WhatsApp, perfil). Nunca a mesma chamada em sequência.
- Stories têm função: de manhã provocam e anunciam; à tarde puxam conversa, mostram bastidor ou aprofundam. Não use molde repetido do tipo "NO FEED HOJE".
- Gatilhos permitidos: curiosidade, pergunta direta, desafio, identificação, risco real e proporcional, história, número com fonte, reciprocidade, autoridade técnica. Proibido: urgência falsa, medo exagerado, dado inventado, prova social inexistente, clickbait que não entrega.

VÍDEOS NATURAIS
- Roteiro escrito para ser falado: frases curtas (até 20 palavras, a primeira até 12), ordem direta, "a gente", "pra", "tá", perguntas reais. Nada de "neste vídeo", "você sabia que", introdução ou despedida. Números por extenso na fala.
- O primeiro quadro já mostra o gancho (o motor de vídeo faz isso). A primeira frase falada é o gancho. Reels de 20 a 35 s; stories em vídeo de 8 a 20 s; 3 a 5 cenas.
- Legenda na tela é automática e sincronizada com a fala; deixe a parte de baixo da arte livre (o motor reserva o espaço).
- Revise o vídeo ouvindo a lógica do roteiro: se uma frase soaria estranha dita em voz alta, reescreva.
- Melhor ainda é a voz do dono: se ele mandar gravações em content/vozes, use.

MARCA E LIMITES
- Nome sempre em minúsculas, "aciona". Fonte Outfit. Cores: navy #0B1F3A, laranja #EE3E1E, branco, névoa #F1F3F7, aço #7C879B. Laranja só como destaque. Sem sombra nem efeito. Layouts de tools/layout.js: cover, step, bullets, checklist, compare, cta, statement, quote, myth, services, notice, bignum, quiz, reveal, glossary, flow, chat, anatomy, fact, timeline, dodont, save, bars (gráfico de barras com fonte), photo (foto real), promo, poll. Pode criar layout novo no mesmo estilo quando fizer sentido.
- Dados reais: @aciona.portoes, WhatsApp (16) 99634-1354, acionaportoes.com.br. Não invente preço, prazo, garantia, endereço, cidade de atendimento, depoimento, número de clientes, selo ou certificação. Não prometa orçamento grátis, visita grátis ou desconto.
- Dica sempre segura: nada que peça abrir o motor, mexer em fiação ou em mola. Em ataque digital, explique o risco e a proteção, nunca o passo a passo do ataque.
- Não segue, não curte, não responde mensagens e não apaga publicações.
